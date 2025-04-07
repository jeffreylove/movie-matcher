import { createClient } from '@supabase/supabase-js';
import type { Movie } from '@/types/database';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

interface MovieSearchParams {
  sessionId: string;
}

interface MovieService {
  fetchMovies(): Promise<Movie[]>;
  fetchMoviesForSession(options: { sessionId: string }): Promise<{ movies: Movie[] }>;
}

export async function fetchMovies(): Promise<Movie[]> {
  console.log('Fetching movies...');
  
  // First, let's check what fields are available in the movies table
  const { data: sampleMovie, error: sampleError } = await supabase
    .from('movies')
    .select('*')
    .limit(1);

  if (sampleError) {
    console.error('Error fetching sample movie:', sampleError);
    return [];
  }

  if (sampleMovie && sampleMovie.length > 0) {
    console.log('Movie data structure:', Object.keys(sampleMovie[0]));
    console.log('Sample movie:', sampleMovie[0]);
  }

  // Now fetch movies with rating filter
  const { data: movies, error } = await supabase
    .from('movies')
    .select('*')
    .order('random')
    .gte('rt_rating', 8.5)
    .limit(100);

  if (error) {
    console.error('Error fetching movies with rating filter:', error);
    return [];
  }

  if (!movies || movies.length === 0) {
    console.log('No movies returned with rating filter');
    return [];
  }

  console.log(`Found ${movies.length} movies with rating filter`);
  
  // Filter for movies released in 1980 or later using JavaScript
  const filteredMovies = movies.filter(movie => {
    // Check if the movie has a release_date field
    if (!movie.release_date) {
      console.log('Movie missing release_date:', movie.title);
      return false; // Skip movies without release dates
    }
    
    try {
      // Try different date formats
      let year;
      if (typeof movie.release_date === 'string') {
        // If it's a date string like '1980-01-01'
        if (movie.release_date.includes('-')) {
          year = parseInt(movie.release_date.split('-')[0], 10);
        } 
        // If it's just a year like '1980'
        else if (/^\d{4}$/.test(movie.release_date)) {
          year = parseInt(movie.release_date, 10);
        } 
        // If it's a different format, try to parse it as a date
        else {
          year = new Date(movie.release_date).getFullYear();
        }
      } 
      // If it's already a number
      else if (typeof movie.release_date === 'number') {
        year = movie.release_date;
      }
      
      console.log(`Movie ${movie.title} has release year: ${year}`);
      return year >= 1980;
    } catch (e) {
      console.log('Error parsing release date for movie:', movie.title, movie.release_date);
      return false; // Skip movies with unparseable dates
    }
  });

  console.log(`Filtered to ${filteredMovies.length} movies from 1980 or later`);
  
  return filteredMovies;
}

