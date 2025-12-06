# Routing System

## Overview

The CMS implements a hybrid routing system that combines server-side route handling with client-side navigation for a smooth user experience.

## Server-Side Routing

### Route Handler Setup

The CMS uses a catch-all route pattern in Next.js:

```typescript
// app/admin/[[...slug]]/route.ts
import { createCMS } from "@/cms/route-utils";

export const { GET, POST } = createCMS();
```

The `[[...slug]]` pattern catches all routes under `/admin/*`:

- `/admin` ✓
- `/admin/login` ✓
- `/admin/dashboard` ✓
- `/admin/any/nested/path` ✓

### Request Processing

When a request arrives:

1. **Path Validation**: Check if it starts with `basePath` (default: `/admin`)
2. **Static Asset Detection**: Serve files from `/static/*` directly
3. **Page Rendering**: Return HTML template for all other routes

```typescript
// Simplified logic
const adminRoute = pathname.split(basePath)[1];

if (adminRoute.startsWith("/static/")) {
  return serveStaticFile();
} else {
  return renderAdminPanel();
}
```

### Static Asset Serving

Static files (JS, CSS) are served with proper content types:

```typescript
// cms/get-router.tsx
let contentType = "text/plain";
if (staticPath.endsWith(".js")) {
  contentType = "application/javascript";
} else if (staticPath.endsWith(".css")) {
  contentType = "text/css";
}

return new Response(fileContent, {
  headers: {
    "Content-Type": contentType,
    "Cache-Control": "no-store",
  },
});
```

## Client-Side Routing

### React Router

The client implements a simple routing system:

```typescript
// cms/client/App.tsx
export function App() {
  const [currentPath, setCurrentPath] = useState(window.location.pathname);

  useEffect(() => {
    const handlePopState = () => {
      setCurrentPath(window.location.pathname);
    };
    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, []);

  const renderPage = () => {
    if (currentPath.includes("/login")) return <Login />;
    if (currentPath.includes("/dashboard")) return <Dashboard />;
    return <Login />;
  };

  return <div id="cms-app">{renderPage()}</div>;
}
```

### Navigation

Currently, navigation uses full page reloads:

```typescript
// Simple navigation
window.location.href = "/admin/dashboard";
```

This works but causes full page refreshes. For better UX, implement programmatic navigation:

```typescript
// Future improvement: SPA navigation
const navigate = (path: string) => {
  window.history.pushState({}, "", path);
  window.dispatchEvent(new PopStateEvent("popstate"));
};

// Usage
<button onClick={() => navigate("/admin/dashboard")}>Go to Dashboard</button>;
```

## Adding New Routes

### 1. Create Page Component

```typescript
// cms/client/pages/Settings.tsx
export function Settings() {
  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold">Settings</h1>
      {/* Settings content */}
    </div>
  );
}
```

### 2. Update Router

```typescript
// cms/client/App.tsx
import { Settings } from "./pages/Settings";

const renderPage = () => {
  if (currentPath.includes("/login")) return <Login />;
  if (currentPath.includes("/dashboard")) return <Dashboard />;
  if (currentPath.includes("/settings")) return <Settings />;
  return <Login />;
};
```

### 3. Add Navigation Link

```tsx
// In Dashboard.tsx or other component
<a href="/admin/settings" className="text-blue-600 hover:underline">
  Settings
</a>
```

### 4. Rebuild

```bash
pnpm cms:build
```

## Route Parameters

### Dynamic Routes

To implement dynamic routes like `/admin/posts/:id`:

```typescript
// Extract route params
const match = currentPath.match(/\/admin\/posts\/(\d+)/);
const postId = match ? match[1] : null;

if (match) {
  return <PostDetail postId={postId} />;
}
```

### Query Parameters

Access query parameters using URLSearchParams:

```typescript
const searchParams = new URLSearchParams(window.location.search);
const tab = searchParams.get("tab");

// URL: /admin/dashboard?tab=analytics
// tab = "analytics"
```

## Protected Routes

### Current State

All routes are currently public. To add authentication:

