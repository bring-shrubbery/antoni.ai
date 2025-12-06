import { renderAdminPanel } from "./admin-panel";
import { readFile } from "fs/promises";
import { join } from "path";

type RouterOptions = {
  basePath: string;
};

/**
 * Internal router for handling GET requests to the CMS
 */
export const runGetRouter = async (
  req: Request,
  opts: RouterOptions
): Promise<Response> => {
  const url = new URL(req.url);
  const { pathname } = url;
  const adminRoute = pathname.split(opts.basePath)[1] || "";

  // Handle static assets
  if (adminRoute.startsWith("/static/")) {
    const staticPath = adminRoute.replace("/static/", "");

    // Determine content type
    let contentType = "text/plain";
    if (staticPath.endsWith(".js")) {
      contentType = "application/javascript";
    } else if (staticPath.endsWith(".css")) {
      contentType = "text/css";
    } else if (staticPath.endsWith(".json")) {
      contentType = "application/json";
    }

    try {
      // Try multiple paths to find the static files
      const possiblePaths = [
        // When used as a package in node_modules
        join(
          process.cwd(),
          "node_modules",
          "@turbulence",
          "cms",
          "static",
          staticPath
        ),
        // When running in monorepo development
        join(
          process.cwd(),
          "..",
          "..",
          "packages",
          "cms",
          "static",
          staticPath
        ),
        // Direct path (for development)
        join(process.cwd(), "packages", "cms", "static", staticPath),
      ];

      let file: string | null = null;
      for (const filePath of possiblePaths) {
        try {
          file = await readFile(filePath, "utf-8");
          break;
        } catch {
          // Try next path
        }
      }

      if (!file) {
        throw new Error("File not found");
      }

      return new Response(file, {
        headers: {
          "Content-Type": contentType,
          "Cache-Control": "no-store",
        },
      });
    } catch {
      return new Response("Not Found", {
        status: 404,
        headers: {
          "Content-Type": "text/plain",
          "Cache-Control": "no-store",
        },
      });
    }
  }

  // Default: render the admin panel
  return new Response(renderAdminPanel(), {
    headers: {
      "Content-Type": "text/html",
      "Cache-Control": "no-store",
    },
  });
};
