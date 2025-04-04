import { Movie } from '@/types/database';

// Make sure to use the environment variable for the API key
const OMDB_API_KEY = process.env.NEXT_PUBLIC_OMDB_API_KEY || '';
console.log('OMDB API Key loaded:', OMDB_API_KEY ? 'Yes (length: ' + OMDB_API_KEY.length + ')' : 'No');
const OMDB_API_URL = 'https://www.omdbapi.com';

export interface OmdbMovie {
  Title: string;
  Year: string;
  Rated: string;
  Released: string;
  Runtime: string;
  Genre: string;
  Director: string;
  Writer: string;
  Actors: string;
  Plot: string;
  Language: string;
  Country: string;
  Awards: string;
  Poster: string;
  Ratings: {
    Source: string;
    Value: string;
  }[];
  Metascore: string;
  imdbRating: string;
  imdbVotes: string;
  imdbID: string;
  Type: string;
  DVD: string;
  BoxOffice: string;
  Production: string;
  Website: string;
  Response: string;
}

export async function searchMovieByTitle(title: string, year?: string): Promise<OmdbMovie | null> {
  try {
    if (!OMDB_API_KEY || OMDB_API_KEY === 'your_api_key_here') {
      console.error('Invalid OMDB API key. Please set a valid key in .env.local');
      throw new Error('Invalid OMDB API key');
    }

    // Make sure we have a valid title
    if (!title.trim()) {
      throw new Error('Movie title is required');
    }

    // Build the search URL
    const yearParam = year && year.trim() ? `&y=${encodeURIComponent(year.trim())}` : '';
    const url = `${OMDB_API_URL}?apikey=${OMDB_API_KEY}&t=${encodeURIComponent(title.trim())}${yearParam}`;
    
    console.log('Searching for movie with URL:', url.replace(OMDB_API_KEY, '[API_KEY_HIDDEN]'));
    
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error(`OMDB API error: ${response.status} ${response.statusText}`);
    }
    
    const data = await response.json();
    console.log('OMDB API response:', data);
    
    if (data.Response === 'False') {
      console.error('Movie not found:', data.Error);
      return null;
    }
    
    return data as OmdbMovie;
  } catch (error) {
    console.error('Error searching for movie:', error);
    return null;
  }
}

export function convertOmdbToMovieFormat(omdbMovie: OmdbMovie): Partial<Movie> {
  // Extract IMDb rating
  const imdbRating = parseFloat(omdbMovie.imdbRating) || null;
  
  // Extract Rotten Tomatoes rating
  let rtRating = null;
  const rtRatingObj = omdbMovie.Ratings?.find(rating => rating.Source === 'Rotten Tomatoes');
  if (rtRatingObj) {
    // Convert from "86%" to 8.6
    const percentage = rtRatingObj.Value.replace('%', '');
    rtRating = parseFloat(percentage) / 10;
  }
  
  // Extract Metascore
  const metascore = omdbMovie.Metascore ? parseInt(omdbMovie.Metascore, 10) : null;
  
  // Extract runtime in minutes
  let runtime = null;
  if (omdbMovie.Runtime) {
    const runtimeMatch = omdbMovie.Runtime.match(/(\d+)/);
    if (runtimeMatch) {
      runtime = parseInt(runtimeMatch[1], 10);
    }
  }
  
  // Extract genres directly as a comma-separated string to match existing database entries
  const genresString = omdbMovie.Genre;
  console.log('Extracted genres as string:', genresString);
  
  // Convert to the format that matches the actual database schema
  // Extract the year from the release date or use the Year field directly
  const year = omdbMovie.Year ? parseInt(omdbMovie.Year, 10) : null;
  
  // We need to use a type assertion here because our database schema expects genres as string[]
  // but we're storing it as a string to match existing entries
  return {
    id: omdbMovie.imdbID,
    title: omdbMovie.Title,
    overview: omdbMovie.Plot,
    poster_path: omdbMovie.Poster !== 'N/A' ? omdbMovie.Poster : null,
    // Store just the numeric year value
    release_date: year, // The database expects an integer, not a date string
    genres: genresString as unknown as string[], // Type assertion to handle the mismatch
    runtime,
    imdb_rating: imdbRating,
    rt_rating: rtRating,
    metascore: metascore,
  } as Partial<Movie>;
}

/**
 * Adds the "Playlist" genre to an existing movie
 */
