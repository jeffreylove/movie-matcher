-- Drop the unique constraint on username
ALTER TABLE profiles DROP CONSTRAINT IF EXISTS profiles_username_key;

-- Add a new unique constraint on id only
ALTER TABLE profiles ADD CONSTRAINT profiles_id_key UNIQUE (id);
