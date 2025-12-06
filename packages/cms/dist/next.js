import { t as createCMS$1 } from "./create-cms-DWis62uY.js";

//#region src/next.ts
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
const createCMS = (options) => {
	const cmsHandlers = createCMS$1(options);
	const GET = async (req) => {
		const url = req.nextUrl;
		return cmsHandlers.GET(new Request(url.toString(), {
			method: req.method,
			headers: req.headers
		}));
	};
	const POST = async (req) => {
		const url = req.nextUrl;
		const body = await req.text();
		return cmsHandlers.POST(new Request(url.toString(), {
			method: req.method,
			headers: req.headers,
			body
		}));
	};
	return {
		GET,
		POST
	};
};

//#endregion
export { createCMS };
//# sourceMappingURL=next.js.map