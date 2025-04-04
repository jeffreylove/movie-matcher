-- Insert sample movies
INSERT INTO movies (id, title, poster_path, overview, release_date, genres, imdb_rating, rt_rating, streaming_services)
VALUES
  ('tt0111161', 'The Shawshank Redemption', 'https://m.media-amazon.com/images/M/MV5BNDE3ODcxYzMtY2YzZC00NmNlLWJiNDMtZDViZWM2MzIxZDYwXkEyXkFqcGdeQXVyNjAwNDUxODI@._V1_SX300.jpg', 'Framed in the 1940s for the double murder of his wife and her lover, upstanding banker Andy Dufresne begins a new life at the Shawshank prison, where he puts his accounting skills to work for an amoral warden. During his long stretch in prison, Dufresne comes to be admired by the other inmates -- including an older prisoner named Red -- for his integrity and unquenchable sense of hope.', '1994-09-23', ARRAY['Drama'], 9.3, 91, '{"Netflix": true, "Prime Video": true}'),
  
  ('tt0068646', 'The Godfather', 'https://m.media-amazon.com/images/M/MV5BM2MyNjYxNmUtYTAwNi00MTYxLWJmNWYtYzZlODY3ZTk3OTFlXkEyXkFqcGdeQXVyNzkwMjQ5NzM@._V1_SX300.jpg', 'Spanning the years 1945 to 1955, a chronicle of the fictional Italian-American Corleone crime family. When organized crime family patriarch, Vito Corleone barely survives an attempt on his life, his youngest son, Michael steps in to take care of the would-be killers, launching a campaign of bloody revenge.', '1972-03-14', ARRAY['Crime', 'Drama'], 9.2, 98, '{"Prime Video": true}'),
  
  ('tt0468569', 'The Dark Knight', 'https://m.media-amazon.com/images/M/MV5BMTMxNTMwODM0NF5BMl5BanBnXkFtZTcwODAyMTk2Mw@@._V1_SX300.jpg', 'Batman raises the stakes in his war on crime. With the help of Lt. Jim Gordon and District Attorney Harvey Dent, Batman sets out to dismantle the remaining criminal organizations that plague the streets. The partnership proves to be effective, but they soon find themselves prey to a reign of chaos unleashed by a rising criminal mastermind known to the terrified citizens of Gotham as the Joker.', '2008-07-16', ARRAY['Action', 'Crime', 'Drama', 'Thriller'], 9.0, 94, '{"Netflix": true}'),
  
  ('tt0167260', 'The Lord of the Rings: The Return of the King', 'https://m.media-amazon.com/images/M/MV5BNzA5ZDNlZWMtM2NhNS00NDJjLTk4NDItYTRmY2EwMWZlMTY3XkEyXkFqcGdeQXVyNzkwMjQ5NzM@._V1_SX300.jpg', 'Aragorn is revealed as the heir to the ancient kings as he, Gandalf and the other members of the broken fellowship struggle to save Gondor from Sauron''s forces. Meanwhile, Frodo and Sam take the ring closer to the heart of Mordor, the dark lord''s realm.', '2003-12-17', ARRAY['Adventure', 'Fantasy', 'Action'], 8.9, 93, '{"Prime Video": true, "Netflix": true}'),
  
  ('tt0120737', 'The Lord of the Rings: The Fellowship of the Ring', 'https://m.media-amazon.com/images/M/MV5BN2EyZjM3NzUtNWUzMi00MTgxLWI0NTctMzY4M2VlOTdjZWRiXkEyXkFqcGdeQXVyNDUzOTQ5MjY@._V1_SX300.jpg', 'Young hobbit Frodo Baggins, after inheriting a mysterious ring from his uncle Bilbo, must leave his home in order to keep it from falling into the hands of its evil creator. Along the way, a fellowship is formed to protect the ringbearer and make sure that the ring arrives at its final destination: Mt. Doom, the only place where it can be destroyed.', '2001-12-19', ARRAY['Adventure', 'Fantasy', 'Action'], 8.8, 91, '{"Prime Video": true, "Netflix": true}'),
  
  ('tt0816692', 'Interstellar', 'https://m.media-amazon.com/images/M/MV5BZjdkOTU3MDktN2IxOS00OGEyLWFmMjktY2FiMmZkNWIyODZiXkEyXkFqcGdeQXVyMTMxODk2OTU@._V1_SX300.jpg', 'The adventures of a group of explorers who make use of a newly discovered wormhole to surpass the limitations on human space travel and conquer the vast distances involved in an interstellar voyage.', '2014-11-07', ARRAY['Adventure', 'Drama', 'Science Fiction'], 8.6, 72, '{"Prime Video": true}'),
  
  ('tt0245429', 'Spirited Away', 'https://m.media-amazon.com/images/M/MV5BMjlmZmI5MDctNDE2YS00YWE0LWE5ZWItZDBhYWQ0NTcxNWRhXkEyXkFqcGdeQXVyMTMxODk2OTU@._V1_SX300.jpg', 'A young girl, Chihiro, becomes trapped in a strange new world of spirits. When her parents undergo a mysterious transformation, she must call upon the courage she never knew she had to free her family.', '2001-07-20', ARRAY['Animation', 'Family', 'Fantasy'], 8.6, 97, '{"Netflix": true, "HBO Max": true}'),
  
  ('tt0110912', 'Pulp Fiction', 'https://m.media-amazon.com/images/M/MV5BNGNhMDIzZTUtNTBlZi00MTRlLWFjM2ItYzViMjE3YzI5MjljXkEyXkFqcGdeQXVyNzkwMjQ5NzM@._V1_SX300.jpg', 'A burger-loving hit man, his philosophical partner, a drug-addled gangster''s moll and a washed-up boxer converge in this sprawling, comedic crime caper. Their adventures unfurl in three stories that ingeniously trip back and forth in time.', '1994-09-10', ARRAY['Thriller', 'Crime'], 8.9, 92, '{"Netflix": true}'),
  
  ('tt0109830', 'Forrest Gump', 'https://m.media-amazon.com/images/M/MV5BNWIwODRlZTUtY2U3ZS00Yzg1LWJhNzYtMmZiYmEyNmU1NjMzXkEyXkFqcGdeQXVyMTQxNzMzNDI@._V1_SX300.jpg', 'A man with a low IQ has accomplished great things in his life and been present during significant historic events—in each case, far exceeding what anyone imagined he could do. But despite all he has achieved, his one true love eludes him.', '1994-07-06', ARRAY['Drama', 'Romance', 'Comedy'], 8.8, 71, '{"Prime Video": true, "Netflix": true}'),
  
  ('tt0137523', 'Fight Club', 'https://m.media-amazon.com/images/M/MV5BNDIzNDU0YzEtYzE5Ni00ZjlkLTk5ZjgtNjM3NWE4YzA3Nzk3XkEyXkFqcGdeQXVyMjUzOTY1NTc@._V1_SX300.jpg', 'A ticking-time-bomb insomniac and a slippery soap salesman channel primal male aggression into a shocking new form of therapy. Their concept catches on, with underground "fight clubs" forming in every town, until an eccentric gets in the way and ignites an out-of-control spiral toward oblivion.', '1999-10-15', ARRAY['Drama'], 8.8, 79, '{"Prime Video": true}')
ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title,
  poster_path = EXCLUDED.poster_path,
  overview = EXCLUDED.overview,
  release_date = EXCLUDED.release_date,
  genres = EXCLUDED.genres,
  imdb_rating = EXCLUDED.imdb_rating,
  rt_rating = EXCLUDED.rt_rating,
  streaming_services = EXCLUDED.streaming_services;
