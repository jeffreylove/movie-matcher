import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

/* // This endpoint should be called by a cron job every few hours
export async function GET() {
  try {
    // Get movies that need updating
    const { data: movies } = await supabase
      .from('movies')
      .select('id, last_updated')
      .order('last_updated', { ascending: true })
      .limit(50) // Process in batches

    if (!movies) {
      return NextResponse.json({ status: 'No movies to update' })
    }

    // Update streaming info for movies that need it
    const updates = await Promise.allSettled(
      movies.map(async (movie) => {
        if (await shouldUpdateMovie(movie.id)) {
          await updateStreamingInfo(movie.id)
          return movie.id
        }
        return null
      })
    ) 

    const updatedMovies = updates
      .filter((result): result is PromiseFulfilledResult<string> => 
        result.status === 'fulfilled' && result.value !== null
      )
      .map(result => result.value)

    return NextResponse.json({
      status: 'success',
      updated: updatedMovies.length,
      movies: updatedMovies
    })
  } catch (error) {
    console.error('Error updating movies:', error)
    return NextResponse.json({ error: 'Failed to update movies' }, { status: 500 })
  }
} */
/* 
// Helper functions
async function shouldUpdateMovie(movieId: string): Promise<boolean> {
  // Check if movie was updated in the last 24 hours
  const { data } = await supabase
    .from('movies')
    .select('last_updated')
    .eq('id', movieId)
    .single();
    
  if (!data || !data.last_updated) return true;
  
  const lastUpdated = new Date(data.last_updated);
  const oneDayAgo = new Date();
  oneDayAgo.setDate(oneDayAgo.getDate() - 1);
  
  return lastUpdated < oneDayAgo;
}

async function updateStreamingInfo(movieId: string): Promise<void> {
  // This would typically call an external API to get streaming info
  // For now, we'll just update the last_updated timestamp
  await supabase
    .from('movies')
    .update({ last_updated: new Date().toISOString() })
    .eq('id', movieId);
} */