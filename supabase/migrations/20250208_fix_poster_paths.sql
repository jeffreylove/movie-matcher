-- Fix poster paths to use full TMDB image URLs
UPDATE movies 
SET poster_path = CASE 
  WHEN poster_path LIKE '/%' THEN 'https://image.tmdb.org/t/p/w500' || poster_path
  WHEN poster_path NOT LIKE 'http%' THEN 'https://image.tmdb.org/t/p/w500/' || poster_path
  ELSE poster_path
END
WHERE poster_path IS NOT NULL;
