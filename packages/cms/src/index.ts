// Core CMS types and utilities - framework agnostic
export type CreateCMSOptions = {
  basePath?: string;
};

export type CMSRequest = {
  pathname: string;
  method: string;
  searchParams: URLSearchParams;
  headers: Headers;
  json: () => Promise<unknown>;
};

export type CMSHandlers = {
  GET: (req: Request) => Promise<Response>;
  POST: (req: Request) => Promise<Response>;
};

export { createCMS } from "./create-cms";
export { renderAdminPanel } from "./admin-panel";
export { htmlTemplate } from "./templates/root";
