import { readFile } from "fs/promises";
import { join } from "path";

//#region src/templates/root.ts
const htmlTemplate = ({ title, body }) => `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <title>${title}</title>
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <link rel="stylesheet" href="/admin/static/bundle.css" />
  <style>
    /* Ensure CMS root takes full viewport */
    body, html {
      margin: 0;
      padding: 0;
      height: 100%;
    }
    #cms-root {
      min-height: 100vh;
    }
  </style>
</head>
<body>
  ${body}
</body>
</html>`;

//#endregion
//#region src/admin-panel.ts
const renderAdminPanel = () => {
	return htmlTemplate({
		title: "CMS Admin Panel",
		body: `
      <div id="cms-root"></div>
      <script src="/admin/static/bundle.js" type="module"><\/script>
    `
	});
};

//#endregion
//#region src/get-router.ts
/**
* Internal router for handling GET requests to the CMS
*/
const runGetRouter = async (req, opts) => {
	const { pathname } = new URL(req.url);
	const adminRoute = pathname.split(opts.basePath)[1] || "";
	if (adminRoute.startsWith("/static/")) {
		const staticPath = adminRoute.replace("/static/", "");
		let contentType = "text/plain";
		if (staticPath.endsWith(".js")) contentType = "application/javascript";
		else if (staticPath.endsWith(".css")) contentType = "text/css";
		else if (staticPath.endsWith(".json")) contentType = "application/json";
		try {
			const possiblePaths = [
				join(process.cwd(), "node_modules", "@turbulence", "cms", "static", staticPath),
				join(process.cwd(), "..", "..", "packages", "cms", "static", staticPath),
				join(process.cwd(), "packages", "cms", "static", staticPath)
			];
			let file = null;
			for (const filePath of possiblePaths) try {
				file = await readFile(filePath, "utf-8");
				break;
			} catch {}
			if (!file) throw new Error("File not found");
			return new Response(file, { headers: {
				"Content-Type": contentType,
				"Cache-Control": "no-store"
			} });
		} catch {
			return new Response("Not Found", {
				status: 404,
				headers: {
					"Content-Type": "text/plain",
					"Cache-Control": "no-store"
				}
			});
		}
	}
	return new Response(renderAdminPanel(), { headers: {
		"Content-Type": "text/html",
		"Cache-Control": "no-store"
	} });
};

//#endregion
//#region src/create-cms.ts
const defaultOptions = { basePath: "/admin" };
/**
* Creates a CMS instance with GET and POST handlers
* Uses Web Standard Request/Response - works with any framework
*/
const createCMS = (options) => {
	const opts = {
		...defaultOptions,
		...options
	};
	const GET = async (req) => {
		const { pathname } = new URL(req.url);
		if (!pathname.startsWith(opts.basePath)) return Response.json({ message: "Please put your CMS in the /admin route. Or customize basePath in the options." });
		return await runGetRouter(req, opts);
	};
	const POST = async (req) => {
		const url = new URL(req.url);
		const { pathname } = url;
		if (!pathname.startsWith(opts.basePath)) return Response.json({ message: "Please put your CMS in the /admin route. Or customize basePath in the options." });
		let body = null;
		try {
			body = await req.json();
		} catch {}
		return Response.json({
			message: "Hello from CMS",
			method: req.method,
			pathname,
			query: url.searchParams.toString(),
			body,
			headers: Object.fromEntries(req.headers.entries())
		});
	};
	return {
		GET,
		POST
	};
};

//#endregion
export { renderAdminPanel as n, htmlTemplate as r, createCMS as t };
//# sourceMappingURL=create-cms-vVtYAhd8.js.map