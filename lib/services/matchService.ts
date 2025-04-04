import { supabase } from '../supabase';
import type { Movie } from '@/types/database';

export async function fetchMatches(sessionId: string): Promise<Movie[]> {
  const { data: matches, error } = await supabase
    .from('matches')
    .select('movie_id')
    .eq('session_id', sessionId);

  if (error) {
    console.error('Error fetching matches:', error);
    return [];
  }

  const movieIds = matches.map(match => match.movie_id);

  const { data: movies, error: movieError } = await supabase
    .from('movies')
    .select('*')
    .in('id', movieIds);

  if (movieError) {
    console.error('Error fetching movies:', movieError);
    return [];
  }

  return movies || [];
}
