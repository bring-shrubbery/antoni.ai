import type { CreateCMSOptions, CMSHandlers } from "./index";
import { runGetRouter } from "./get-router";

const defaultOptions: Required<CreateCMSOptions> = {
  basePath: "/admin",
};

/**
 * Creates a CMS instance with GET and POST handlers
 * Uses Web Standard Request/Response - works with any framework
 */
export const createCMS = (options?: CreateCMSOptions): CMSHandlers => {
  const opts = { ...defaultOptions, ...options };

  const GET = async (req: Request): Promise<Response> => {
    const url = new URL(req.url);
    const { pathname } = url;

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
    const url = new URL(req.url);
    const { pathname } = url;
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