export async function fetchMoviesForSession(options: MovieSearchParams): Promise<{ movies: Movie[] }> {
  const { sessionId } = options;
  console.log(`Fetching all movies for session ${sessionId}`);

  // First, check if movies are already stored for this session
  console.log(`Checking for existing movies for session ${sessionId}...`);
  
  // Use a direct JOIN query to get movies in the exact order they're stored
  // This eliminates any potential issues with ID type conversion or manual sorting
  const { data: orderedMovies, error: joinError } = await supabase
    .from('session_movies')
    .select(`
      position,
      movies!inner(*)
    `)
    .eq('session_id', sessionId)
    .order('position', { ascending: true });
  
  if (joinError) {
    console.error('Error fetching session movies with join:', joinError);
  } else if (orderedMovies && orderedMovies.length > 0) {
    console.log(`Found ${orderedMovies.length} existing movies for session ${sessionId} using JOIN query`);
    
    // Extract the movie objects from the joined result
    // The structure will be [{position: 0, movies: {id: '123', title: 'Movie 1', ...}}, ...]
    // Use type assertion to tell TypeScript that each item.movies is a Movie object
    const movies = orderedMovies.map(item => {
      // First cast to unknown, then to Movie to avoid direct casting errors
      return item.movies as unknown as Movie;
    });
  
    // Log the first few movies to verify order
    console.log('First 5 movies in order:', movies.slice(0, 5).map(m => `${m.title} (ID: ${m.id})`));
    
    console.log(`Retrieved ${movies.length} movies in the correct order for session ${sessionId}`);
    return { movies };
  }

  // If we get here, either there are no stored movies for this session,
  // or there was an error retrieving them. Proceed with normal filtering.
  console.log('No existing movies found for this session. Filtering and storing new list.');

  // Get the session filters
  const { data: sessionData, error: sessionError } = await supabase
    .from('sessions')
    .select('filters')
    .eq('id', sessionId)
    .single();

  if (sessionError) {
    console.error('Error fetching session filters:', sessionError);
    return { movies: [] };
  }

  // Extract filters from session
  const filters = sessionData.filters || {};
  console.log('Session filters:', filters);
  
  // Ensure min_rating is properly formatted as a number
  if (filters.min_rating) {
    filters.min_rating = parseFloat(String(filters.min_rating));
    console.log(`Parsed min_rating as ${filters.min_rating}`);
  }

  // Fetch ALL movies from the database
  console.log('Fetching all movies from database...');
  
  // Supabase has a default limit of 1000 rows, so we need to paginate to get all movies
  // First, let's get the total count
  const { count, error: countError } = await supabase
    .from('movies')
    .select('*', { count: 'exact', head: true });
    
  if (countError) {
    console.error('Error getting movie count:', countError);
    return { movies: [] };
  }
  
  console.log(`Total movies in database: ${count}`);
  
  // Now fetch all movies in batches
  let allMovies: any[] = [];
  const batchSize = 1000;
  const totalBatches = Math.ceil((count || 0) / batchSize);
  
  console.log(`Fetching ${totalBatches} batches of ${batchSize} movies each...`);
  
  for (let i = 0; i < totalBatches; i++) {
    console.log(`Fetching batch ${i + 1} of ${totalBatches}...`);
    const { data: batchMovies, error: batchError } = await supabase
      .from('movies')
      .select('*')
      .range(i * batchSize, (i + 1) * batchSize - 1);
      
    if (batchError) {
      console.error(`Error fetching batch ${i + 1}:`, batchError);
      continue;
    }
    
    console.log(`Got ${batchMovies?.length || 0} movies in batch ${i + 1}`);
    if (batchMovies && batchMovies.length > 0) {
      allMovies = [...allMovies, ...batchMovies];
    }
  }
  
  const movies = allMovies;
  const error = null;

  if (error) {
    console.error('Error fetching movies:', error);
    return { movies: [] };
  }

  console.log(`----- MOVIE COUNTS -----`);
  console.log(`Total movies loaded from database: ${movies.length}`);
  
  // Count movies by genre
  const genreCounts: Record<string, number> = {};
  movies.forEach(movie => {
    if (Array.isArray(movie.genres)) {
      movie.genres.forEach((genre: string) => {
        const g = genre.trim().toLowerCase();
        genreCounts[g] = (genreCounts[g] || 0) + 1;
      });
    } else if (typeof movie.genres === 'string') {
      if (movie.genres.includes(',')) {
        movie.genres.split(',').forEach((genre: string) => {
          const g = genre.trim().toLowerCase();
          genreCounts[g] = (genreCounts[g] || 0) + 1;
        });
      } else {
        const g = movie.genres.trim().toLowerCase();
        genreCounts[g] = (genreCounts[g] || 0) + 1;
      }
    }
  });
  
  // Log genre counts
  console.log('Movies by genre:');
  Object.entries(genreCounts)
    .sort((a, b) => b[1] - a[1])
    .forEach(([genre, count]) => {
      console.log(`  ${genre}: ${count}`);
    });
  
  console.log(`----- END MOVIE COUNTS -----`);
  console.log(`Loaded ${movies.length} total movies from database, applying filters...`);
  
  // Debug: Check if 102 Dalmatians is in the loaded movies
  const dalmatians = movies.filter(m => m.title && m.title.includes('Dalmatians'));
  console.log('Dalmatians movies found in initial load:', dalmatians.map(m => `${m.title} (Genres: ${m.genres})`));
  
  // Specific check for 102 Dalmatians
  const debugMovie = allMovies.find(m => m.title === '102 Dalmatians');
  if (debugMovie) {
    console.log('Found 102 Dalmatians in all movies:', debugMovie);
  } else {
    console.log('102 Dalmatians not found in all movies');
  }
  
  const elfMovie = allMovies.find(m => m.title === 'Elf');
  if (elfMovie) {
    console.log('Found Elf in all movies:', elfMovie);
  } else {
    console.log('Elf not found in all movies');
  }
  
  // Check for similar titles
  const similar = movies.filter(m => m.title && m.title.toLowerCase().includes('dalmatian'));
  console.log('Similar titles found:', similar.map(m => m.title));
  
  // Debug: Check if any movies have the Playlist genre
  const playlistMovies = movies.filter(m => {
    if (Array.isArray(m.genres)) {
      return m.genres.some((g: string) => String(g).toLowerCase() === 'playlist');
    } else if (typeof m.genres === 'string') {
      if (m.genres.includes(',')) {
        return m.genres.split(',').map((g: string) => g.trim().toLowerCase()).includes('playlist');
      } else {
        return m.genres.trim().toLowerCase() === 'playlist';
      }
    }
    return false;
  });
  console.log('Movies with Playlist genre found in initial load:', playlistMovies.map(m => `${m.title} (Genres: ${m.genres})`));
  
  // Track how many movies pass each filter stage
  let moviesAfterYearFilter = 0;
  let moviesAfterGenreFilter = 0;
  let moviesAfterRatingFilter = 0;
  let moviesAfterMpaaFilter = 0;
  
  // Apply all filters using JavaScript
  const filteredMovies = movies.filter(movie => {
    // Special debug for specific movies
    const is102Dalmatians = movie.title === '102 Dalmatians';
    const isElf = movie.title === 'Elf';
    
    if (is102Dalmatians) {
      console.log('FILTERING 102 Dalmatians - starting filter process');
    }
    
    if (isElf) {
      console.log('FILTERING Elf - starting filter process');
      console.log('Elf details:', movie);
    }
    // 1. Filter by release year
    if (movie.release_date) {
      try {
        // Try different date formats
        let year;
        if (typeof movie.release_date === 'string') {
          // If it's a date string like '1980-01-01'
          if (movie.release_date.includes('-')) {
            year = parseInt(movie.release_date.split('-')[0], 10);
          } 
          // If it's just a year like '1980'
          else if (/^\d{4}$/.test(movie.release_date)) {
            year = parseInt(movie.release_date, 10);
          } 
          // If it's a different format, try to parse it as a date
          else {
            year = new Date(movie.release_date).getFullYear();
          }
        } 
        // If it's already a number
        else if (typeof movie.release_date === 'number') {
          year = movie.release_date;
        }
        
        if (is102Dalmatians) {
          console.log(`102 Dalmatians - Year filter check: release year = ${year}, filters: start=${filters.year_start}, end=${filters.year_end}`);
        }
        
        // Apply year filter if specified
        if (filters.year_start && year < filters.year_start) {
          if (is102Dalmatians) {
            console.log(`102 Dalmatians - EXCLUDED by year_start filter: ${year} < ${filters.year_start}`);
          }
          return false;
        }
        if (filters.year_end && year > filters.year_end) {
          if (is102Dalmatians) {
            console.log(`102 Dalmatians - EXCLUDED by year_end filter: ${year} > ${filters.year_end}`);
          }
          return false;
        }
        
        if (is102Dalmatians) {
          console.log(`102 Dalmatians - PASSED year filter`);
        }
        
        // Increment year filter counter
        moviesAfterYearFilter++;
      
      } catch (e) {
        return false; // Skip movies with unparseable dates
      }
    } else if (filters.year_start || filters.year_end) {
      // If year filters are specified but movie has no date, exclude it
      return false;
    }
    
    // 2. Filter by genres - using OR logic between genres of the same type
    if (filters.genres && filters.genres.length > 0) {
      // Special handling for single-genre movies like "Playlist"
      // This is needed because the database sometimes stores genres as a single string without commas
      let movieGenres: string[] = [];
      
      if (is102Dalmatians) {
        console.log(`102 Dalmatians - Genre filter check: raw genres = ${JSON.stringify(movie.genres)}, type = ${typeof movie.genres}`);
      }
      
      if (isElf) {
        console.log(`Elf - Genre filter check: raw genres = ${JSON.stringify(movie.genres)}, type = ${typeof movie.genres}`);
      }
      
      if (Array.isArray(movie.genres)) {
        movieGenres = movie.genres.map((g: string) => String(g).toLowerCase());
        if (is102Dalmatians) {
          console.log(`102 Dalmatians - Genres are in array format: ${JSON.stringify(movieGenres)}`);
        }
      } else if (typeof movie.genres === 'string') {
        // Check if the genre string contains commas
        if (movie.genres.includes(',')) {
          movieGenres = movie.genres.split(',').map((g: string) => g.trim().toLowerCase());
          if (is102Dalmatians) {
            console.log(`102 Dalmatians - Genres are comma-separated: ${JSON.stringify(movieGenres)}`);
          }
        } else {
          // Handle single genre case (like "Playlist")
          movieGenres = [movie.genres.trim().toLowerCase()];
          if (is102Dalmatians) {
            console.log(`102 Dalmatians - Genre is a single string: ${JSON.stringify(movieGenres)}`);
          }
        }
      } else {
        if (is102Dalmatians) {
          console.log(`102 Dalmatians - WARNING: Genres are in unexpected format: ${typeof movie.genres}`);
        }
      }
      
      // Convert selected genres to lowercase for case-insensitive comparison
      const selectedGenres = filters.genres.map((g: string) => g.toLowerCase());
      
      if (is102Dalmatians) {
        console.log(`102 Dalmatians - Selected genres: ${JSON.stringify(selectedGenres)}`);
      }
      
      // Debug log for genre filtering
      console.log(`Movie ${movie.title}: Genres = ${JSON.stringify(movieGenres)}, Selected genres = ${JSON.stringify(selectedGenres)}`);
      
      // Special handling for Playlist - log more details to debug
      if (selectedGenres.includes('playlist')) {
        console.log(`Movie ${movie.title} - Checking for Playlist genre:`, 
          `Has genres: ${JSON.stringify(movieGenres)}`, 
          `Includes 'playlist': ${movieGenres.includes('playlist')}`);
        
        if (is102Dalmatians) {
          console.log(`102 Dalmatians - Playlist is in selected genres, checking if movie has Playlist genre`);
        }
      }
      
      // Check if ANY of the movie's genres match ANY of the selected genres (OR logic)
      let hasMatch = false;
      const matchedGenres: string[] = [];
      
      // Check each movie genre against each selected genre
      for (const movieGenre of movieGenres) {
        if (is102Dalmatians) {
          console.log(`102 Dalmatians - Checking movie genre: '${movieGenre}'`);
        }
        
        for (const selectedGenre of selectedGenres) {
          if (is102Dalmatians) {
            console.log(`102 Dalmatians - Comparing movie genre '${movieGenre}' with selected genre '${selectedGenre}'`);
            console.log(`102 Dalmatians - Lowercase comparison: '${movieGenre.toLowerCase()}' === '${selectedGenre.toLowerCase()}'? ${movieGenre.toLowerCase() === selectedGenre.toLowerCase()}`);
          }
          
          // Try exact match first (case insensitive)
          if (movieGenre.toLowerCase() === selectedGenre.toLowerCase()) {
            console.log(`Movie ${movie.title}: Exact match for genre ${selectedGenre}`);
            hasMatch = true;
            matchedGenres.push(selectedGenre);
            
            if (is102Dalmatians) {
              console.log(`102 Dalmatians - MATCHED with genre ${selectedGenre} (exact match)`);
            }
            
            continue;
          }
          
          // Try contains match (e.g., "animation" would match "computer animation")
          if (movieGenre.toLowerCase().includes(selectedGenre.toLowerCase())) {
            console.log(`Movie ${movie.title}: Contains match for genre ${selectedGenre} in ${movieGenre}`);
            hasMatch = true;
            matchedGenres.push(selectedGenre);
            continue;
          }
          
          // Try partial word match for common genre variations
          // For example, "animated" should match "animation"
          if ((selectedGenre === 'animation' && movieGenre.includes('animat')) ||
              (selectedGenre === 'family' && (movieGenre.includes('famil') || movieGenre.includes('child'))) ||
              (selectedGenre === 'fantasy' && movieGenre.includes('fantas')) ||
              (selectedGenre === 'adventure' && movieGenre.includes('adventur'))) {
            console.log(`Movie ${movie.title}: Partial match for genre ${selectedGenre}`);
            hasMatch = true;
            matchedGenres.push(selectedGenre);
          }
        }
      }
      
      // Remove duplicates from matched genres
      const uniqueMatchedGenres = Array.from(new Set(matchedGenres));
      
      // Log which genres matched
      if (uniqueMatchedGenres.length > 0) {
        console.log(`Movie ${movie.title}: Matched genres: ${uniqueMatchedGenres.join(', ')}`);
        if (is102Dalmatians) {
          console.log(`102 Dalmatians - MATCHED with genres: ${uniqueMatchedGenres.join(', ')}`);
        }
      } else if (is102Dalmatians) {
        console.log(`102 Dalmatians - NO GENRES MATCHED`);
      }
      
      // With OR logic, any genre match is sufficient
      if (selectedGenres.length > 0 && !hasMatch) {
        console.log(`Movie ${movie.title}: No genres matched, excluding`);
        if (is102Dalmatians) {
          console.log(`102 Dalmatians - EXCLUDED because no genres matched`);
          console.log(`102 Dalmatians - Movie genres: ${JSON.stringify(movieGenres)}`);
          console.log(`102 Dalmatians - Selected genres: ${JSON.stringify(selectedGenres)}`);
        }
        return false;
      } else if (is102Dalmatians) {
        console.log(`102 Dalmatians - PASSED genre filter check`);
      }
      
      // Increment genre filter counter
      moviesAfterGenreFilter++;
    }
    
    // 3. Filter by RT rating if specified
    if (filters.min_rating) {
      if (is102Dalmatians) {
        console.log(`102 Dalmatians - RT rating check: movie.rt_rating = ${movie.rt_rating}, type = ${typeof movie.rt_rating}`);
      }
      
      // Handle case where movie has no RT rating
      if (movie.rt_rating === null || movie.rt_rating === undefined || movie.rt_rating === '') {
        console.log(`Movie ${movie.title}: Skipping - no RT rating`);
        if (is102Dalmatians) {
          console.log(`102 Dalmatians - EXCLUDED because it has no RT rating`);
        }
        return false; // Skip movies with no rating when a minimum is specified
      }
      
      // Convert both to numbers for comparison
      const minRating = parseFloat(String(filters.min_rating));
      let movieRating;
      
      // Handle different rating formats
      if (typeof movie.rt_rating === 'string') {
        // Remove any % signs and convert to a number between 0-10
        if (movie.rt_rating.includes('%')) {
          // Convert percentage (0-100) to 0-10 scale
          movieRating = parseFloat(movie.rt_rating.replace('%', '')) / 10;
          if (is102Dalmatians) {
            console.log(`102 Dalmatians - RT rating is percentage: ${movie.rt_rating} -> ${movieRating}`);
          }
        } else {
          movieRating = parseFloat(movie.rt_rating);
          if (is102Dalmatians) {
            console.log(`102 Dalmatians - RT rating is string number: ${movie.rt_rating} -> ${movieRating}`);
          }
        }
      } else {
        movieRating = parseFloat(String(movie.rt_rating));
        if (is102Dalmatians) {
          console.log(`102 Dalmatians - RT rating is number: ${movie.rt_rating} -> ${movieRating}`);
        }
      }
      
      // If rating is on a 100 scale, convert to 10 scale
      if (movieRating > 10 && movieRating <= 100) {
        movieRating = movieRating / 10;
        if (is102Dalmatians) {
          console.log(`102 Dalmatians - RT rating converted from 100 scale to 10 scale: ${movieRating}`);
        }
      }
      
      // Debug log for rating filtering
      console.log(`Movie ${movie.title}: RT rating = ${movie.rt_rating} (parsed as ${movieRating}), min required = ${minRating}`);
      
      // Only include movies with ratings greater than or equal to the minimum
      if (isNaN(movieRating) || movieRating < minRating) {
        console.log(`Movie ${movie.title}: Skipping - rating too low`);
        if (is102Dalmatians) {
          console.log(`102 Dalmatians - EXCLUDED because RT rating ${movieRating} is less than minimum ${minRating}`);
        }
        return false;
      } else {
        console.log(`Movie ${movie.title}: Keeping - rating meets minimum`);
        if (is102Dalmatians) {
          console.log(`102 Dalmatians - PASSED RT rating check: ${movieRating} >= ${minRating}`);
        }
        
        // Increment RT rating filter counter
        moviesAfterRatingFilter++;
      }
    } else {
      // No RT rating filter, all movies pass this stage
      moviesAfterRatingFilter++;
      
      if (is102Dalmatians) {
        console.log(`102 Dalmatians - No RT rating filter specified, skipping RT rating check`);
      }
    }
    
    // 4. Filter by MPAA ratings if specified
    if (filters.mpaa_ratings && filters.mpaa_ratings.length > 0 && movie.mpaa_rating) {
      if (is102Dalmatians) {
        console.log(`102 Dalmatians - MPAA rating check: movie.mpaa_rating = ${movie.mpaa_rating}, filters = ${JSON.stringify(filters.mpaa_ratings)}`);
      }
      
      if (!filters.mpaa_ratings.includes(movie.mpaa_rating)) {
        if (is102Dalmatians) {
          console.log(`102 Dalmatians - EXCLUDED because MPAA rating ${movie.mpaa_rating} not in ${JSON.stringify(filters.mpaa_ratings)}`);
        }
        return false;
      }
      
      if (is102Dalmatians) {
        console.log(`102 Dalmatians - PASSED MPAA rating check`);
      }
    } else {
      if (is102Dalmatians) {
        console.log(`102 Dalmatians - No MPAA rating filter specified, skipping MPAA check`);
      }
    }
    
    // Increment MPAA filter counter
    moviesAfterMpaaFilter++;
    
    // Movie passed all filters
    return true;
  });

  // Log filter stage summary
  console.log(`----- FILTER STAGE SUMMARY -----`);
  console.log(`Total movies loaded: ${movies.length}`);
  console.log(`Movies after year filter: ${moviesAfterYearFilter}`);
  console.log(`Movies after genre filter: ${moviesAfterGenreFilter}`);
  console.log(`Movies after RT rating filter: ${moviesAfterRatingFilter}`);
  console.log(`Movies after MPAA rating filter: ${moviesAfterMpaaFilter}`);
  console.log(`Final filtered count: ${filteredMovies.length}`);
  console.log(`----- END FILTER SUMMARY -----`);
  
  console.log(`Filtered to ${filteredMovies.length} movies that match all criteria`);
  
  // Randomize the movie list using Fisher-Yates (Knuth) shuffle algorithm
  // This ensures a more uniform and unbiased randomization than simple Math.random() sorting
  const shuffledMovies = [...filteredMovies];
  for (let i = shuffledMovies.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffledMovies[i], shuffledMovies[j]] = [shuffledMovies[j], shuffledMovies[i]];
  }
  
  console.log(`Randomized ${shuffledMovies.length} movies for better variety`);
  
  // Store the movie list for this session in the session_movies table
  if (shuffledMovies.length > 0) {
    console.log(`Storing ${shuffledMovies.length} movies for session ${sessionId}`);
    
    // First, delete any existing entries for this session
    const { error: deleteError } = await supabase
      .from('session_movies')
      .delete()
      .eq('session_id', sessionId);
      
    if (deleteError) {
      console.error('Error deleting existing session movies:', deleteError);
    }
    
    // Now insert the new movie list with positions
    console.log('First 5 movie IDs to store:', shuffledMovies.slice(0, 5).map(m => m.id));
    console.log('Movie ID types to store:', shuffledMovies.slice(0, 3).map(m => `${m.id} (${typeof m.id})`));
    
    // Ensure we're consistently storing movie IDs as strings
    const movieEntries = shuffledMovies.map((movie, index) => {
      // Make sure we have a valid ID, convert to string
      const movieId = movie.id?.toString() || String(movie.id);
      
      const entry = {
        session_id: sessionId,
        movie_id: movieId,
        position: index
      };
      
      if (index < 5) {
        console.log(`Movie entry ${index}:`, entry);
      }
      return entry;
    });
    
    // Insert in batches to avoid hitting request size limits
    const batchSize = 100;
    for (let i = 0; i < movieEntries.length; i += batchSize) {
      const batch = movieEntries.slice(i, i + batchSize);
      const { error: insertError } = await supabase
        .from('session_movies')
        .insert(batch);
        
      if (insertError) {
        console.error(`Error storing session movies batch ${i / batchSize + 1}:`, insertError);
      }
    }
    
    console.log(`Stored ${shuffledMovies.length} movies for session ${sessionId}`);
  }
  
  // Return all movies at once - no pagination
  return {
    movies: shuffledMovies
  };
}