import { NextRequest, NextResponse } from "next/server";
import { CreateCMSOptions } from "./route-utils";
import { renderAdminPanel } from "./admin-panel";
import { readFile } from "fs/promises";
import { join } from "path";

export const runGetRouter = async (
  req: NextRequest,
  opts: CreateCMSOptions
) => {
  const { pathname } = req.nextUrl;
  const adminRoute = pathname.split(opts.basePath!)[1];

  switch (true) {
    case adminRoute.startsWith("/static/"):
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
        // Read file from cms/static directory
        const filePath = join(process.cwd(), "cms", "static", staticPath);
        const file = await readFile(filePath, "utf-8");

        return new Response(file, {
          headers: {
            "Content-Type": contentType,
            "Cache-Control": "no-store",
          },
        });
      } catch (error) {
        return new Response("Not Found", {
          status: 404,
          headers: {
            "Content-Type": "text/plain",
            "Cache-Control": "no-store",
          },
        });
      }

    default: {
      return new Response(renderAdminPanel(), {
        headers: {
          "Content-Type": "text/html",
          "Cache-Control": "no-store",
        },
      });
    }
  }
};
