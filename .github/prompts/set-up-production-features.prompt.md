---
agent: agent
---

Let's now start creating a more real cms setup:

1. Database setup

The `createCMS` function should accept a `database` parameter, which should match the Drizzle ORM's `drizzle` function parameters 1 to 1. Drizzle orm should be used for both storing the data schema and for the users' data. We should define the db schema for the CMS itself, and the dynamic content should be modeled using that schema. We can use zod/standard schema if we need to store data in jsonb parameters, to make sure everything is type-safe and stable.

2. Storage setup

User should also be able to provide a url to the bucket connection where they want to store the files via the `createCMS` function parameters.

3. API setup

We should setup a trpc api layer for communicaation betwen CMS's server and client. The same API will also be used for the client connections later. Please also setup example public and private endpoint.

4. Authentication setup

We should use better-auth for authentication, and use it for the CMS auth. Use it for private trpc endpoints of course.
