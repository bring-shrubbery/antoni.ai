// Next.js specific adapter for @turbulence/cms
import type { NextRequest } from "next/server";
import { createCMS as createCMSCore } from "./create-cms";
import type { CreateCMSOptions } from "./index";

export type { CreateCMSOptions } from "./index";

/**
 * Creates CMS handlers specifically for Next.js App Router
 *
 * @example
 * ```ts
 * // app/admin/[[...slug]]/route.ts
 * import { createCMS } from "@turbulence/cms/next";
 * export const { GET, POST } = createCMS();
 * ```
 */
export const createCMS = (options?: CreateCMSOptions) => {
  const cmsHandlers = createCMSCore(options);

  const GET = async (req: NextRequest): Promise<Response> => {
    const url = req.nextUrl;
    return cmsHandlers.GET(
      new Request(url.toString(), {
        method: req.method,
        headers: req.headers,
      })
    );
  };

  const POST = async (req: NextRequest): Promise<Response> => {
    const url = req.nextUrl;
    const body = await req.text();
    return cmsHandlers.POST(
      new Request(url.toString(), {
        method: req.method,
        headers: req.headers,
        body,
      })
    );
  };

  return { GET, POST };
};
