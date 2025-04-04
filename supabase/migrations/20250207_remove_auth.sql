-- Part 1: Drop everything in reverse dependency order
BEGIN;

-- Enable necessary extensions first
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Drop everything in reverse dependency order
DROP TRIGGER IF EXISTS check_match_trigger ON swipes;
DROP FUNCTION IF EXISTS check_for_match();
DROP TABLE IF EXISTS matches CASCADE;
DROP TABLE IF EXISTS swipes CASCADE;
DROP TABLE IF EXISTS sessions CASCADE;
DROP TABLE IF EXISTS profiles CASCADE;
DROP TABLE IF EXISTS movies CASCADE;

-- Drop types last since they might be used by other objects
DROP TYPE IF EXISTS session_status CASCADE;
DROP TYPE IF EXISTS swipe_type CASCADE;

COMMIT;

-- Part 2: Create everything in dependency order
BEGIN;

-- Create types first
CREATE TYPE session_status AS ENUM ('active', 'completed');
CREATE TYPE swipe_type AS ENUM ('left', 'right');

-- Create movies table first (since it's referenced by other tables)
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

-- Recreate profiles table without auth dependency
CREATE TABLE profiles (
    id UUID PRIMARY KEY,
    username TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Recreate sessions table
CREATE TABLE sessions (
    id CHAR(6) PRIMARY KEY,
    user1_id UUID REFERENCES profiles(id),
    user2_id UUID REFERENCES profiles(id),
    status session_status DEFAULT 'active',
    filters JSONB DEFAULT '{
        "genres": [],
        "year_start": null,
        "year_end": null,
        "streaming_services": [],
        "min_rating": null
    }'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    CONSTRAINT different_users CHECK (user1_id != user2_id)
);

-- Recreate swipes table
CREATE TABLE swipes (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    session_id CHAR(6) REFERENCES sessions(id) ON DELETE CASCADE,
    user_id UUID REFERENCES profiles(id),
    movie_id TEXT REFERENCES movies(id),
    swipe swipe_type NOT NULL
);

-- Recreate matches table
CREATE TABLE matches (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    session_id CHAR(6) REFERENCES sessions(id) ON DELETE CASCADE,
    movie_id TEXT REFERENCES movies(id),
    UNIQUE(session_id, movie_id)
);

-- Recreate the match checking trigger
CREATE OR REPLACE FUNCTION check_for_match()
RETURNS TRIGGER AS $$
DECLARE
    match_exists BOOLEAN;
    other_swipe_exists BOOLEAN;
BEGIN
    -- Log the incoming swipe
    RAISE LOG 'check_for_match triggered for session: %, movie: %, user: %, swipe: %', 
        NEW.session_id, NEW.movie_id, NEW.user_id, NEW.swipe;

    -- First check if a match already exists
    SELECT EXISTS (
        SELECT 1 FROM matches 
        WHERE session_id = NEW.session_id 
        AND movie_id = NEW.movie_id
    ) INTO match_exists;

    IF match_exists THEN
        RAISE LOG 'Match already exists for session: %, movie: %', 
            NEW.session_id, NEW.movie_id;
        RETURN NEW;
    END IF;

    -- Then check for matching swipe from other user
    SELECT EXISTS (
        SELECT 1 FROM swipes s1
        JOIN sessions sess ON s1.session_id = sess.id
        WHERE s1.session_id = NEW.session_id 
        AND s1.movie_id = NEW.movie_id
        AND s1.swipe = 'right'
        AND s1.user_id != NEW.user_id
        AND (
            (NEW.user_id = sess.user1_id AND s1.user_id = sess.user2_id)
            OR 
            (NEW.user_id = sess.user2_id AND s1.user_id = sess.user1_id)
        )
    ) INTO other_swipe_exists;

    RAISE LOG 'Other user right swipe exists: % for session: %, movie: %', 
        other_swipe_exists, NEW.session_id, NEW.movie_id;

    IF other_swipe_exists AND NEW.swipe = 'right' THEN
        -- Create a match
        INSERT INTO matches (session_id, movie_id)
        VALUES (NEW.session_id, NEW.movie_id);
        
        RAISE LOG 'Created match for session: %, movie: %', 
            NEW.session_id, NEW.movie_id;
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create the trigger
CREATE TRIGGER check_match_trigger
    AFTER INSERT ON swipes
    FOR EACH ROW
    EXECUTE FUNCTION check_for_match();

-- Enable replication and realtime for matches table
ALTER TABLE matches REPLICA IDENTITY FULL;
ALTER PUBLICATION supabase_realtime ADD TABLE matches;

COMMIT;
