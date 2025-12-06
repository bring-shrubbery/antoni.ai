# Self-Contained CMS

A framework-agnostic, self-contained content management system built with React and Tailwind CSS that can be embedded in any web project using Web Standard Request/Response patterns.

## ✨ Features

- **Framework Agnostic**: Works with Next.js, Remix, SvelteKit, Hono, or any framework supporting Web Standards
- **Zero Dependencies**: Host project doesn't need React, Tailwind, or any specific build tools
- **Style Isolation**: Uses scoped Tailwind CSS that won't interfere with your project's styles
- **Self-Contained**: All assets bundled and served from the CMS itself
- **Simple API**: One function call to set up everything
- **Type-Safe**: Built with TypeScript
- **Modern Stack**: React 19, Tailwind CSS v4, esbuild

## 🚀 Quick Start

### 1. Set Up the Route

Create a catch-all route handler:

```typescript
// app/admin/[[...slug]]/route.ts
import { createCMS } from "@/cms/route-utils";

export const { GET, POST } = createCMS();
```

### 2. Build the CMS

```bash
pnpm cms:build
```

### 3. Access the Admin Panel

Navigate to `http://localhost:3000/admin/login`

That's it! 🎉

## 📖 Documentation

- **[Getting Started](./docs/getting-started.md)** - Installation and basic setup
- **[Architecture](./docs/architecture.md)** - How the system works
- **[Styling Guide](./docs/styling.md)** - Using Tailwind CSS with isolation
- **[Routing](./docs/routing.md)** - Adding routes and navigation

## 🏗️ How It Works

### The Developer Experience You Want

```typescript
// This is all you need!
import { createCMS } from "@/cms/route-utils";
export const { GET, POST } = createCMS();
```

### What Happens Behind the Scenes

1. **Request arrives** at `/admin/dashboard`
2. **Route handler** processes the request
3. **Static assets** (if requested) are served from `cms/static/`
4. **HTML template** is rendered with embedded React app
5. **Client-side** React app hydrates and takes over
6. **Tailwind styles** apply only within `#cms-root` container

### Build System

```bash
# Build once
pnpm cms:build

# Watch mode for development
pnpm cms:watch
```

The build system:

- Bundles React components with esbuild
- Compiles Tailwind CSS with PostCSS
- Outputs to `cms/static/` directory
- No interference with your project's build

## 🎨 Style Isolation

The CMS uses Tailwind CSS v4 with complete isolation:

### How It Works

```html
<!-- Your project -->
<div class="bg-blue-500">Your blue</div>

<!-- CMS (completely isolated) -->
<div id="cms-root">
  <div class="bg-blue-500">CMS blue</div>
</div>
```

Both can define `blue-500` differently without conflict!

### Technical Details

- All Tailwind utilities scoped to `#cms-root`
- Separate build pipeline from host project
- No Tailwind preflight (base styles)
- Works alongside any CSS framework

## 📁 Project Structure

```
cms/
├── client/              # React application
│   ├── pages/          # Page components
│   │   ├── Login.tsx
│   │   └── Dashboard.tsx
│   ├── App.tsx         # Main app with routing
│   ├── index.tsx       # Client entry point
│   ├── styles.css      # Tailwind entry
│   └── theme.css       # Theme configuration
│
├── static/             # Built assets (generated)
│   ├── bundle.js
│   └── bundle.css
│
├── templates/          # HTML templates
│   └── root.ts
│
├── admin-panel/        # Server rendering
│   └── index.ts
│
├── docs/               # Documentation
│
├── build.js            # Build script
├── get-router.tsx      # Route handler
├── route-utils.ts      # CMS factory
└── tailwind.config.js  # Isolated config
```

## 🛠️ Configuration

### Custom Base Path

```typescript
export const { GET, POST } = createCMS({
  basePath: "/cms", // Use /cms instead of /admin
});
```

### Environment Variables

```bash
# Production build (minified)
NODE_ENV=production pnpm cms:build

# Development build (with source maps)
pnpm cms:build
```

## 🔧 Development

### Adding a New Page

1. Create component:

```typescript
// cms/client/pages/Settings.tsx
export function Settings() {
  return <div>Settings Page</div>;
}
```

2. Update router:

```typescript
// cms/client/App.tsx
import { Settings } from "./pages/Settings";

const renderPage = () => {
  if (currentPath.includes("/settings")) return <Settings />;
  // ... other routes
};
```

3. Rebuild:

```bash
pnpm cms:build
```

### Making API Calls

```typescript
// Client-side
const response = await fetch("/admin/api/posts", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ title: "New Post" }),
});

// Server-side (cms/route-utils.ts)
const POST = async (req: NextRequest) => {
  if (pathname === "/admin/api/posts") {
    const body = await req.json();
    // Handle post creation
    return NextResponse.json({ success: true });
  }
};
```

## 🎯 Design Goals

This CMS was built with specific goals:

1. **Web Standards First**: Use Request/Response, not framework-specific APIs
2. **No Lock-in**: Works with any framework, easy to migrate
3. **Developer Experience**: One function call to get started
4. **Production Ready**: Isolated styles, efficient bundles, type-safe
5. **Extensible**: Add features without fighting the architecture

## 🔐 Security (Coming Soon)

Currently, the CMS has no authentication. Planned features:

- Session-based authentication
- CSRF protection
- Role-based access control
- Secure cookie handling

## 📊 Bundle Sizes

- JavaScript: ~150KB (unminified, with source maps)
- CSS: ~50KB (with all utilities)
- Production (minified): ~60KB total

## 🤝 Contributing

This CMS is part of a larger project. To contribute:

1. Make changes in `cms/` directory
2. Run `pnpm cms:build` to test
3. Update documentation in `cms/docs/`
4. Test in your browser

## 📝 License

This project is part of antoni.cv and follows the same license.

## 🙏 Acknowledgments

Built with:

- [React](https://react.dev/) - UI framework
- [Tailwind CSS](https://tailwindcss.com/) - Styling
- [esbuild](https://esbuild.github.io/) - Bundler
- [Next.js](https://nextjs.org/) - (Host framework in this example)

---

**Note**: This is an experimental CMS system built as part of a portfolio project. It demonstrates how to create a truly portable, self-contained admin system that can work in any JavaScript environment.
