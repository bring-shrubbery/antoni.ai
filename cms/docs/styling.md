# Styling Guide

## Overview

The CMS uses Tailwind CSS v4 with a special isolation strategy to ensure styles don't conflict with the host project.

## How Style Isolation Works

### 1. Scoped Selector

All Tailwind utilities apply within `#cms-root`:

```css
/* cms/client/theme.css */
@theme inline {
  --selector: #cms-root;
}
```

This means a class like `.bg-blue-500` only works inside the CMS:

```html
<!-- This gets blue background ✓ -->
<div id="cms-root">
  <div class="bg-blue-500">CMS Content</div>
</div>

<!-- This doesn't get blue background ✓ -->
<div class="bg-blue-500">Your App Content</div>
```

### 2. Separate Build Pipeline

The CMS has its own build process:

```bash
pnpm cms:build
```

This generates:

- `cms/static/bundle.css` - Isolated Tailwind CSS
- `cms/static/bundle.js` - React application

These assets are completely separate from your project's build output.

### 3. No Base Styles

The CMS doesn't use Tailwind's preflight (base styles), avoiding global resets:

```css
/* Tailwind preflight is NOT included */
/* Only utilities and components are generated */
```

## Using Tailwind Classes in CMS Components

### Standard Tailwind Classes

Use regular Tailwind utility classes in your CMS components:

```tsx
export function MyComponent() {
  return (
    <div className="p-4 bg-white rounded-lg shadow">
      <h1 className="text-2xl font-bold text-gray-900">Hello CMS</h1>
    </div>
  );
}
```

No prefix needed! The scoping happens automatically via `#cms-root`.

### Responsive Design

All Tailwind responsive utilities work as expected:

```tsx
<div className="w-full md:w-1/2 lg:w-1/3">Responsive width</div>
```

### Dark Mode

Dark mode is supported through the standard Tailwind approach:

```tsx
<div className="bg-white dark:bg-gray-900">Light/Dark content</div>
```

To enable dark mode for the entire CMS, add the `dark` class to `#cms-root`:

```typescript
document.getElementById("cms-root")?.classList.add("dark");
```

## Custom Theme Variables

The CMS defines custom CSS variables for consistent theming:

```css
#cms-root {
  --cms-bg-primary: #ffffff;
  --cms-bg-secondary: #f9fafb;
  --cms-text-primary: #111827;
  --cms-text-secondary: #6b7280;
  --cms-border: #e5e7eb;
  --cms-primary: #3b82f6;
  --cms-primary-hover: #2563eb;
}
```

Use these in your components:

```tsx
<div style={{ backgroundColor: "var(--cms-bg-primary)" }}>Themed content</div>
```

## Extending the Theme

### Adding Custom Colors

Edit `cms/client/theme.css`:

```css
@theme inline {
  --selector: #cms-root;

  /* Add custom theme values */
  --color-brand-primary: #5f51e7;
  --color-brand-secondary: #e751c3;
}
```

Then use in Tailwind config (`cms/tailwind.config.js`):

```javascript
export default {
  theme: {
    extend: {
      colors: {
        brand: {
          primary: "var(--color-brand-primary)",
          secondary: "var(--color-brand-secondary)",
        },
      },
    },
  },
};
```

### Custom Fonts

Add font imports to `cms/client/styles.css`:

```css
@import "tailwindcss";
@import "./theme.css";
@import url("https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap");

#cms-root {
  font-family: "Inter", system-ui, sans-serif;
}
```

## Avoiding Conflicts with Host Project

### What's Protected

✅ Host project's Tailwind classes won't affect CMS
✅ CMS's Tailwind classes won't affect host project
✅ Global styles in host project won't leak into CMS
✅ CMS can use same class names as host without conflicts

### Example: Both Using `bg-blue-500`

```tsx
// Your app (outside CMS)
<div className="bg-blue-500">Uses YOUR blue-500</div>

// Inside CMS
<div id="cms-root">
  <div className="bg-blue-500">Uses CMS blue-500</div>
</div>
```

Both can have different `blue-500` values without conflict!

### What's NOT Protected

⚠️ Changes to base HTML elements from host project may affect CMS
⚠️ Global CSS targeting all `div`, `p`, etc. might leak into CMS
⚠️ CSS with `!important` from host might override CMS styles

### Best Practice

If your host project has aggressive global styles, wrap the CMS in an additional isolation layer:

```tsx
// app/admin/[[...slug]]/layout.tsx
export default function CMSLayout({ children }) {
  return <div className="cms-isolation-wrapper">{children}</div>;
}
```

```css
/* In your global styles */
.cms-isolation-wrapper {
  all: initial;
  display: block;
}
```

## Performance Considerations

### Bundle Size

The generated CSS includes only the utilities you use:

- Login page only: ~30KB
- Login + Dashboard: ~50KB
- Large app with many components: ~100-150KB

Tailwind v4's JIT engine ensures you only get what you need.

### Production Optimization

For production builds:

```bash
NODE_ENV=production pnpm cms:build
```

This enables:

- Minification
- Dead code elimination
- Optimized Tailwind output

## Debugging Styles

### Check Which Styles Are Applied

Use browser DevTools to inspect elements inside `#cms-root`:

1. Right-click element → Inspect
2. Check Styles panel
3. Look for rules scoped to `#cms-root .your-class`

### Verify Isolation

To verify styles aren't leaking:

1. Add a test class in CMS: `<div className="test-cms-unique">`
2. Add same class outside CMS in your app
3. Check if both have same styles (they shouldn't!)

### Common Issues

**Issue**: Styles not applying

```tsx
// ❌ Wrong - forgot to rebuild
// Make changes → View in browser

// ✓ Correct
// Make changes → pnpm cms:build → View in browser
```

**Issue**: Classes not generated

Check that `cms/tailwind.config.js` content paths include your files:

```javascript
content: ["./cms/client/**/*.{ts,tsx}", "./cms/components/**/*.{ts,tsx}"];
```

## Next Steps

- [Architecture Overview](./architecture.md) - Understand the build system
- [Extending the CMS](./extending.md) - Add custom components (coming soon)
