-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create custom types
CREATE TYPE session_status AS ENUM ('active', 'completed');
CREATE TYPE swipe_type AS ENUM ('left', 'right');

-- Create profiles table (extends Supabase auth.users)
CREATE TABLE profiles (
    id UUID REFERENCES auth.users(id) PRIMARY KEY,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    username TEXT UNIQUE,
    avatar_url TEXT
);

-- Create sessions table
CREATE TABLE sessions (
    id CHAR(6) PRIMARY KEY,  -- 6-digit room code
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    user1_id UUID REFERENCES profiles(id) NOT NULL,
    user2_id UUID REFERENCES profiles(id),
    status session_status DEFAULT 'active',
    filters JSONB DEFAULT '{
        "genres": [],
        "year_start": null,
        "year_end": null,
        "streaming_services": [],
        "min_rating": null
    }'::jsonb,
    CONSTRAINT different_users CHECK (user1_id != user2_id)
);

-- Create movies table (cache of movie data from TMDb/JustWatch)
CREATE TABLE movies (
    id TEXT PRIMARY KEY,  -- TMDb ID
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    title TEXT NOT NULL,
    poster_path TEXT,
    overview TEXT,
    release_date DATE,
    genres TEXT[],
    imdb_rating DECIMAL(3,1),
    rt_rating INTEGER,
    streaming_services JSONB,
    last_updated TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Create swipes table
CREATE TABLE swipes (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    session_id CHAR(6) REFERENCES sessions(id) ON DELETE CASCADE,
    user_id UUID REFERENCES profiles(id),
    movie_id TEXT REFERENCES movies(id),
    swipe swipe_type NOT NULL
);

-- Create matches table
CREATE TABLE matches (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    session_id CHAR(6) REFERENCES sessions(id) ON DELETE CASCADE,
    movie_id TEXT REFERENCES movies(id),
    UNIQUE(session_id, movie_id)
);

-- Create function to check for matches
CREATE OR REPLACE FUNCTION check_for_match()
RETURNS TRIGGER AS $$
BEGIN
    -- If both users have swiped right on the same movie in the same session
    IF EXISTS (
        SELECT 1 FROM swipes s1
        JOIN swipes s2 ON s1.session_id = s2.session_id 
            AND s1.movie_id = s2.movie_id
        JOIN sessions sess ON s1.session_id = sess.id
        WHERE s1.user_id = sess.user1_id 
            AND s2.user_id = sess.user2_id
            AND s1.swipe = 'right'
            AND s2.swipe = 'right'
            AND s1.session_id = NEW.session_id
            AND s1.movie_id = NEW.movie_id
            AND NOT EXISTS (
                SELECT 1 FROM matches 
                WHERE session_id = NEW.session_id 
                AND movie_id = NEW.movie_id
            )
    ) THEN
        -- Create a new match
        INSERT INTO matches (session_id, movie_id)
        VALUES (NEW.session_id, NEW.movie_id);
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for match checking
CREATE TRIGGER check_match_trigger
AFTER INSERT ON swipes
FOR EACH ROW
EXECUTE FUNCTION check_for_match();

-- Create indexes for better performance
CREATE INDEX idx_swipes_session_movie ON swipes(session_id, movie_id);
CREATE INDEX idx_matches_session ON matches(session_id);
CREATE INDEX idx_movies_streaming ON movies USING GIN (streaming_services);
CREATE INDEX idx_movies_genres ON movies USING GIN (genres);

-- Create RLS policies
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE swipes ENABLE ROW LEVEL SECURITY;
ALTER TABLE matches ENABLE ROW LEVEL SECURITY;
ALTER TABLE movies ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Public profiles are viewable by everyone"
ON profiles FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Users can insert their own profile"
ON profiles FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update own profile"
ON profiles FOR UPDATE
TO authenticated
USING (auth.uid() = id);

-- Sessions policies
CREATE POLICY "Sessions are viewable by participants"
ON sessions FOR SELECT
TO authenticated
USING (
    auth.uid() = user1_id OR 
    auth.uid() = user2_id
);

CREATE POLICY "Any user can create a session"
ON sessions FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user1_id);

CREATE POLICY "Session participants can update session"
ON sessions FOR UPDATE
TO authenticated
USING (
    auth.uid() = user1_id OR 
    auth.uid() = user2_id
);

-- Swipes policies
CREATE POLICY "Swipes are viewable by session participants"
ON swipes FOR SELECT
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM sessions
        WHERE id = session_id
        AND (user1_id = auth.uid() OR user2_id = auth.uid())
    )
);

CREATE POLICY "Users can insert their own swipes"
ON swipes FOR INSERT
TO authenticated
WITH CHECK (
    auth.uid() = user_id AND
    EXISTS (
        SELECT 1 FROM sessions
        WHERE id = session_id
        AND (user1_id = auth.uid() OR user2_id = auth.uid())
    )
);

-- Matches policies
CREATE POLICY "Matches are viewable by session participants"
ON matches FOR SELECT
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM sessions
        WHERE id = session_id
        AND (user1_id = auth.uid() OR user2_id = auth.uid())
    )
);

-- Movies policies
CREATE POLICY "Movies are viewable by everyone"
ON movies FOR SELECT
TO authenticated
USING (true);

-- Functions for session management
CREATE OR REPLACE FUNCTION generate_unique_room_code()
RETURNS CHAR(6) AS $$
DECLARE
    chars TEXT := 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    result CHAR(6);
    done BOOLEAN;
BEGIN
    done := FALSE;
    WHILE NOT done LOOP
        result := '';
        FOR i IN 1..6 LOOP
            result := result || substr(chars, floor(random() * length(chars) + 1)::integer, 1);
        END LOOP;
        done := NOT EXISTS(SELECT 1 FROM sessions WHERE id = result);
    END LOOP;
    RETURN result;
END;
$$ LANGUAGE plpgsql;

-- Function to join session
CREATE OR REPLACE FUNCTION join_session(room_code CHAR(6), joining_user_id UUID)
RETURNS BOOLEAN AS $$
DECLARE
    session_record sessions%ROWTYPE;
BEGIN
    -- Get session and lock it
    SELECT * INTO session_record
    FROM sessions
    WHERE id = room_code
    FOR UPDATE;

    -- Check if session exists and is joinable
    IF session_record.id IS NULL THEN
        RETURN FALSE;
    END IF;

    IF session_record.user2_id IS NOT NULL THEN
        RETURN FALSE;
    END IF;

    -- Update session with second user
    UPDATE sessions
    SET user2_id = joining_user_id,
        updated_at = NOW()
    WHERE id = room_code;

    RETURN TRUE;
END;
$$ LANGUAGE plpgsql;
