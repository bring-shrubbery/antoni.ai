import { defineConfig } from "astro/config";

// https://astro.build/config
import solidJs from "@astrojs/solid-js";
import tailwind from "@astrojs/tailwind";
// import vercel from "@astrojs/vercel/serverless";
import image from "@astrojs/image";
import sitemap from "@astrojs/sitemap";
import prefetch from "@astrojs/prefetch";
import partytown from "@astrojs/partytown";

// https://astro.build/config
export default defineConfig({
  integrations: [
    solidJs(),
    tailwind(),
    image(),
    sitemap(),
    prefetch(),
    partytown(),
  ],
  output: "static",
  // adapter: vercel()
});
