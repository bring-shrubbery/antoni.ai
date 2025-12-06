import type { CreateCMSOptions, CMSHandlers } from "./index";
import { runGetRouter } from "./get-router";
import { createDatabase, type DrizzleClient } from "./db";
import { initStorage, getStorage } from "./storage";
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
          createAuth(db, {
            ...options.auth,
            authBasePath: `${opts.basePath}/api/auth`,
          });
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

    // Handle media proxy (under /admin/api/media/)
    if (pathname.startsWith(`${opts.basePath}/api/media/`)) {
      return handleMediaProxy(req, opts.basePath, options?.storage);
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

    // Handle file upload (under /admin/api/upload)
    if (pathname.startsWith(`${opts.basePath}/api/upload`)) {
      return handleUpload(req, options?.storage);
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

/**
 * Handle file upload requests
 * Accepts JSON body with base64 encoded data to avoid binary corruption in Next.js 16
 */
async function handleUpload(
  req: Request,
  storageConfigured?: unknown
): Promise<Response> {
  if (!storageConfigured) {
    return Response.json({ error: "Storage not configured" }, { status: 500 });
  }

  try {
    // Parse JSON body with base64 encoded file data
    const body = await req.json();
    const { filename, contentType, data } = body as {
      filename?: string;
      contentType?: string;
      data?: string;
    };

    if (!data || !filename) {
      return Response.json(
        { error: "Missing required fields: filename, data" },
        { status: 400 }
      );
    }

    // Decode base64 to binary
    const binaryString = atob(data);
    const bytes = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }

    // Create a Blob from the decoded bytes
    const blob = new Blob([bytes], {
      type: contentType || "application/octet-stream",
    });

    const storage = getStorage();
    const result = await storage.upload(blob, {
      filename,
      contentType: contentType || "application/octet-stream",
      folder: "uploads",
    });

    // Return a proxied URL that goes through our backend
    // This avoids CORS issues with private buckets like Railway
    const url = new URL(req.url);
    const basePath = url.pathname.replace("/api/upload", "");
    const proxyUrl = `${url.origin}${basePath}/api/media/${result.bucketPath}`;

    return Response.json({
      url: proxyUrl,
      bucketPath: result.bucketPath,
      filename: result.filename,
    });
  } catch (error) {
    console.error("Upload error:", error);
    return Response.json(
      { error: error instanceof Error ? error.message : "Upload failed" },
      { status: 500 }
    );
  }
}

/**
 * Handle media proxy requests - serves files from the bucket through the backend
 * This avoids CORS issues with private buckets
 */
async function handleMediaProxy(
  req: Request,
  basePath: string,
  storageConfigured?: unknown
): Promise<Response> {
  if (!storageConfigured) {
    return Response.json({ error: "Storage not configured" }, { status: 500 });
  }

  try {
    const url = new URL(req.url);
    const mediaPath = url.pathname.replace(`${basePath}/api/media/`, "");

    if (!mediaPath) {
      return Response.json({ error: "No file path provided" }, { status: 400 });
    }

    const storage = getStorage();

    // Fetch the file from the bucket with authentication
    const response = await storage.fetch(mediaPath);

    if (!response.ok) {
      return new Response(`File not found: ${response.status}`, {
        status: 404,
      });
    }

    // Get the content type from the response or infer from extension
    const contentType =
      response.headers.get("Content-Type") || getContentTypeFromPath(mediaPath);

    // Get the body as an ArrayBuffer to preserve binary data
    const buffer = await response.arrayBuffer();

    // Return the binary data
    return new Response(buffer, {
      status: 200,
      headers: {
        "Content-Type": contentType,
        "Cache-Control": "public, max-age=31536000, immutable",
        "Access-Control-Allow-Origin": "*",
      },
    });
  } catch (error) {
    console.error("Media proxy error:", error);
    return Response.json(
      {
        error: error instanceof Error ? error.message : "Failed to fetch file",
      },
      { status: 500 }
    );
  }
}

/**
 * Get content type from file path extension
 */
function getContentTypeFromPath(path: string): string {
  const ext = path.split(".").pop()?.toLowerCase();
  const mimeTypes: Record<string, string> = {
    jpg: "image/jpeg",
    jpeg: "image/jpeg",
    png: "image/png",
    gif: "image/gif",
    webp: "image/webp",
    svg: "image/svg+xml",
    ico: "image/x-icon",
    pdf: "application/pdf",
    json: "application/json",
    txt: "text/plain",
    html: "text/html",
    css: "text/css",
    js: "application/javascript",
    mp4: "video/mp4",
    webm: "video/webm",
    mp3: "audio/mpeg",
    wav: "audio/wav",
  };
  return mimeTypes[ext || ""] || "application/octet-stream";
}
