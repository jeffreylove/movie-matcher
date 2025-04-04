-- Add more family-friendly movies to the database (Part 3)
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
    ('The Mitchells vs. the Machines', 'A quirky, dysfunctional family''s road trip is upended when they find themselves in the middle of the robot apocalypse and suddenly become humanity''s unlikeliest last hope.', '/7AWHyvPxP7QlU8Gn3suhLHWkXWx.jpg', '2021-04-23', 7.7, 98, ARRAY['Animation', 'Adventure', 'Comedy', 'Family', 'Science Fiction'], '{"Netflix": true}'),
    ('Moana', 'In Ancient Polynesia, when a terrible curse incurred by Maui reaches an impetuous Chieftain''s daughter''s island, she answers the Ocean''s call to seek out the demigod to set things right.', '/4JeejGugONWpJkbnvL12hVoYEDa.jpg', '2016-11-23', 7.6, 95, ARRAY['Animation', 'Adventure', 'Family', 'Fantasy'], '{"Disney+": true}'),
    ('The Muppet Christmas Carol', 'A retelling of the classic Dickens tale of Ebenezer Scrooge, miser extraordinaire. He is held accountable for his dastardly ways during night-time visitations by the Ghosts of Christmas Past, Present, and future.', '/h9YwYdQQCx1LMy7fZYN9zhPz1yq.jpg', '1992-12-11', 7.7, 76, ARRAY['Comedy', 'Drama', 'Family', 'Fantasy'], '{"Disney+": true}'),
    ('The Nightmare Before Christmas', 'Tired of scaring humans every October 31 with the same old bag of tricks, Jack Skellington, the spindly king of Halloween Town, kidnaps Santa Claus and plans to deliver shrunken heads and other ghoulish gifts to children on Christmas morning.', '/oQffRNjK8e19rF7xVYEN8ew0j7b.jpg', '1993-10-09', 7.9, 95, ARRAY['Animation', 'Fantasy', 'Family'], '{"Disney+": true}'),
    ('Nimona', 'A knight framed for a tragic crime teams with a scrappy, shape-shifting teen to prove his innocence. But what if she''s the monster he''s sworn to destroy?', '/2NQljeavtfl22207D1kxLpa4LS3.jpg', '2023-06-23', 7.6, 94, ARRAY['Animation', 'Fantasy', 'Adventure'], '{"Netflix": true}'),
    ('Orion and the Dark', 'A boy with an active imagination faces his fears on an unforgettable journey through the night with his new friend: a giant, smiling creature named Dark.', '/k6iHs4daxm0RQqFQsE8oE3WEwHx.jpg', '2024-02-02', 6.8, 86, ARRAY['Animation', 'Adventure', 'Comedy', 'Family'], '{"Netflix": true}'),
    ('Paddington', 'A young Peruvian bear travels to London in search of a home. Finding himself lost and alone at Paddington Station, he meets the kindly Brown family, who offer him a temporary haven.', '/hfjfjYsTBHgfogLWWiTm5OP7KpD.jpg', '2014-11-28', 7.2, 97, ARRAY['Comedy', 'Family'], '{"Netflix": true}'),
    ('Paddington 2', 'Paddington, now happily settled with the Browns, picks up a series of odd jobs to buy the perfect present for his Aunt Lucy, but it is stolen.', '/1OLMtDrYaUh4ZyxF1VhkyMYa0KZ.jpg', '2017-11-10', 7.8, 100, ARRAY['Adventure', 'Comedy', 'Family'], '{"Netflix": true}'),
    ('The Portable Door', 'Paul Carpenter, a new intern at a mysterious London firm, must discover the truth about his employers before it''s too late.', '/nS7LM4RvNS3YtEQNztwsWUpHtJt.jpg', '2023-04-07', 6.2, 83, ARRAY['Fantasy', 'Comedy'], '{"Prime Video": true}'),
    ('Puss in Boots: The Last Wish', 'Puss in Boots discovers that his passion for adventure has taken its toll: He has burned through eight of his nine lives, leaving him with only one life left.', '/kuf6dutpsT0vSVehic3EZIqkOBt.jpg', '2022-12-21', 7.9, 95, ARRAY['Animation', 'Adventure', 'Family', 'Fantasy'], '{"Netflix": true, "Prime Video": true}'),
    ('Secret Magic Control Agency', 'The Secret Magic Control Agency sends its two best agents, Hansel and Gretel, to fight against the witch of the Gingerbread House.', '/4ZSzEDVdxWVMVO4oZDvMQvzdfkg.jpg', '2021-03-18', 6.8, NULL, ARRAY['Animation', 'Adventure', 'Family', 'Fantasy'], '{"Netflix": true}'),
    ('The Secret of Kells', 'Adventure awaits 12 year old Brendan who must fight Vikings and a serpent god to find a crystal and complete the legendary Book of Kells. In order to finish Brother Aidan''s book, Brendan must overcome his deepest fears on a secret quest that will take him beyond the abbey walls and into the enchanted forest where dangerous secrets await him.', '/9rDqOtqHNZOxC4PLAyHSVuRRXOm.jpg', '2009-02-11', 7.6, 91, ARRAY['Animation', 'Family', 'Fantasy'], '{"Prime Video": true}'),
    ('Spirited Away', 'A young girl, Chihiro, becomes trapped in a strange new world of spirits. When her parents undergo a mysterious transformation, she must call upon the courage she never knew she had to free her family.', '/39wmItIWsg5sZMyRUHLkWBcuVCM.jpg', '2001-07-20', 8.6, 97, ARRAY['Animation', 'Family', 'Fantasy'], '{"Netflix": true, "HBO Max": true}'),
    ('Spy Kids', 'Carmen and Juni think their parents are boring. Little do they know that in their day, Gregorio and Ingrid Cortez were the top secret agents from their respective countries. They gave up that life to raise their children. Now, the disappearances of several of their old colleagues forces them back into the game.', '/rYMMF8UJqohuhQHg1VhQoSL1gN6.jpg', '2001-03-30', 5.5, 93, ARRAY['Action', 'Adventure', 'Comedy', 'Family'], '{"Netflix": true}'),
    ('Strange World', 'A journey deep into an uncharted and treacherous land, where fantastical creatures await the legendary Clades—a family of explorers whose differences threaten to topple their latest, and by far most crucial, mission.', '/fHMqfsYyl3lskPK2RiFRyZF6IGh.jpg', '2022-11-23', 6.3, 72, ARRAY['Animation', 'Science Fiction', 'Adventure', 'Family'], '{"Disney+": true}'),
    ('Swallows and Amazons', 'Four children dream of escaping the tedium of a summer holiday with their mother. When finally given permission to camp on their own on an island in the middle of a vast lake, they are overjoyed. But when they get there they discover they may not be alone.', '/hAZO3hvLQVEKJqCnxJGvhxXXozL.jpg', '2016-08-19', 6.2, 92, ARRAY['Adventure', 'Family'], '{"Prime Video": true}'),
    ('Turning Red', 'Thirteen-year-old Mei is experiencing the awkwardness of being a teenager with a twist – when she gets too excited, she transforms into a giant red panda.', '/qsdjk9oAKSQMWs0Vt5Pyfh6O4GZ.jpg', '2022-03-10', 7.4, 95, ARRAY['Animation', 'Family', 'Comedy', 'Fantasy'], '{"Disney+": true}'),
    ('WALL·E', 'WALL·E is the last robot left on an Earth that has been overrun with garbage and all humans have fled to space. For 700 years he has continued to try and clean up the mess, but has developed some rather interesting human-like qualities. When a ship arrives with a sleek new type of robot, WALL·E thinks he''s finally found a friend and stows away on the ship when it leaves.', '/hbhFnRzzg6ZDmm8YAmxBnQpQIPh.jpg', '2008-06-22', 8.4, 95, ARRAY['Animation', 'Family', 'Science Fiction'], '{"Disney+": true}'),
    ('Wish', 'Asha, a sharp-witted idealist, makes a wish so powerful that it is answered by a cosmic force—a little ball of boundless energy called Star. Together, Asha and Star confront a most formidable foe—the ruler of Rosas, King Magnifico—to save her community and prove that when the will of one courageous human connects with the magic of the stars, wondrous things can happen.', '/AcoVfiv1rrWOmAdpnAMnM56ki19.jpg', '2023-11-22', 6.6, 50, ARRAY['Animation', 'Family', 'Fantasy'], '{"Disney+": true}')
) AS m(title, overview, poster_path, release_date, imdb_rating, rt_rating, genres, streaming_services)
WHERE NOT EXISTS (
  SELECT 1 FROM movies e 
  WHERE e.title ILIKE m.title
);
