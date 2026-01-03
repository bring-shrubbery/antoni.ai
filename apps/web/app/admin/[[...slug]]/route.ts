import { createCMS } from "@turbulence/cms/next";

// Example configuration with all production features
// Uncomment and configure when ready to use:
//
export const { GET, POST } = createCMS({
  basePath: "/admin",

  // Database configuration (Drizzle ORM with PostgreSQL)
  database: {
    connectionString: process.env.DATABASE_URL!,
  },

  // Storage configuration (S3-compatible)
  storage: {
    endpoint: process.env.S3_ENDPOINT!,
    bucket: process.env.S3_BUCKET!,
    accessKeyId: process.env.S3_ACCESS_KEY_ID!,
    secretAccessKey: process.env.S3_SECRET_ACCESS_KEY!,
    region: process.env.S3_REGION ?? "auto",
    publicUrl: process.env.S3_PUBLIC_URL,
    urlStyle: "path" as const,
  },

  // Authentication configuration (better-auth)
  auth: {
    secret: process.env.AUTH_SECRET!,
    baseUrl: process.env.NEXT_PUBLIC_APP_URL!,
    emailAndPassword: true,
    trustedOrigins: [process.env.NEXT_PUBLIC_APP_URL!],
  },
});
