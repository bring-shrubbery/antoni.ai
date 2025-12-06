import { defineConfig } from "tsdown";

export default defineConfig({
  entry: {
    index: "./src/index.ts",
    next: "./src/next.ts",
  },
  format: ["esm"],
  dts: true,
  clean: true,
  external: [
    "next",
    "next/server",
    "react",
    "react-dom",
    "drizzle-orm",
    "drizzle-orm/pg-core",
    "drizzle-orm/node-postgres",
    "@trpc/server",
    "@trpc/server/adapters/fetch",
    "@trpc/client",
    "better-auth",
    "better-auth/adapters/drizzle",
    "zod",
    "superjson",
  ],
  outDir: "dist",
});
