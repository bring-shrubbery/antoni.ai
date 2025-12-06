import { drizzle } from "drizzle-orm/node-postgres";
import { migrate } from "drizzle-orm/node-postgres/migrator";
import type { NodePgDatabase } from "drizzle-orm/node-postgres";
import { join, dirname } from "path";
import { fileURLToPath } from "url";
import { existsSync } from "fs";
import * as schema from "./schema";

export type DrizzleClient = NodePgDatabase<typeof schema>;

export type DatabaseConfig =
  | {
      // Connection string
      connectionString: string;
      /**
       * Automatically run migrations on startup
       * @default true
       */
      autoMigrate?: boolean;
    }
  | {
      // Individual connection parameters
      host: string;
      port?: number;
      user: string;
      password: string;
      database: string;
      ssl?: boolean;
      /**
       * Automatically run migrations on startup
       * @default true
       */
      autoMigrate?: boolean;
    };

let dbInstance: DrizzleClient | null = null;
let migrationRun = false;

/**
 * Get the path to the migrations folder
 * Works both in development and when installed as a package
 */
const getMigrationsPath = (): string => {
  const possiblePaths: string[] = [];

  // Try to get __dirname equivalent in ESM
  try {
    const __filename = fileURLToPath(import.meta.url);
    const __dirname = dirname(__filename);

    // From dist folder (when built): dist/db/index.js -> drizzle
    possiblePaths.push(join(__dirname, "..", "..", "drizzle"));

    // From src folder (in dev with transpilation): src/db/index.ts -> drizzle
    possiblePaths.push(join(__dirname, "..", "..", "drizzle"));
  } catch {
    // Ignore ESM path resolution errors
  }

  // Monorepo development paths
  possiblePaths.push(join(process.cwd(), "packages", "cms", "drizzle"));
  possiblePaths.push(
    join(process.cwd(), "..", "..", "packages", "cms", "drizzle")
  );

  // When installed as a package in node_modules
  possiblePaths.push(
    join(process.cwd(), "node_modules", "@turbulence", "cms", "drizzle")
  );

  // Find the first path that exists
  for (const path of possiblePaths) {
    const journalPath = join(path, "meta", "_journal.json");
    if (existsSync(journalPath)) {
      console.log(`[CMS] Found migrations at: ${path}`);
      return path;
    }
  }

  // Log attempted paths for debugging
  console.error(
    "[CMS] Could not find migrations folder. Tried:",
    possiblePaths
  );

  // Return the most likely path as fallback
  return possiblePaths[0];
};

/**
 * Run schema migrations using Drizzle's migrator
 * Migrations are auto-generated from the schema using `drizzle-kit generate`
 */
export const runMigrations = async (db: DrizzleClient): Promise<void> => {
  if (migrationRun) {
    return;
  }

  console.log("[CMS] Running database migrations...");

  try {
    const migrationsFolder = getMigrationsPath();

    await migrate(db, {
      migrationsFolder,
    });

    migrationRun = true;
    console.log("[CMS] Database migrations complete.");
  } catch (error) {
    console.error("[CMS] Migration error:", error);
    throw error;
  }
};

/**
 * Creates or returns existing database client
 */
export const createDatabase = async (
  config: DatabaseConfig
): Promise<DrizzleClient> => {
  if (dbInstance) {
    return dbInstance;
  }

  let connectionString: string;
  const autoMigrate = config.autoMigrate ?? true;

  if ("connectionString" in config) {
    connectionString = config.connectionString;
  } else {
    const { host, port = 5432, user, password, database, ssl } = config;
    connectionString = `postgresql://${user}:${password}@${host}:${port}/${database}${
      ssl ? "?sslmode=require" : ""
    }`;
  }

  dbInstance = drizzle(connectionString, { schema });

  // Run migrations automatically if enabled
  if (autoMigrate) {
    await runMigrations(dbInstance);
  }

  return dbInstance;
};

/**
 * Get the current database instance
 * Throws if database hasn't been initialized
 */
export const getDatabase = (): DrizzleClient => {
  if (!dbInstance) {
    throw new Error(
      "Database not initialized. Call createDatabase() first or pass database config to createCMS()."
    );
  }
  return dbInstance;
};

/**
 * Set an external database instance (useful for testing or custom setup)
 */
export const setDatabase = (db: DrizzleClient): void => {
  dbInstance = db;
};

export { schema };
export * from "./schema";
