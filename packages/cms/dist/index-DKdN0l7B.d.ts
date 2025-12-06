//#region src/create-cms.d.ts
/**
 * Creates a CMS instance with GET and POST handlers
 * Uses Web Standard Request/Response - works with any framework
 */
declare const createCMS: (options?: CreateCMSOptions) => CMSHandlers;
//# sourceMappingURL=create-cms.d.ts.map
//#endregion
//#region src/admin-panel.d.ts
declare const renderAdminPanel: () => string;
//# sourceMappingURL=admin-panel.d.ts.map
//#endregion
//#region src/templates/root.d.ts
declare const htmlTemplate: ({
  title,
  body
}: {
  title: string;
  body: string;
}) => string;
//# sourceMappingURL=root.d.ts.map
//#endregion
//#region src/index.d.ts
type CreateCMSOptions = {
  basePath?: string;
};
type CMSRequest = {
  pathname: string;
  method: string;
  searchParams: URLSearchParams;
  headers: Headers;
  json: () => Promise<unknown>;
};
type CMSHandlers = {
  GET: (req: Request) => Promise<Response>;
  POST: (req: Request) => Promise<Response>;
};
//#endregion
export { renderAdminPanel as a, htmlTemplate as i, CMSRequest as n, createCMS as o, CreateCMSOptions as r, CMSHandlers as t };
//# sourceMappingURL=index-DKdN0l7B.d.ts.map