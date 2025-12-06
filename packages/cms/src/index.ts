// Core CMS types and utilities - framework agnostic
import type { DatabaseConfig } from "./db";
import type { StorageConfig } from "./storage";
import type { AuthConfig } from "./auth";

export type CreateCMSOptions = {
  /**
   * Base path for the CMS admin panel
   * @default "/admin"
   */
  basePath?: string;

  /**
   * Database configuration for Drizzle ORM
   * Supports connection string or individual parameters
   */
  database?: DatabaseConfig;

  /**
   * Storage configuration for file uploads
   * Supports S3-compatible storage (AWS S3, Cloudflare R2, MinIO, etc.)
   */
  storage?: StorageConfig;

  /**
   * Authentication configuration using better-auth
   */
  auth?: AuthConfig;
};

export type CMSRequest = {
  pathname: string;
  method: string;
  searchParams: URLSearchParams;
  headers: Headers;
  json: () => Promise<unknown>;
};

export type CMSHandlers = {
  GET: (req: Request) => Promise<Response>;
  POST: (req: Request) => Promise<Response>;
};

// Core exports
export { createCMS } from "./create-cms";
export { renderAdminPanel } from "./admin-panel";
export { htmlTemplate } from "./templates/root";

// Database exports
export { createDatabase, getDatabase, setDatabase, runMigrations } from "./db";
export type { DatabaseConfig, DrizzleClient } from "./db";
export * from "./db/schema";

// Storage exports
export {
  createStorageClient,
  initStorage,
  getStorage,
  setStorage,
} from "./storage";
export type { StorageConfig, StorageClient, UploadResult } from "./storage";

// Auth exports
export { createAuth, getAuth, getSession, isAuthenticated } from "./auth";
export type { AuthConfig, Auth } from "./auth";

// tRPC exports
export { appRouter, type AppRouter } from "./trpc";
export {
  createTRPCRouter,
  publicProcedure,
  protectedProcedure,
  type TRPCContext,
} from "./trpc";
export { handleTRPCRequest, createContext } from "./trpc/handler";
