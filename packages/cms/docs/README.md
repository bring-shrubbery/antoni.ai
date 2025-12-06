# CMS Documentation Index

Welcome to the Self-Contained CMS documentation!

## Quick Links

### 📚 Getting Started

- **[README](../README.md)** - Project overview and quick start
- **[Getting Started Guide](./getting-started.md)** - Detailed setup instructions

### 🏗️ Understanding the System

- **[Architecture Overview](./architecture.md)** - How everything works together
- **[UI Implementation](./ui-implementation.md)** - Details about the current implementation

### 🎨 Development Guides

- **[Styling Guide](./styling.md)** - Using Tailwind CSS with isolation
- **[Routing System](./routing.md)** - Navigation and route handling

### 📋 Reference

- **[Summary](./SUMMARY.md)** - Quick reference and current status

## What Is This CMS?

A framework-agnostic, self-contained content management system that you can embed in any web project with a single function call:

```typescript
import { createCMS } from "@/cms/route-utils";
export const { GET, POST } = createCMS();
```

## Key Features

✨ **Framework Agnostic** - Works with Next.js, Remix, SvelteKit, or any framework  
🎨 **Style Isolation** - Tailwind CSS won't conflict with your project  
⚡ **Zero Config** - One function call and you're done  
📦 **Self-Contained** - All assets bundled and served from the CMS  
🔧 **TypeScript** - Fully typed for great DX

## Current Status

**Version**: 1.0.0  
**Status**: ✅ Production Ready (for basic admin UI)

**What Works**:

- ✅ Login page
- ✅ Dashboard page
- ✅ Client-side routing
- ✅ Isolated styling
- ✅ Build system
- ✅ Static asset serving

**What's Next**:

- 🚧 Authentication
- 🚧 Content management
- 🚧 API integration
- 🚧 Plugin system

## Documentation Structure

```
docs/
├── README.md                  # This file
├── getting-started.md         # Setup and installation
├── architecture.md            # System architecture
├── styling.md                 # Styling with Tailwind
├── routing.md                 # Routing system
├── ui-implementation.md       # Implementation details
└── SUMMARY.md                 # Development summary
```

## Quick Start

1. **Build the CMS**:

   ```bash
   pnpm cms:build
   ```

2. **Start your dev server**:

   ```bash
   pnpm dev
   ```

3. **Open the admin panel**:
   - Login: http://localhost:3000/admin/login
   - Dashboard: http://localhost:3000/admin/dashboard

## Need Help?

1. Check the [Getting Started Guide](./getting-started.md) for setup issues
2. Read the [Architecture Overview](./architecture.md) to understand the system
3. See the [Styling Guide](./styling.md) for CSS-related questions
4. Review the [Routing System](./routing.md) for navigation help

## Contributing

To add features:

1. Create components in `cms/client/pages/`
2. Update routing in `cms/client/App.tsx`
3. Run `pnpm cms:build`
4. Update relevant documentation

## License

Part of the antoni.cv project.

---

**Last Updated**: November 22, 2025
