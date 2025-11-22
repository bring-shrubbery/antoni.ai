# Architecture Overview

## System Design

The CMS is built with a modern, self-contained architecture that ensures complete isolation from the host project while providing a seamless developer experience.

## Component Structure

```
cms/
├── client/              # React client-side application
│   ├── pages/          # Page components (Login, Dashboard)
│   ├── App.tsx         # Main app component with routing
│   ├── index.tsx       # Client entry point
│   ├── styles.css      # Tailwind CSS entry
│   └── theme.css       # Tailwind theme customization
├── static/             # Built assets (generated)
│   ├── bundle.js       # Compiled React app
│   └── bundle.css      # Compiled styles
├── templates/          # HTML templates
│   └── root.ts         # Base HTML template
├── admin-panel/        # Server-side rendering logic
│   └── index.ts        # Admin panel renderer
├── build.js            # Build script for client assets
├── get-router.tsx      # Request router
├── route-utils.ts      # Core CMS factory function
└── tailwind.config.js  # Isolated Tailwind config
```

## Request Flow

### 1. Request Arrives

```
GET /admin/dashboard
  ↓
Next.js Route Handler (app/admin/[[...slug]]/route.ts)
  ↓
createCMS().GET
```

### 2. Route Processing

```typescript
// cms/route-utils.ts
export const createCMS = (options) => {
  const GET = async (req: NextRequest) => {
    // Validate basePath
    // Delegate to router
    return await runGetRouter(req, opts);
  };
  return { GET, POST };
};
```

### 3. Router Logic

```typescript
// cms/get-router.tsx
export const runGetRouter = async (req, opts) => {
  const adminRoute = pathname.split(opts.basePath)[1];

  if (adminRoute.startsWith("/static/")) {
    // Serve bundled assets (JS, CSS)
    return serveStaticFile();
  } else {
    // Render HTML with React app
    return renderAdminPanel();
  }
};
```

### 4. Response

- **Static Assets**: Served directly from `cms/static/`
- **Pages**: HTML template with client-side React app

## Client-Side Architecture

### React Application

The client-side app is a simple React SPA with client-side routing:

```typescript
// cms/client/App.tsx
export function App() {
  const [currentPath, setCurrentPath] = useState(window.location.pathname);

  // Simple routing logic
  const renderPage = () => {
    if (currentPath.includes("/login")) return <Login />;
    if (currentPath.includes("/dashboard")) return <Dashboard />;
    return <Login />;
  };

  return <div id="cms-app">{renderPage()}</div>;
}
```

### Hydration Strategy

1. Server sends HTML with `<div id="cms-root"></div>`
2. Client loads `bundle.js` and `bundle.css`
3. React mounts on `#cms-root`
4. Application becomes interactive

## Build System

### esbuild Configuration

```javascript
// cms/build.js
esbuild.build({
  entryPoints: ["cms/client/index.tsx"],
  bundle: true,
  outfile: "cms/static/bundle.js",
  format: "iife",
  platform: "browser",
  jsx: "automatic",
  // CSS is ignored in JS bundle
  loader: { ".css": "empty" },
});
```

### CSS Pipeline

```
cms/client/styles.css
  ↓
PostCSS
  ↓
@tailwindcss/postcss (with Tailwind v4)
  ↓
Autoprefixer
  ↓
cms/static/bundle.css
```

## Isolation Strategy

### 1. Scoped Styles

All Tailwind utilities are scoped to `#cms-root`:

```css
/* cms/client/theme.css */
@theme inline {
  --selector: #cms-root;
}
```

This ensures CMS styles only apply within the CMS container.

### 2. No Base Styles Leakage

The CMS uses its own scoped styles that don't affect the parent application:

```css
#cms-root {
  font-family: system-ui, ...;
  line-height: 1.5;
  color: var(--cms-text-primary);
}
```

### 3. Bundle Separation

- CMS has its own `bundle.js` and `bundle.css`
- These are served from `/admin/static/*`
- No dependency on host project's build system

## Web Standards Compliance

The CMS uses Web Standard APIs throughout:

```typescript
// Request/Response API
const GET = async (req: NextRequest): Promise<Response> => {
  return new Response(html, {
    headers: {
      "Content-Type": "text/html",
      "Cache-Control": "no-store",
    },
  });
};
```

This means the CMS can work with:

- Next.js App Router
- Remix
- SvelteKit
- Hono
- CloudFlare Workers
- Any framework supporting Web Standard Request/Response

## Security Considerations

### Current State

- No authentication implemented yet
- All routes are publicly accessible
- Static assets served without authentication

### Planned Features

- Session-based authentication
- CSRF protection
- Role-based access control
- Secure cookie handling

## Performance Characteristics

### Bundle Sizes

- `bundle.js`: ~150KB (unminified with source maps)
- `bundle.css`: ~50KB (with Tailwind utilities)

### Optimization Opportunities

- Enable minification for production (`NODE_ENV=production`)
- Implement code splitting for larger apps
- Add service worker for offline support
- Use CDN for static assets

## Extending the Architecture

The modular design makes it easy to add new features:

1. **New Pages**: Add components to `cms/client/pages/`
2. **API Routes**: Extend the POST handler in `route-utils.ts`
3. **Custom Styling**: Modify `cms/client/theme.css`
4. **Build Process**: Update `cms/build.js`

See [Extending the CMS](./extending.md) for detailed examples (coming soon).
