-- Insert the default user into auth.users
INSERT INTO auth.users (id, email, created_at, updated_at)
VALUES ('00000000-0000-0000-0000-000000000000', 'default@example.com', NOW(), NOW())
ON CONFLICT (id) DO NOTHING;

-- Insert the default profile
INSERT INTO profiles (id, username, created_at, updated_at)
VALUES ('00000000-0000-0000-0000-000000000000', 'Movie Lover', NOW(), NOW())
ON CONFLICT (id) DO NOTHING;
