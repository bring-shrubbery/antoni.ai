import { r as CreateCMSOptions } from "./index-BDhnZF4_.js";
import { NextRequest } from "next/server";

//#region src/next.d.ts

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
declare const createCMS: (options?: CreateCMSOptions) => {
  GET: (req: NextRequest) => Promise<Response>;
  POST: (req: NextRequest) => Promise<Response>;
};
//# sourceMappingURL=next.d.ts.map
//#endregion
export { type CreateCMSOptions, createCMS };
//# sourceMappingURL=next-Cp4JaF4U.d.ts.map