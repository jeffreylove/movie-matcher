-- Drop existing policies
DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON profiles;
DROP POLICY IF EXISTS "Users can insert their own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
DROP POLICY IF EXISTS "Users can upsert their own profile" ON profiles;
DROP POLICY IF EXISTS "Sessions are viewable by participants" ON sessions;
DROP POLICY IF EXISTS "Any user can create a session" ON sessions;
DROP POLICY IF EXISTS "Session participants can update session" ON sessions;
DROP POLICY IF EXISTS "Swipes are viewable by session participants" ON swipes;
DROP POLICY IF EXISTS "Users can insert their own swipes" ON swipes;
DROP POLICY IF EXISTS "Matches are viewable by session participants" ON matches;
DROP POLICY IF EXISTS "Movies are viewable by everyone" ON movies;

-- Disable RLS on all tables
ALTER TABLE profiles DISABLE ROW LEVEL SECURITY;
ALTER TABLE sessions DISABLE ROW LEVEL SECURITY;
ALTER TABLE swipes DISABLE ROW LEVEL SECURITY;
ALTER TABLE matches DISABLE ROW LEVEL SECURITY;
ALTER TABLE movies DISABLE ROW LEVEL SECURITY;
