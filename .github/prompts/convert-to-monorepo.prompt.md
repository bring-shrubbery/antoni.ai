---
agent: agent
---

This project right now is a regular next.js project, with the `cms/` folder containing the code for a mini CMS that is framework agnostic.

We need to convert this project into a monorepo structure, where the CMS is its own package inside the monorepo. The root-level Next.js project should also be in its' own `apps/web` folder.

The Next.js project should depend on the CMS package, and use it to provide the CMS functionality at the `/admin` route, as if it was importing it from npm. This means we need to set up proper build scripts, package.json files, and any necessary configuration to make this work smoothly in a monorepo setup.

For building the cms package, please use `tsdown` as the build tool, and make sure to configure it properly to output the necessary files for the Next.js app to consume. We should also set it up to be publishable to npm, with proper versioning and dependencies listed in its package.json. CMS package should be named `@turbulence/cms`.
