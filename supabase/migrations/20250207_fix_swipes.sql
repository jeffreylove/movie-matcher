-- Drop the swipes table and its dependencies
DROP TRIGGER IF EXISTS check_match_trigger ON swipes;
DROP TABLE IF EXISTS matches CASCADE;
DROP TABLE IF EXISTS swipes CASCADE;

-- Recreate swipes table without the unique constraint
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
        -- Create a match
        INSERT INTO matches (session_id, movie_id)
        VALUES (NEW.session_id, NEW.movie_id);
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create the trigger
CREATE TRIGGER check_match_trigger
    AFTER INSERT ON swipes
    FOR EACH ROW
    EXECUTE FUNCTION check_for_match();
