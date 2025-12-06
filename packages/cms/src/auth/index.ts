import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import type { DrizzleClient } from "../db";
import * as schema from "../db/schema";

export interface AuthConfig {
  /**
   * The base URL for the auth routes
   * @default "/api/auth"
   */
  basePath?: string;

  /**
   * Secret key for signing tokens
   * Should be a random string at least 32 characters long
   */
  secret: string;

  /**
   * The base URL of your application
   * e.g., "https://example.com" or "http://localhost:3000"
   */
  baseUrl: string;

  /**
   * Enable email/password authentication
   * @default true
   */
  emailAndPassword?: boolean;

  /**
   * Trusted origins for CORS
   */
  trustedOrigins?: string[];

  /**
   * Social login providers
   */
  socialProviders?: {
    github?: {
      clientId: string;
      clientSecret: string;
    };
    google?: {
      clientId: string;
      clientSecret: string;
    };
  };
}

let authInstance: ReturnType<typeof betterAuth> | null = null;

/**
 * Creates the better-auth instance
 */
export const createAuth = (db: DrizzleClient, config: AuthConfig) => {
  const auth = betterAuth({
    database: drizzleAdapter(db, {
      provider: "pg",
      schema: {
        user: schema.user,
        session: schema.session,
        account: schema.account,
        verification: schema.verification,
      },
    }),
    basePath: config.basePath ?? "/api/auth",
    secret: config.secret,
    baseURL: config.baseUrl,
    trustedOrigins: config.trustedOrigins,
    emailAndPassword: {
      enabled: config.emailAndPassword ?? true,
    },
    socialProviders: {
      ...(config.socialProviders?.github && {
        github: {
          clientId: config.socialProviders.github.clientId,
          clientSecret: config.socialProviders.github.clientSecret,
        },
      }),
      ...(config.socialProviders?.google && {
        google: {
          clientId: config.socialProviders.google.clientId,
          clientSecret: config.socialProviders.google.clientSecret,
        },
      }),
    },
    session: {
      expiresIn: 60 * 60 * 24 * 7, // 7 days
      updateAge: 60 * 60 * 24, // 1 day
    },
  });

  authInstance = auth;
  return auth;
};

/**
 * Get the current auth instance
 */
export const getAuth = () => {
  if (!authInstance) {
    throw new Error(
      "Auth not initialized. Call createAuth() first or pass auth config to createCMS()."
    );
  }
  return authInstance;
};

/**
 * Get session from request using better-auth
 */
export const getSession = async (req: Request) => {
  const auth = getAuth();
  const session = await auth.api.getSession({
    headers: req.headers,
  });
  return session;
};

/**
 * Verify if a request is authenticated
 */
export const isAuthenticated = async (req: Request): Promise<boolean> => {
  try {
    const session = await getSession(req);
    return session !== null && session.session !== null;
  } catch {
    return false;
  }
};

export type Auth = ReturnType<typeof createAuth>;
