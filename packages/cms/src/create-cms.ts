import type { CreateCMSOptions, CMSHandlers } from "./index";
import { runGetRouter } from "./get-router";
import { createDatabase, type DrizzleClient } from "./db";
import { initStorage } from "./storage";
import { createAuth, getAuth } from "./auth";
import { handleTRPCRequest } from "./trpc/handler";

type ResolvedCMSOptions = {
  basePath: string;
  database: boolean;
  storage: boolean;
  auth: boolean;
};

const defaultOptions: ResolvedCMSOptions = {
  basePath: "/admin",
  database: false,
  storage: false,
  auth: false,
};

/**
 * Creates a CMS instance with GET and POST handlers
 * Uses Web Standard Request/Response - works with any framework
 */
export const createCMS = (options?: CreateCMSOptions): CMSHandlers => {
  const opts: ResolvedCMSOptions = {
    ...defaultOptions,
    basePath: options?.basePath ?? defaultOptions.basePath,
    database: !!options?.database,
    storage: !!options?.storage,
    auth: !!options?.auth,
  };

  // Track initialization state
  let initPromise: Promise<DrizzleClient | null> | null = null;
  let initialized = false;

  // Lazy initialization function
  const ensureInitialized = async (): Promise<void> => {
    if (initialized) return;

    if (!initPromise) {
      initPromise = (async () => {
        // Initialize database if config provided (async for migrations)
        let db: DrizzleClient | null = null;
        if (options?.database) {
          db = await createDatabase(options.database);
        }

        // Initialize storage if config provided
        if (options?.storage) {
          initStorage(options.storage);
        }

        // Initialize auth if config provided (requires database)
        if (options?.auth && db) {
          createAuth(db, options.auth);
        }

        initialized = true;
        return db;
      })();
    }

    await initPromise;
  };

  const GET = async (req: Request): Promise<Response> => {
    // Ensure CMS is initialized before handling requests
    await ensureInitialized();

    const url = new URL(req.url);
    const { pathname } = url;

    // Handle auth routes (under /admin/api/auth)
    if (options?.auth && pathname.startsWith(`${opts.basePath}/api/auth`)) {
      const auth = getAuth();
      return auth.handler(req);
    }

    // Handle tRPC routes (under /admin/api/trpc)
    if (pathname.startsWith(`${opts.basePath}/api/trpc`)) {
      return handleTRPCRequest(req);
    }

    const isAdmin = pathname.startsWith(opts.basePath);
    if (!isAdmin) {
      return Response.json({
        message:
          "Please put your CMS in the /admin route. Or customize basePath in the options.",
      });
    }

    return await runGetRouter(req, opts);
  };

  const POST = async (req: Request): Promise<Response> => {
    // Ensure CMS is initialized before handling requests
    await ensureInitialized();

    const url = new URL(req.url);
    const { pathname } = url;

    // Handle auth routes (under /admin/api/auth)
    if (options?.auth && pathname.startsWith(`${opts.basePath}/api/auth`)) {
      const auth = getAuth();
      return auth.handler(req);
    }

    // Handle tRPC routes (under /admin/api/trpc)
    if (pathname.startsWith(`${opts.basePath}/api/trpc`)) {
      return handleTRPCRequest(req);
    }

    const isAdmin = pathname.startsWith(opts.basePath);
    if (!isAdmin) {
      return Response.json({
        message:
          "Please put your CMS in the /admin route. Or customize basePath in the options.",
      });
    }

    let body: unknown = null;
    try {
      body = await req.json();
    } catch {
      // Body might not be JSON
    }

    return Response.json({
      message: "Hello from CMS",
      method: req.method,
      pathname,
      query: url.searchParams.toString(),
      body,
      headers: Object.fromEntries(req.headers.entries()),
    });
  };

  return { GET, POST };
};
