# Personal CV Website

A personal CV/portfolio website built with Vite, React 19, and Tanstack Router.

## Tech Stack

- **Build Tool**: Vite 7
- **Framework**: React 19
- **Routing**: Tanstack Router
- **Styling**: Tailwind CSS v4
- **API Server**: Express
- **TypeScript**: Full type safety

## Development

```bash
# Start Vite dev server (frontend)
pnpm dev

# Start Express API server (backend)
pnpm dev:server
```

The Vite dev server proxies `/api` and `/admin` requests to the Express server running on port 3001.

## Building

```bash
# Build the frontend (Vite)
pnpm build

# This will:
# 1. Compile TypeScript
# 2. Build the Vite app
# 3. Compile the Express server
```

## Production

```bash
# Start the production server
pnpm start
```

This serves the static files from `dist/` and handles API requests through Express.

## Project Structure

```
apps/web/
├── src/
│   ├── routes/          # Tanstack Router routes
│   │   ├── __root.tsx   # Root layout with theme
│   │   └── index.tsx    # Home page
│   ├── components/      # React components
│   │   ├── ui/         # Reusable UI components
│   │   ├── Profile.tsx # Main profile component
│   │   ├── CVRenderer.tsx  # CV sections renderer
│   │   └── ProjectsRenderer.tsx  # Projects display
│   ├── lib/            # Utilities
│   │   ├── loadCV.tsx  # CV data loader
│   │   └── utils.ts    # Helper functions
│   ├── main.tsx        # Entry point
│   ├── globals.css     # Global styles
│   └── vite-env.d.ts   # Vite type definitions
├── api/                # Express API handlers
│   ├── markdown.ts     # Markdown export
│   └── admin.ts        # CMS admin handler
├── content/            # Static data
│   └── profileData.json  # CV data
├── public/             # Static assets
│   ├── robots.txt
│   └── sitemap.xml
├── server.ts           # Express server
├── index.html          # HTML template
├── vite.config.ts      # Vite configuration
└── tsconfig.json       # TypeScript config
```

## Routes

- `/` - Homepage with CV and projects
- `/api/markdown` - Export CV as Markdown
- `/admin/*` - CMS admin panel (powered by @turbulence/cms)

## Key Features

- **Static Pre-rendering**: The homepage is pre-rendered at build time
- **Dark Mode**: Theme switching with localStorage persistence
- **Responsive**: Mobile-first design with Tailwind CSS
- **Type-safe Routing**: Tanstack Router with full TypeScript support
- **CMS Integration**: Headless CMS for content management

## Environment Variables

Copy `.env.example` to `.env` and configure:

```env
DATABASE_URL=postgresql://...
S3_ENDPOINT=https://...
S3_BUCKET=...
S3_ACCESS_KEY_ID=...
S3_SECRET_ACCESS_KEY=...
S3_REGION=auto
S3_PUBLIC_URL=https://...
AUTH_SECRET=...
NEXT_PUBLIC_APP_URL=http://localhost:3000
```
