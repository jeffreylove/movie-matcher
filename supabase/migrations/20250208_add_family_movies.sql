-- Add family-friendly movies to the database
INSERT INTO movies (
  title,
  overview,
  poster_path,
  release_date,
  imdb_rating,
  rt_rating,
  genres,
  streaming_services
)
SELECT
  m.title,
  m.overview,
  m.poster_path,
  m.release_date::date,
  m.imdb_rating,
  m.rt_rating,
  m.genres,
  m.streaming_services
FROM (
  VALUES
    ('Arthur Christmas', 'Santa''s clumsy son Arthur sets out on a mission with St. Nick''s father to give out a present they misplaced to a young girl in less than 2 hours.', '/ArqW3JRzVhJ9YY1A4l4gvlXLQWb.jpg', '2011-11-23', 7.1, 92, ARRAY['Animation', 'Comedy', 'Family'], '{"Netflix": true}'),
    ('Back to the Future', 'Marty McFly, a 17-year-old high school student, is accidentally sent thirty years into the past in a time-traveling DeLorean invented by his close friend, the eccentric scientist Doc Brown.', '/fNOH9f1aA7XRTzl1sAOx9iF553Q.jpg', '1985-07-03', 8.5, 96, ARRAY['Adventure', 'Comedy', 'Science Fiction'], '{"Netflix": true}'),
    ('Bend It Like Beckham', 'Jess Bhamra, the daughter of a strict Indian couple in London, is not permitted to play organized soccer, even though she is 18. When Jess is playing for fun one day, her impressive skills are seen by Jules Paxton, who then convinces Jess to play for her semi-pro team.', '/9f3PlqXvCKqaVm6HGqQiF0uYX0J.jpg', '2002-04-11', 6.7, 85, ARRAY['Comedy', 'Drama'], '{"Prime Video": true}'),
    ('Elf', 'When young Buddy falls into Santa''s gift sack on Christmas Eve, he''s transported back to the North Pole and raised as a toy-making elf by Santa''s helpers. But as he grows into adulthood, he can''t shake the nagging feeling that he doesn''t belong.', '/aJCtkxLLzkk1pECehVjKHA2lBgw.jpg', '2003-10-09', 7.0, 85, ARRAY['Comedy', 'Family', 'Fantasy'], '{"HBO Max": true}'),
    ('Enola Holmes 2', 'Now a detective-for-hire like her infamous brother, Enola Holmes takes on her first official case to find a missing girl, as the sparks of a dangerous conspiracy ignite a mystery that requires the help of friends - and Sherlock himself - to unravel.', '/tegBpjM5ODoYoM1NjaiHVLEA0QM.jpg', '2022-11-04', 6.8, 94, ARRAY['Adventure', 'Comedy', 'Mystery'], '{"Netflix": true}'),
    ('Finding Nemo', 'Nemo, an adventurous young clownfish, is unexpectedly taken from his Great Barrier Reef home to a dentist''s office aquarium. It''s up to his worrisome father Marlin and a friendly but forgetful fish Dory to bring Nemo home.', '/eHuGQ10FUzK1mdOY69wF5pGgEf5.jpg', '2003-05-30', 8.1, 99, ARRAY['Animation', 'Family'], '{"Disney+": true}'),
    ('Flight of the Navigator', 'A 12-year-old boy goes missing in 1978, only to reappear once more in 1986. In the eight years that have passed, he hasn''t aged a day. This is no ordinary time travel; something far more sinister is at work.', '/4KrEVtcbqtBPq3sTZZKbTbZzgww.jpg', '1986-07-30', 6.9, 84, ARRAY['Adventure', 'Family', 'Science Fiction'], '{"Disney+": true}'),
    ('Frozen', 'Young princess Anna of Arendelle dreams about finding true love at her sister Elsa''s coronation. Fate takes her on a dangerous journey in an attempt to end the eternal winter that has fallen over the kingdom.', '/kgwjIb2JDHRhNk13lmSxiClFjVk.jpg', '2013-11-27', 7.4, 90, ARRAY['Animation', 'Adventure', 'Family'], '{"Disney+": true}'),
    ('The Greatest Showman', 'The story of American showman P.T. Barnum, founder of the circus that became the famous traveling Ringling Bros. and Barnum & Bailey Circus.', '/b4CeB5rp3s5dHK5lL6O4EYz6qQZ.jpg', '2017-12-20', 7.5, 57, ARRAY['Drama', 'Music'], '{"Disney+": true, "HBO Max": true}'),
    ('The Grinch', 'The Grinch hatches a scheme to ruin Christmas when the residents of Whoville plan their annual holiday celebration.', '/1Bc9VNd9CIHIyI05ZhFNBgI0XnC.jpg', '2018-11-08', 6.9, 59, ARRAY['Animation', 'Family', 'Comedy'], '{"Netflix": true}')
    -- Continued in next chunk due to length...
) AS m(title, overview, poster_path, release_date, imdb_rating, rt_rating, genres, streaming_services)
WHERE NOT EXISTS (
  SELECT 1 FROM movies e 
  WHERE e.title ILIKE m.title
);
