import { NextRequest, NextResponse } from "next/server";
import { CreateCMSOptions } from "./route-utils";
import { renderToString } from "react-dom/server";
import { renderAdminPanel } from "./admin-panel";
import { readFile } from "fs/promises";

export const runGetRouter = async (
  req: NextRequest,
  opts: CreateCMSOptions
) => {
  const { pathname } = req.nextUrl;
  const adminRoute = pathname.split(opts.basePath!)[1];

  switch (true) {
    case adminRoute.startsWith("/static/"):
      const staticPath = adminRoute.replace("/static/", "");

      if (!staticPath.endsWith(".js")) {
        return new Response("Not Found", {
          status: 404,
          headers: {
            "Content-Type": "text/plain",
            "Cache-Control": "no-store",
          },
        });
      }

      const file = await readFile(
        __dirname + `/../../../../../cms/static/${staticPath}`,
        "utf-8"
      );

      return new Response(file, {
        headers: {
          "Content-Type": "application/javascript",
          "Cache-Control": "no-store",
        },
      });
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
