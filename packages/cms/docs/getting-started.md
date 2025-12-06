# Getting Started

## Overview

This CMS is a self-contained, framework-agnostic content management system that can be embedded into any web project. It uses Web Standard Request/Response patterns and doesn't require any specific framework dependencies from your host project.

## Features

- 🚀 **Framework Agnostic** - Works with any web framework that supports Web Standard Request/Response
- 🎨 **Isolated Styling** - Uses scoped Tailwind CSS that won't interfere with your project's styles
- ⚡ **Zero Configuration** - Just call `createCMS()` and you're ready
- 🔒 **Secure** - Built-in authentication support (coming soon)
- 📦 **Self-Contained** - All assets are bundled and served from the CMS itself

## Quick Start

### Installation

The CMS is already included in this project. To use it in your routes:

```typescript
import { createCMS } from "@/cms/route-utils";

export const { GET, POST } = createCMS();
```

That's it! Your CMS is now available at `/admin`.

### Building the CMS

Before using the CMS, you need to build the client-side assets:

```bash
pnpm cms:build
```

This compiles the React components and generates the bundled JavaScript and CSS files.

For development with auto-rebuild on changes:

```bash
pnpm cms:watch
```

### Accessing the CMS

Once configured, you can access the CMS at:

- Login page: `http://localhost:3000/admin/login`
- Dashboard: `http://localhost:3000/admin/dashboard`

## Configuration

The `createCMS()` function accepts optional configuration:

```typescript
export const { GET, POST } = createCMS({
  basePath: "/admin", // Default: "/admin"
});
```

### Custom Base Path

To use a different route for your CMS:

```typescript
// Use /cms instead of /admin
export const { GET, POST } = createCMS({
  basePath: "/cms",
});
```

Then place this in `app/cms/[[...slug]]/route.ts` instead of `app/admin/[[...slug]]/route.ts`.

## Development Workflow

1. Make changes to CMS components in `cms/client/`
2. Run `pnpm cms:build` to rebuild
3. Refresh your browser to see changes

## Next Steps

- [Architecture Overview](./architecture.md) - Understand how the CMS works
- [Styling Guide](./styling.md) - Learn about the isolated styling approach
- [Extending the CMS](./extending.md) - Add your own features (coming soon)