async function addMovieToPlaylist(movieId: string) {
  const { createClient } = await import('@supabase/supabase-js');
  
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  
  if (!supabaseUrl || !supabaseKey) {
    console.error('Supabase credentials are missing');
    return { success: false, message: 'Database configuration error' };
  }
  
  try {
    const supabase = createClient(supabaseUrl, supabaseKey);
    
    // First, get the current movie data
    console.log('Fetching movie data for ID:', movieId);
    const { data: movieData, error: fetchError } = await supabase
      .from('movies')
      .select('*') // Select all fields for debugging
      .eq('id', movieId)
      .single();
    
    if (fetchError) {
      console.error('Error fetching movie data:', fetchError);
      return { success: false, message: 'Error fetching movie data' };
    }
    
    if (!movieData) {
      console.error('Movie not found with ID:', movieId);
      return { success: false, message: 'Movie not found' };
    }
    
    console.log('Found movie data:', movieData);
    
    // Check if the movie already has the Playlist genre
    console.log('Raw genres from database:', movieData.genres, typeof movieData.genres);
    
    // Use our helper function to standardize genres format
    let genresString = standardizeGenres(movieData.genres);
    console.log('Current genres (after standardizing):', genresString);
    
    if (genresString.includes('Playlist')) {
      console.log('Movie is already in playlist');
      return { 
        success: true, 
        message: 'Movie is already in your playlist',
        id: movieId,
        alreadyInPlaylist: true
      };
    }
    
    // Add the Playlist genre
    if (genresString) {
      genresString = genresString + ', Playlist';
    } else {
      genresString = 'Playlist';
    }
    console.log('Updated genres:', genresString);
    
    // Update the movie with the new genres
    console.log('Updating movie with new genres:', genresString);
    
    // Make sure we're sending a string to the database to match existing entries
    // Use type assertion to handle the mismatch between string and string[]
    const { data: updateData, error: updateError } = await supabase
      .from('movies')
      .update({ genres: genresString as unknown as string[] })
      .eq('id', movieId)
      .select();
    
    if (updateData) {
      console.log('Update successful, new data:', updateData);
    } else {
      console.log('No data returned from update operation');
    }
    
    if (updateError) {
      console.error('Error updating movie genres:', updateError);
      return { success: false, message: 'Error adding movie to playlist' };
    }
    
    return { 
      success: true, 
      message: 'Movie added to your playlist',
      id: movieId
    };
  } catch (error) {
    console.error('Error in addMovieToPlaylist:', error);
    return { success: false, message: 'An unexpected error occurred' };
  }
}

/**
 * Helper function to ensure genres are always stored as comma-separated strings
 * This helps standardize the format across the application to match existing entries
 */
function standardizeGenres(genresInput: any): string {
  // If null or undefined, return empty string
  if (!genresInput) {
    return '';
  }
  
  // If it's already a comma-separated string, just return it
  if (typeof genresInput === 'string') {
    // If it looks like a JSON array string, parse it and convert to comma-separated
    if (genresInput.startsWith('[') && genresInput.endsWith(']')) {
      try {
        const parsed = JSON.parse(genresInput);
        if (Array.isArray(parsed)) {
          return parsed.join(', ');
        }
        return genresInput; // If parsing succeeded but not an array, return as is
      } catch (e) {
        console.error('Failed to parse genres JSON string:', e);
        return genresInput; // If parsing failed, assume it's already a comma-separated string
      }
    }
    // It's already a comma-separated string
    return genresInput;
  }
  
  // If it's an array, convert to comma-separated string
  if (Array.isArray(genresInput)) {
    return genresInput.join(', ');
  }
  
  console.warn('Unknown genre format:', genresInput);
  return String(genresInput); // Convert to string as fallback
}

/**
 * Adds a movie to the database or updates an existing movie to add it to the playlist
 * @param movie The movie data to add
 * @param addToPlaylist If true, adds the movie to the Playlist genre (for both new and existing movies)
 */
