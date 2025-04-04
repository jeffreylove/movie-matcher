/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: [
      'm.media-amazon.com', // Allow OMDB/IMDb image URLs
      'image.tmdb.org',    // Allow TMDB image URLs
    ],
  }
}

module.exports = nextConfig
