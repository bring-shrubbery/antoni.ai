import { defineConfig } from "tsdown";

export default defineConfig({
  entry: {
    index: "./src/index.ts",
    next: "./src/next.ts",
  },
  format: ["esm"],
  dts: true,
  clean: true,
  external: ["next", "next/server", "react", "react-dom"],
  outDir: "dist",
});
