// check-movie.js
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase credentials');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkMovie() {
  try {
    // Query for 102 Dalmatians
    const { data: movie, error } = await supabase
      .from('movies')
      .select('*')
      .ilike('title', '%102 dalmatians%')
      .single();

    if (error) {
      throw error;
    }

    console.log('Movie data:');
    console.log(JSON.stringify(movie, null, 2));
    
    // Check the genres specifically
    console.log('\nGenres:');
    console.log('Type:', typeof movie.genres);
    console.log('Value:', movie.genres);
    
    if (typeof movie.genres === 'string') {
      const genreArray = movie.genres.split(',').map(g => g.trim());
      console.log('Split into array:', genreArray);
      console.log('Contains "Playlist":', genreArray.includes('Playlist'));
      console.log('Contains "playlist" (lowercase):', genreArray.includes('playlist'));
      console.log('Case-insensitive check:', genreArray.some(g => g.toLowerCase() === 'playlist'));
    } else if (Array.isArray(movie.genres)) {
      console.log('Array contains "Playlist":', movie.genres.includes('Playlist'));
      console.log('Array contains "playlist" (lowercase):', movie.genres.includes('playlist'));
      console.log('Case-insensitive check:', movie.genres.some(g => String(g).toLowerCase() === 'playlist'));
    }
  } catch (error) {
    console.error('Error checking movie:', error);
  }
}

checkMovie();
