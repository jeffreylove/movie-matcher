-- Check if movies table exists
SELECT EXISTS (
  SELECT FROM information_schema.tables 
  WHERE table_schema = 'public' 
  AND table_name = 'movies'
);

-- Count total movies
SELECT COUNT(*) as total_movies FROM movies;

-- Show all movies with their details
SELECT id, title, imdb_rating, genres, streaming_services 
FROM movies 
ORDER BY imdb_rating DESC;
