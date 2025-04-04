import { NextRequest, NextResponse } from "next/server";
import { renderToString } from "react-dom/server";
import { Root } from "./layout";
import { runGetRouter } from "./get-router";

export type CreateCMSOptions = {
  basePath?: string;
};

const defaultOptions = {
  basePath: "/admin",
};

export const createCMS = (options?: CreateCMSOptions) => {
  const GET = async (req: NextRequest): Promise<NextResponse | Response> => {
    const opts = { ...defaultOptions, ...options };
    const { pathname } = req.nextUrl;

    const isAdmin = pathname.startsWith(opts.basePath);
    if (!isAdmin) {
      return NextResponse.json({
        message:
          "Please put your CMS in the /admin route. Or customize basePath in the options.",
      });
    }

    return await runGetRouter(req, opts);
  };

  const POST = async (req: NextRequest): Promise<NextResponse> => {
    const opts = { ...defaultOptions, ...options };
    const { pathname } = req.nextUrl;
    const isAdmin = pathname.startsWith(opts.basePath);

    if (!isAdmin) {
      return NextResponse.json({
        message:
          "Please put your CMS in the /admin route. Or customize basePath in the options.",
      });
    }

    return NextResponse.json({
      message: "Hello from CMS",
      method: req.method,
      pathname,
      query: req.nextUrl.searchParams.toString(),
      body: await req.json(),
      headers: Object.fromEntries(req.headers.entries()),
      cookies: Object.fromEntries(req.cookies),
    });
  };

  return { GET, POST };
};
