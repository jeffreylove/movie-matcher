// check-dalmatians.js
import { createClient } from '@supabase/supabase-js';
import * as fs from 'fs';

// Read environment variables from .env.local
const envContent = fs.readFileSync('.env.local', 'utf8');
const envVars = {};
envContent.split('\n').forEach(line => {
  const [key, value] = line.split('=');
  if (key && value) {
    envVars[key.trim()] = value.trim();
  }
});

const supabaseUrl = envVars.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = envVars.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase credentials');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkDalmatians() {
  try {
    // Query for 102 Dalmatians
    const { data: dalmatians, error } = await supabase
      .from('movies')
      .select('*')
      .ilike('title', '%dalmatians%');

    if (error) {
      throw error;
    }

    console.log('Found Dalmatians movies:', dalmatians.length);
    
    // Print each movie
    dalmatians.forEach(movie => {
      console.log('\nMovie:', movie.title);
      console.log('ID:', movie.id);
      console.log('Genres:', movie.genres);
      console.log('Type of genres:', typeof movie.genres);
      
      // If it's 102 Dalmatians, print more details
      if (movie.title.includes('102')) {
        console.log('\n*** DETAILS FOR 102 DALMATIANS ***');
        console.log(JSON.stringify(movie, null, 2));
      }
    });
  } catch (error) {
    console.error('Error checking Dalmatians movies:', error);
  }
}

checkDalmatians();
