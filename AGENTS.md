# AGENTS.md – AI Agent Guidelines for `antoni.cv` Monorepo

> This document describes how to navigate, build, and contribute effectively to this Turborepo monorepo, optimized for AI coding agents.

## 📋 Project Overview

This is a **pnpm + Turborepo** monorepo containing:

| Package           | Path            | Description                                                            |
| ----------------- | --------------- | ---------------------------------------------------------------------- |
| `@apps/web`       | `apps/web/`     | Next.js 16 personal portfolio/CV website                               |
| `@turbulence/cms` | `packages/cms/` | Framework-agnostic CMS package with tRPC, Drizzle ORM, and better-auth |

### Tech Stack

- **Package Manager**: pnpm (v10.18+)
- **Build System**: Turborepo
- **Runtime**: Node.js with ES Modules (`"type": "module"`)
- **Language**: TypeScript (strict mode)
- **Frontend**: React 19, Next.js 16, Tailwind CSS v4
- **Database**: PostgreSQL with Drizzle ORM
- **Auth**: better-auth
- **API**: tRPC

---

## 🚀 Quick Commands

All commands should be run from the **repository root** unless otherwise specified.

### Development

```bash
# Install dependencies
pnpm install

# Start all packages in dev mode (web + cms watch)
pnpm dev

# Start only the web app
pnpm dev:web
```

### Building

```bash
# Build all packages (respects dependency order)
pnpm build

# Build only the CMS package
pnpm build:cms

# Build CMS client bundle only
pnpm --filter @turbulence/cms build:client

# Build CMS TypeScript library only
pnpm --filter @turbulence/cms build:lib
```

### Production

```bash
# Start the production Next.js server
pnpm start
```

### Linting

```bash
# Run linting across all packages
pnpm lint
```

### Database (CMS Package)

```bash
# Generate Drizzle migrations
pnpm --filter @turbulence/cms db:generate

# Apply migrations to database
pnpm --filter @turbulence/cms db:migrate

# Push schema directly (dev only)
pnpm --filter @turbulence/cms db:push

# Open Drizzle Studio (database GUI)
pnpm --filter @turbulence/cms db:studio
```

---

## 📁 Project Structure

```
antoni.cv/
├── apps/
│   └── web/                    # Next.js portfolio website
│       ├── app/                # App Router pages and API routes
│       │   ├── admin/          # CMS admin panel route
│       │   ├── api/            # API routes
│       │   ├── layout.tsx      # Root layout
│       │   └── page.tsx        # Home page
│       ├── components/         # React components
│       │   └── ui/             # shadcn/ui components
│       ├── content/            # Static content (profileData.json)
│       ├── lib/                # Utilities and helpers
│       └── public/             # Static assets
│
├── packages/
│   └── cms/                    # @turbulence/cms package
│       ├── client/             # React admin panel source
│       ├── src/                # Server-side CMS logic
│       │   ├── auth/           # Authentication (better-auth)
│       │   ├── db/             # Database (Drizzle ORM)
│       │   ├── storage/        # S3-compatible file storage
│       │   ├── trpc/           # tRPC API routes
│       │   └── templates/      # HTML templates
│       ├── static/             # Built client assets
│       ├── drizzle/            # Database migrations
│       └── docs/               # Documentation
│
├── package.json                # Root package.json with turbo scripts
├── turbo.json                  # Turborepo pipeline configuration
├── pnpm-workspace.yaml         # pnpm workspace definition
└── tsconfig.json               # Root TypeScript config
```

---

## 🔧 Configuration Files

### Environment Variables

The web app requires a `.env` file in `apps/web/`. Copy from the example:

```bash
cp apps/web/.env.example apps/web/.env
```

Required variables:

| Variable               | Description                      |
| ---------------------- | -------------------------------- |
| `DATABASE_URL`         | PostgreSQL connection string     |
| `S3_ENDPOINT`          | S3-compatible storage endpoint   |
| `S3_BUCKET`            | Storage bucket name              |
| `S3_ACCESS_KEY_ID`     | Storage access key               |
| `S3_SECRET_ACCESS_KEY` | Storage secret key               |
| `S3_REGION`            | Storage region (default: `auto`) |
| `S3_PUBLIC_URL`        | Public URL for uploaded files    |
| `AUTH_SECRET`          | Auth secret (min 32 chars)       |
| `NEXT_PUBLIC_APP_URL`  | Base URL of the application      |

### TypeScript Path Aliases

In `apps/web/`, the `@/*` alias maps to the app root:

```typescript
import { loadCV } from "@/lib/loadCV";
import { cn } from "@/lib/utils";
```

---

## 📦 Package Details

### `@apps/web` (Next.js Portfolio)

- **Framework**: Next.js 16 (App Router)
- **Styling**: Tailwind CSS v4 with PostCSS
- **Fonts**: Lexend (Google Fonts)
- **Key Components**:
  - `Profile.tsx` – Main profile/CV display
  - `CVRenderer.tsx` – Renders CV sections
  - `ProjectsRenderer.tsx` – Renders projects
  - UI components in `components/ui/` (shadcn/ui style)