export async function addMovieToDatabase(movie: Partial<Movie>, addToPlaylist: boolean = false) {
  const { createClient } = await import('@supabase/supabase-js');
  
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  
  const supabase = createClient(supabaseUrl, supabaseAnonKey);
  
  try {
    // If we're just adding to playlist and have an ID, skip duplicate checks
    if (addToPlaylist && movie.id) {
      console.log('Adding existing movie to playlist with ID:', movie.id);
      return await addMovieToPlaylist(movie.id);
    }
    
    // Check if movie already exists by ID
    if (movie.id) {
      const { data: existingMovieById, error: idCheckError } = await supabase
        .from('movies')
        .select('id, title')
        .eq('id', movie.id)
        .maybeSingle();
      
      if (idCheckError) {
        console.error('Error checking for movie by ID:', idCheckError);
      }
      
      if (existingMovieById) {
        console.log('Movie already exists in database by ID:', existingMovieById.title);
        return { 
          success: false, 
          message: `This movie already exists in the database with ID: ${movie.id}`, 
          id: movie.id,
          duplicate: true,
          canAddToPlaylist: true
        };
      }
    }
    
    // Check if movie already exists by title
    if (!movie.title) {
      console.error('Movie title is missing');
      return { success: false, message: 'Movie title is required' };
    }
    
    // Log the movie data to help debug
    console.log('Checking for duplicate movie with data:', {
      title: movie.title,
      release_date: movie.release_date,
      id: movie.id
    });
    
    // First, check by title only (case insensitive)
    const { data: existingMovieByTitle, error: titleError } = await supabase
      .from('movies')
      .select('id, title, release_date')
      .ilike('title', movie.title);
    
    if (titleError) {
      console.error('Error checking for duplicate movie by title:', titleError);
    }
    
    if (existingMovieByTitle && existingMovieByTitle.length > 0) {
      console.log('Found movies with similar title:', existingMovieByTitle);
      
      // If we have multiple matches, try to find one with matching year
      if (existingMovieByTitle.length > 1 && movie.release_date) {
        // Get the year as a number
        let yearToMatch: number | null = null;
        if (typeof movie.release_date === 'number') {
          yearToMatch = movie.release_date;
        } else if (typeof movie.release_date === 'string') {
          // Try to extract a year from the string
          const yearMatch = movie.release_date.match(/\d{4}/);
          if (yearMatch) {
            yearToMatch = parseInt(yearMatch[0], 10);
          }
        }
        console.log('Year to match:', yearToMatch);
        
        const exactMatch = existingMovieByTitle.find(m => 
          (m.release_date && m.release_date === yearToMatch)
        );
        
        if (exactMatch) {
          console.log('Found exact match with year:', exactMatch);
          const matchYear = exactMatch.release_date || 'Unknown';
          
          // If we're just adding to playlist, update the movie's genres
          if (addToPlaylist && exactMatch.id) {
            return await addMovieToPlaylist(exactMatch.id);
          }
          
          return { 
            success: false, 
            message: `A movie "${movie.title}" (${matchYear}) already exists in the database`, 
            id: exactMatch.id,
            duplicate: true,
            canAddToPlaylist: true
          };
        }
      }
      
      // If no year match or only one title match, return the first match
      if (addToPlaylist && existingMovieByTitle[0].id) {
        return await addMovieToPlaylist(existingMovieByTitle[0].id);
      }
      
      return { 
        success: false, 
        message: `A movie with the title "${movie.title}" already exists in the database`, 
        id: existingMovieByTitle[0].id,
        duplicate: true,
        canAddToPlaylist: true
      };
    }
    

    
    // Add movie to database
    // Make sure all data is properly formatted for the database
    // Log the movie data before insertion to help debug
    console.log('Preparing to insert movie with data:', movie);
    
    // Create a clean movie object with only the fields we know exist in the database
    // Make sure the release_date is a numeric value (integer year)
    let yearValue = null;
    if (movie.release_date) {
      if (typeof movie.release_date === 'number') {
        yearValue = movie.release_date;
      } else if (typeof movie.release_date === 'string') {
        // Try to extract a year from the string
        const yearMatch = movie.release_date.match(/\d{4}/);
        if (yearMatch) {
          yearValue = parseInt(yearMatch[0], 10);
        }
      }
    }
    console.log('Using year value:', yearValue);
    
    const movieToInsert = {
      id: movie.id,
      title: movie.title,
      overview: movie.overview,
      poster_path: movie.poster_path,
      release_date: yearValue, // Use the numeric year value
      genres: movie.genres,
      imdb_rating: movie.imdb_rating ? parseFloat(movie.imdb_rating.toString()) : null,
      rt_rating: movie.rt_rating ? parseFloat(movie.rt_rating.toString()) : null,
      runtime: movie.runtime,
      metascore: movie.metascore ? parseFloat(movie.metascore.toString()) : null
    };
    
    console.log('Formatted movie data for insertion:', movieToInsert);
    
    const { data, error } = await supabase
      .from('movies')
      .insert([movieToInsert]);
    
    if (error) {
      console.error('Error adding movie to database:', error);
      return { success: false, message: error.message };
    }
    
    console.log('Movie added to database:', movie.title);
    
    // If addToPlaylist is true, add the new movie to the Playlist genre
    if (addToPlaylist && movie.id) {
      console.log('Adding new movie to playlist with ID:', movie.id);
      await addMovieToPlaylist(movie.id);
      return { success: true, message: 'Movie added to database and playlist', id: movie.id };
    }
    
    return { success: true, message: 'Movie added to database', id: movie.id };
  } catch (error) {
    console.error('Error in addMovieToDatabase:', error);
    return { success: false, message: 'An unexpected error occurred' };
  }
}
