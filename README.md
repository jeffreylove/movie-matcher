# Movie Matcher 🎬

A real-time movie matching app that helps two people choose a movie together, Tinder-style!

## Features

- 🎯 Real-time movie matching
- 🎭 Filter by genre, year, streaming service, and ratings
- 👥 6-digit room codes for easy session sharing
- 🔄 Tinder-style swiping interface
- 📱 Responsive design
- 🔔 Real-time notifications for matches

## Tech Stack

- **Frontend**: Next.js, TypeScript, TailwindCSS
- **Backend**: Supabase (PostgreSQL + Real-time subscriptions)
- **APIs**: JustWatch API, TMDb API
- **Authentication**: Supabase Auth
- **Hosting**: Vercel

## Getting Started

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```
3. Set up environment variables:
   ```bash
   cp .env.example .env.local
   ```
4. Start the development server:
   ```bash
   npm run dev
   ```

## Environment Variables

Create a `.env.local` file with the following variables:

```
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
TMDB_API_KEY=your_tmdb_api_key
JUSTWATCH_API_KEY=your_justwatch_api_key
```

## Project Structure

```
/
├── app/                # Next.js app directory
│   ├── page.tsx       # Landing page
│   ├── room/          # Room pages
│   └── api/           # API routes
├── components/        # React components
├── lib/              # Utility functions
├── types/            # TypeScript types
└── public/           # Static assets
```

## Database Schema

The app uses Supabase with the following schema:

### Users Table
- id (UUID)
- created_at (timestamp)

### Sessions Table
- id (6-digit room code)
- user1_id (UUID)
- user2_id (UUID)
- status (active, completed)

### Swipes Table
- id
- session_id
- user_id
- movie_id
- swipe (yes/no)

### Matches Table
- session_id
- movie_id
- matched_at

## Contributing

1. Fork the repository
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Create a new Pull Request

## License

MIT