**CV Data Location**: `apps/web/content/profileData.json`

### `@turbulence/cms` (CMS Package)

A self-contained, framework-agnostic CMS with:

- **Database**: Drizzle ORM with PostgreSQL
- **API**: tRPC with public/protected endpoints
- **Auth**: better-auth with email/password
- **Storage**: S3-compatible (AWS S3, Cloudflare R2, MinIO)
- **Client**: React admin panel with Tailwind CSS (style-isolated)

**Exports**:

```typescript
// Main exports
import { createCMS, renderAdminPanel } from "@turbulence/cms";

// Next.js adapter
import { createCMS } from "@turbulence/cms/next";
```

**Database Schema** (`packages/cms/src/db/schema.ts`):

- `cms_user` – User accounts
- `cms_session` – User sessions
- `cms_account` – OAuth accounts
- `cms_verification` – Email verification
- `cms_content_type` – Content schemas
- `cms_content_entry` – Content entries
- `cms_media` – Uploaded files

---

## 🧪 Development Workflow

### 1. Making Changes to the Web App

```bash
# Start dev server
pnpm dev:web

# The app runs at http://localhost:3000
# Admin panel at http://localhost:3000/admin
```

### 2. Making Changes to the CMS Package

```bash
# Option 1: Watch mode (rebuilds on changes)
pnpm --filter @turbulence/cms dev

# Option 2: Full rebuild
pnpm build:cms
```

The CMS has two build outputs:

1. **Library** (`dist/`) – TypeScript compiled server code
2. **Client** (`static/`) – Bundled React admin panel

### 3. Database Changes

```bash
# 1. Edit schema in packages/cms/src/db/schema.ts
# 2. Generate migration
pnpm --filter @turbulence/cms db:generate

# 3. Apply migration
pnpm --filter @turbulence/cms db:migrate
```

---

## ⚡ Turborepo Pipeline

The `turbo.json` defines task dependencies:

```json
{
  "build": {
    "dependsOn": ["^build"], // Build deps first
    "outputs": ["dist/**", ".next/**"]
  },
  "dev": {
    "cache": false,
    "persistent": true // Long-running
  },
  "db:*": {
    "cache": false // Never cache DB ops
  }
}
```

**Key behaviors**:

- `pnpm build` builds packages in dependency order (`@turbulence/cms` → `@apps/web`)
- Dev tasks run persistently (watch mode)
- Database tasks are never cached

---

## 🎯 Common Tasks for AI Agents

### Adding a New Component to Web App

1. Create component in `apps/web/components/`
2. Use existing UI primitives from `components/ui/`
3. Follow existing patterns (functional components, TypeScript)
4. Use `cn()` utility for conditional classes

### Modifying CV Content

Edit `apps/web/content/profileData.json` – the structure includes:

- `general` – Name, byline, avatar
- `contact` – Contact information
- `workExperience` – Work history
- `education` – Education history
- `projects` – Featured projects
- `certifications` – Certificates
- `volunteering` – Volunteer work

### Adding a New API Route

Create in `apps/web/app/api/<name>/route.ts`:

```typescript
export async function GET(request: Request) {
  return Response.json({ data: "..." });
}
```

### Extending CMS Functionality

1. Add tRPC routes in `packages/cms/src/trpc/routers/`
2. Update the main router in `packages/cms/src/trpc/router.ts`
3. Rebuild with `pnpm build:cms`

### Adding Database Tables to CMS

1. Define schema in `packages/cms/src/db/schema.ts`
2. Run `pnpm --filter @turbulence/cms db:generate`
3. Run `pnpm --filter @turbulence/cms db:migrate`

---

## 🚨 Important Notes

1. **ES Modules**: All packages use `"type": "module"`. Use `.js` extensions in imports where needed.

2. **React 19**: This project uses React 19. Be aware of new features and potential breaking changes from React 18.

3. **Tailwind CSS v4**: Uses the new Tailwind v4 syntax and configuration style.

4. **Build Order**: Always build `@turbulence/cms` before `@apps/web` when making CMS changes.

5. **Environment Variables**: The web app uses `dotenv-cli` to load `.env` files. The `with-env` script wraps commands:

   ```bash
   pnpm with-env next dev
   ```

6. **CMS Style Isolation**: The CMS admin panel uses scoped styles that won't affect the host app.

7. **Workspace Protocol**: Internal dependencies use `workspace:*`:
   ```json
   "@turbulence/cms": "workspace:*"
   ```

---

## 📚 Additional Resources

- CMS Documentation: `packages/cms/docs/`

  - [Getting Started](packages/cms/docs/getting-started.md)
  - [Architecture](packages/cms/docs/architecture.md)
  - [Styling Guide](packages/cms/docs/styling.md)
  - [Routing](packages/cms/docs/routing.md)

- [Turborepo Docs](https://turbo.build/repo/docs)
- [pnpm Workspaces](https://pnpm.io/workspaces)
- [Drizzle ORM Docs](https://orm.drizzle.team/)
- [tRPC Docs](https://trpc.io/docs)
- [better-auth Docs](https://www.better-auth.com/)
