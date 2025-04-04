-- Add more family-friendly movies to the database (Part 2)
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
    ('Hairspray', 'Pleasantly plump teenager Tracy Turnblad auditions to be on Baltimore''s most popular dance show - The Corny Collins Show - and lands a prime spot. Through her newfound fame, she becomes determined to help her friends and end the racial segregation that has been a staple of the show.', '/uYtxWkyWh7GvC1J9F9GhqE8WTYh.jpg', '2007-07-19', 6.7, 91, ARRAY['Comedy', 'Drama', 'Music'], '{"Netflix": true}'),
    ('Harry Potter and the Sorcerer''s Stone', 'Harry Potter has lived under the stairs at his aunt and uncle''s house his whole life. But on his 11th birthday, he learns he''s a powerful wizard -- with a place waiting for him at the Hogwarts School of Witchcraft and Wizardry.', '/wuMc08IPKEatf9rnMNXvIDxqP4W.jpg', '2001-11-16', 7.6, 81, ARRAY['Adventure', 'Fantasy'], '{"HBO Max": true}'),
    ('Home Alone', 'Eight-year-old Kevin McCallister makes the most of the situation after his family unwittingly leaves him behind when they go on Christmas vacation. But when a pair of bungling burglars set their sights on Kevin''s house, the plucky kid stands ready to defend his territory.', '/9wSbe4CwObACCQvaUVhWQyLR5Vz.jpg', '1990-11-16', 7.3, 66, ARRAY['Comedy', 'Family'], '{"Disney+": true}'),
    ('Honey, I Shrunk the Kids', 'The scientist father of a teenage girl and boy accidentally shrinks his and two other neighborhood teens to the size of insects. Now the teens must fight diminutive dangers as the father searches for them.', '/d6EZQOc02YD8c79P7kGhKU4Uls8.jpg', '1989-06-23', 6.4, 77, ARRAY['Adventure', 'Comedy', 'Family', 'Science Fiction'], '{"Disney+": true}'),
    ('How to Train Your Dragon 2', 'The thrilling second chapter of the epic How To Train Your Dragon trilogy brings back the fantastical world of Hiccup and Toothless five years later.', '/d13Uj3cQ0LqW4yC5dFDU3hKJ0DP.jpg', '2014-06-12', 7.8, 91, ARRAY['Fantasy', 'Action', 'Adventure', 'Animation', 'Family'], '{"Netflix": true}'),
    ('In the Heights', 'The story of Usnavi, a bodega owner who has mixed feelings about closing his store and retiring to the Dominican Republic or staying in Washington Heights.', '/7D430eqZj8y3oVkLFfsWXGRcpEG.jpg', '2021-06-10', 7.3, 94, ARRAY['Drama', 'Music', 'Romance'], '{"HBO Max": true}'),
    ('The Incredibles', 'Bob Parr has given up his superhero days to log in time as an insurance adjuster and raise his three children with his formerly heroic wife in suburbia. But when he receives a mysterious assignment, it''s time to get back into costume.', '/2LqaLgk4Z226KkgPJuiOQ58wvrm.jpg', '2004-11-05', 8.0, 97, ARRAY['Animation', 'Action', 'Adventure', 'Family'], '{"Disney+": true}'),
    ('Inside Out', 'Growing up can be a bumpy road, and it''s no exception for Riley, who is uprooted from her Midwest life when her father starts a new job in San Francisco. Riley''s guiding emotions— Joy, Fear, Anger, Disgust and Sadness—live in Headquarters, the control centre inside Riley''s mind, where they help advise her through everyday life.', '/lRHE0vzf3oYJrhbsHXjIkF4Tl5A.jpg', '2015-06-17', 8.0, 98, ARRAY['Animation', 'Family', 'Adventure'], '{"Disney+": true}'),
    ('Jingle Jangle: A Christmas Journey', 'An imaginary world comes to life in a holiday tale of an eccentric toymaker, his adventurous granddaughter, and a magical invention that has the power to change their lives forever.', '/5RbyHIVydD3Krmec1LlUV7rRjet.jpg', '2020-11-06', 6.7, 89, ARRAY['Family', 'Fantasy', 'Music'], '{"Netflix": true}'),
    ('The Jungle Book', 'After a threat from the tiger Shere Khan forces him to flee the jungle, a man-cub named Mowgli embarks on a journey of self discovery with the help of panther Bagheera and free-spirited bear Baloo.', '/vOipe2myi26UDwP978hsYOrnUWC.jpg', '2016-04-14', 7.4, 94, ARRAY['Adventure', 'Drama', 'Family', 'Fantasy'], '{"Disney+": true}'),
    ('Klaus', 'When Jesper distinguishes himself as the postal academy''s worst student, he is stationed on a frozen island above the Arctic Circle, where the feuding locals hardly exchange words let alone letters. Jesper is about to give up when he finds an ally in local teacher Alva, and discovers Klaus, a mysterious carpenter who lives alone in a cabin full of handmade toys.', '/q125RHUDgR4gjwh1QkfYuJLYkL.jpg', '2019-11-08', 8.2, 94, ARRAY['Animation', 'Adventure', 'Comedy', 'Family'], '{"Netflix": true}'),
    ('Kubo and the Two Strings', 'Kubo mesmerizes the people in his village with his magical gift for spinning wild tales with origami. When he accidentally summons an evil spirit seeking vengeance, Kubo is forced to go on a quest to solve the mystery of his fallen samurai father and his mystical weaponry, as well as discover his own magical powers.', '/la6QA3Vt2lY3Kxk4BPyuK2DRhwZ.jpg', '2016-08-18', 7.7, 97, ARRAY['Animation', 'Adventure', 'Family', 'Fantasy'], '{"Netflix": true}'),
    ('The LEGO Movie', 'An ordinary Lego mini-figure, mistakenly thought to be the extraordinary MasterBuilder, is recruited to join a quest to stop an evil Lego tyrant from gluing the universe together.', '/9klB7qKC9aCeGyyM4uU5hqFaFqT.jpg', '2014-02-06', 7.7, 96, ARRAY['Adventure', 'Animation', 'Comedy', 'Family', 'Fantasy'], '{"Netflix": true}'),
    ('Little Big League', 'When the owner of the Minnesota Twins passes away, he bequeaths the team to his preteen grandson. The newly minted head honcho quickly appoints himself manager, causing unrest in an organisation that won''t take orders from a 12-year-old.', '/zYapVeRKwQF7ae6K2h4J1QHujUK.jpg', '1994-06-29', 6.2, 33, ARRAY['Comedy', 'Family'], '{"Netflix": true}'),
    ('Men in Black', 'After a police chase with an otherworldly being, a New York City cop is recruited as an agent in a top-secret organization established to monitor and police alien activity on Earth: the Men in Black.', '/f24UVKq3UiQWLqGWdqjwpyaFq9T.jpg', '1997-07-02', 7.3, 92, ARRAY['Action', 'Adventure', 'Comedy', 'Science Fiction'], '{"Netflix": true}')
    -- Continued in part 3...
) AS m(title, overview, poster_path, release_date, imdb_rating, rt_rating, genres, streaming_services)
WHERE NOT EXISTS (
  SELECT 1 FROM movies e 
  WHERE e.title ILIKE m.title
);