```typescript
// cms/client/App.tsx
const renderPage = () => {
  const isAuthenticated = checkAuth(); // Your auth logic

  if (!isAuthenticated && !currentPath.includes("/login")) {
    return <Login />;
  }

  // ... rest of routing logic
};
```

### Session Management

Implement session checking:

```typescript
function checkAuth(): boolean {
  // Check for auth token in localStorage
  const token = localStorage.getItem("cms-auth-token");

  if (!token) return false;

  // Validate token (you may want to check expiry)
  try {
    const payload = JSON.parse(atob(token.split(".")[1]));
    return payload.exp > Date.now() / 1000;
  } catch {
    return false;
  }
}
```

## API Route Handling

### POST Requests

The POST handler is already set up:

```typescript
// cms/route-utils.ts
const POST = async (req: NextRequest): Promise<NextResponse> => {
  const { pathname } = req.nextUrl;
  const body = await req.json();

  // Route to different handlers based on path
  if (pathname === "/admin/api/login") {
    return handleLogin(body);
  }

  if (pathname === "/admin/api/posts") {
    return handleCreatePost(body);
  }

  return NextResponse.json({ error: "Not found" }, { status: 404 });
};
```

### Making API Calls from Client

```typescript
// In your React components
async function login(email: string, password: string) {
  const response = await fetch("/admin/api/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });

  if (response.ok) {
    const data = await response.json();
    localStorage.setItem("cms-auth-token", data.token);
    navigate("/admin/dashboard");
  }
}
```

## Advanced Routing Patterns

### Nested Routes

For complex applications with nested layouts:

```typescript
// cms/client/layouts/DashboardLayout.tsx
export function DashboardLayout({ children }) {
  return (
    <div className="flex h-screen">
      <Sidebar />
      <main className="flex-1 overflow-auto">{children}</main>
    </div>
  );
}

// In App.tsx
if (currentPath.startsWith("/admin/dashboard")) {
  return <DashboardLayout>{renderDashboardSubroute()}</DashboardLayout>;
}
```

### Route Transitions

Add smooth transitions between routes:

```typescript
// Using Framer Motion
import { AnimatePresence, motion } from "framer-motion";

<AnimatePresence mode="wait">
  <motion.div
    key={currentPath}
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: -20 }}
    transition={{ duration: 0.2 }}
  >
    {renderPage()}
  </motion.div>
</AnimatePresence>;
```

## Best Practices

### 1. Route Organization

Keep routes organized and predictable:

```
/admin/login          → Login page
/admin/dashboard      → Main dashboard
/admin/posts          → Posts list
/admin/posts/:id      → Post detail
/admin/posts/new      → Create new post
/admin/settings       → Settings page
/admin/api/*          → API endpoints
```

### 2. Loading States

Show loading indicators during navigation:

```typescript
const [isLoading, setIsLoading] = useState(false);

const navigate = (path: string) => {
  setIsLoading(true);
  window.location.href = path;
};

{
  isLoading && <LoadingSpinner />;
}
```

### 3. Error Boundaries

Wrap routes in error boundaries:

```typescript
<ErrorBoundary fallback={<ErrorPage />}>{renderPage()}</ErrorBoundary>
```

### 4. Breadcrumbs

Add breadcrumbs for complex navigation:

```typescript
function getBreadcrumbs(path: string) {
  const parts = path.split("/").filter(Boolean);
  return parts.map((part, i) => ({
    label: capitalize(part),
    path: "/" + parts.slice(0, i + 1).join("/"),
  }));
}
```

## Troubleshooting

### Route Not Working

1. Check the route pattern in `App.tsx`
2. Verify the path includes the basePath (`/admin`)
3. Rebuild the CMS: `pnpm cms:build`
4. Clear browser cache

### Static Assets 404

1. Verify files exist in `cms/static/`
2. Check file permissions
3. Confirm static path handling in `get-router.tsx`

### Navigation Not Updating

1. Ensure `popstate` event listener is set up
2. Check state is updating in React
3. Verify component is re-rendering

## Next Steps

- [Architecture Overview](./architecture.md) - Understand the full system
- [API Development](./api-development.md) - Build API endpoints (coming soon)
- [Authentication Guide](./authentication.md) - Implement auth (coming soon)
