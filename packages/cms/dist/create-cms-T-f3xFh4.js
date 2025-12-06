import { t as __export } from "./chunk-DGgIvueF.js";
import { readFile } from "fs/promises";
import { dirname, join } from "path";
import { drizzle } from "drizzle-orm/node-postgres";
import { migrate } from "drizzle-orm/node-postgres/migrator";
import { fileURLToPath } from "url";
import { existsSync } from "fs";
import { boolean, integer, jsonb, pgTable, text, timestamp, uniqueIndex, uuid } from "drizzle-orm/pg-core";
import { and, asc, desc, eq, sql } from "drizzle-orm";
import { z } from "zod";
import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { fetchRequestHandler } from "@trpc/server/adapters/fetch";
import { TRPCError, initTRPC } from "@trpc/server";
import superjson from "superjson";

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
		let contentType$1 = "text/plain";
		if (staticPath.endsWith(".js")) contentType$1 = "application/javascript";
		else if (staticPath.endsWith(".css")) contentType$1 = "text/css";
		else if (staticPath.endsWith(".json")) contentType$1 = "application/json";
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
				"Content-Type": contentType$1,
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
//#region src/db/schema.ts
var schema_exports = /* @__PURE__ */ __export({
	account: () => account,
	arrayItemTypeEnum: () => arrayItemTypeEnum,
	collectionFieldSchema: () => collectionFieldSchema,
	contentEntry: () => contentEntry,
	contentFieldSchema: () => contentFieldSchema,
	contentType: () => contentType,
	contentTypeSchemaValidator: () => contentTypeSchemaValidator,
	fieldTypeEnum: () => fieldTypeEnum,
	media: () => media,
	session: () => session,
	user: () => user,
	userRoleEnum: () => userRoleEnum,
	verification: () => verification
});
/**
* User roles in the CMS
* - superadmin: Full access, can manage other admins
* - admin: Can manage content
* - editor: Can edit content but not publish
*/
const userRoleEnum = [
	"superadmin",
	"admin",
	"editor"
];
const user = pgTable("cms_user", {
	id: text("id").primaryKey(),
	name: text("name").notNull(),
	email: text("email").notNull().unique(),
	emailVerified: boolean("email_verified").notNull().default(false),
	image: text("image"),
	role: text("role", { enum: userRoleEnum }).notNull().default("editor"),
	createdAt: timestamp("created_at").notNull().defaultNow(),
	updatedAt: timestamp("updated_at").notNull().defaultNow()
}, (table) => [uniqueIndex("cms_user_unique_superadmin").on(table.role).where(sql`${table.role} = 'superadmin'`)]);
const session = pgTable("cms_session", {
	id: text("id").primaryKey(),
	expiresAt: timestamp("expires_at").notNull(),
	token: text("token").notNull().unique(),
	createdAt: timestamp("created_at").notNull().defaultNow(),
	updatedAt: timestamp("updated_at").notNull().defaultNow(),
	ipAddress: text("ip_address"),
	userAgent: text("user_agent"),
	userId: text("user_id").notNull().references(() => user.id, { onDelete: "cascade" })
});
const account = pgTable("cms_account", {
	id: text("id").primaryKey(),
	accountId: text("account_id").notNull(),
	providerId: text("provider_id").notNull(),
	userId: text("user_id").notNull().references(() => user.id, { onDelete: "cascade" }),
	accessToken: text("access_token"),
	refreshToken: text("refresh_token"),
	idToken: text("id_token"),
	accessTokenExpiresAt: timestamp("access_token_expires_at"),
	refreshTokenExpiresAt: timestamp("refresh_token_expires_at"),
	scope: text("scope"),
	password: text("password"),
	createdAt: timestamp("created_at").notNull().defaultNow(),
	updatedAt: timestamp("updated_at").notNull().defaultNow()
});
const verification = pgTable("cms_verification", {
	id: text("id").primaryKey(),
	identifier: text("identifier").notNull(),
	value: text("value").notNull(),
	expiresAt: timestamp("expires_at").notNull(),
	createdAt: timestamp("created_at").notNull().defaultNow(),
	updatedAt: timestamp("updated_at").notNull().defaultNow()
});
/**
* Content Types - Defines the structure of content (like a schema)
* e.g., "blog_post", "page", "product"
*/
const contentType = pgTable("cms_content_type", {
	id: uuid("id").primaryKey().defaultRandom(),
	name: text("name").notNull().unique(),
	slug: text("slug").notNull().unique(),
	description: text("description"),
	schema: jsonb("schema").notNull().$type(),
	createdAt: timestamp("created_at").notNull().defaultNow(),
	updatedAt: timestamp("updated_at").notNull().defaultNow(),
	createdById: text("created_by_id").references(() => user.id)
});
/**
* Content Entries - Actual content data
*/
const contentEntry = pgTable("cms_content_entry", {
	id: uuid("id").primaryKey().defaultRandom(),
	contentTypeId: uuid("content_type_id").notNull().references(() => contentType.id, { onDelete: "cascade" }),
	data: jsonb("data").notNull().$type(),
	status: text("status", { enum: [
		"draft",
		"published",
		"archived"
	] }).notNull().default("draft"),
	publishedAt: timestamp("published_at"),
	createdAt: timestamp("created_at").notNull().defaultNow(),
	updatedAt: timestamp("updated_at").notNull().defaultNow(),
	createdById: text("created_by_id").references(() => user.id),
	updatedById: text("updated_by_id").references(() => user.id)
});
/**
* Media/Assets - Files stored in the bucket
*/
const media = pgTable("cms_media", {
	id: uuid("id").primaryKey().defaultRandom(),
	filename: text("filename").notNull(),
	originalFilename: text("original_filename").notNull(),
	mimeType: text("mime_type").notNull(),
	size: integer("size").notNull(),
	url: text("url").notNull(),
	bucketPath: text("bucket_path").notNull(),
	alt: text("alt"),
	caption: text("caption"),
	metadata: jsonb("metadata").$type(),
	createdAt: timestamp("created_at").notNull().defaultNow(),
	updatedAt: timestamp("updated_at").notNull().defaultNow(),
	uploadedById: text("uploaded_by_id").references(() => user.id)
});
/**
* Basic field types for collections
* - string: Short text input
* - number: Numeric input
* - boolean: Checkbox/toggle
* - date: Date picker (stored as ISO string)
* - textarea: Multi-line text input
* - url: URL input with validation
* - image: Image upload (stores media reference)
* - array: Array of values (single type per array)
*/
const fieldTypeEnum = [
	"string",
	"number",
	"boolean",
	"date",
	"textarea",
	"url",
	"image",
	"array"
];
/**
* Types that can be used as array item types
*/
const arrayItemTypeEnum = [
	"string",
	"number",
	"boolean",
	"date",
	"textarea",
	"url",
	"image"
];
/**
* Schema for defining a single field in a collection
*/
const collectionFieldSchema = z.object({
	id: z.string(),
	name: z.string().min(1),
	key: z.string().min(1).regex(/^[a-z][a-zA-Z0-9]*$/, "Must be camelCase"),
	type: z.enum(fieldTypeEnum),
	required: z.boolean().default(false),
	description: z.string().optional(),
	defaultValue: z.union([
		z.string(),
		z.number(),
		z.boolean(),
		z.array(z.unknown())
	]).optional(),
	arrayItemType: z.enum(arrayItemTypeEnum).optional()
});
/**
* Schema for the collection's field configuration
*/
const contentTypeSchemaValidator = z.object({ fields: z.array(collectionFieldSchema) });
/**
* @deprecated Use collectionFieldSchema instead
*/
const contentFieldSchema = collectionFieldSchema;

//#endregion
//#region src/db/index.ts
let dbInstance = null;
let migrationRun = false;
/**
* Get the path to the migrations folder
* Works both in development and when installed as a package
*/
const getMigrationsPath = () => {
	const possiblePaths = [];
	try {
		const __dirname = dirname(fileURLToPath(import.meta.url));
		possiblePaths.push(join(__dirname, "..", "..", "drizzle"));
		possiblePaths.push(join(__dirname, "..", "..", "drizzle"));
	} catch {}
	possiblePaths.push(join(process.cwd(), "packages", "cms", "drizzle"));
	possiblePaths.push(join(process.cwd(), "..", "..", "packages", "cms", "drizzle"));
	possiblePaths.push(join(process.cwd(), "node_modules", "@turbulence", "cms", "drizzle"));
	for (const path of possiblePaths) if (existsSync(join(path, "meta", "_journal.json"))) {
		console.log(`[CMS] Found migrations at: ${path}`);
		return path;
	}
	console.error("[CMS] Could not find migrations folder. Tried:", possiblePaths);
	return possiblePaths[0];
};
/**
* Run schema migrations using Drizzle's migrator
* Migrations are auto-generated from the schema using `drizzle-kit generate`
*/
const runMigrations = async (db) => {
	if (migrationRun) return;
	console.log("[CMS] Running database migrations...");
	try {
		await migrate(db, { migrationsFolder: getMigrationsPath() });
		migrationRun = true;
		console.log("[CMS] Database migrations complete.");
	} catch (error) {
		console.error("[CMS] Migration error:", error);
		throw error;
	}
};
/**
* Creates or returns existing database client
*/
const createDatabase = async (config) => {
	if (dbInstance) return dbInstance;
	let connectionString;
	const autoMigrate = config.autoMigrate ?? true;
	if ("connectionString" in config) connectionString = config.connectionString;
	else {
		const { host, port = 5432, user: user$1, password, database, ssl } = config;
		connectionString = `postgresql://${user$1}:${password}@${host}:${port}/${database}${ssl ? "?sslmode=require" : ""}`;
	}
	dbInstance = drizzle(connectionString, { schema: schema_exports });
	if (autoMigrate) await runMigrations(dbInstance);
	return dbInstance;
};
/**
* Get the current database instance
* Throws if database hasn't been initialized
*/
const getDatabase = () => {
	if (!dbInstance) throw new Error("Database not initialized. Call createDatabase() first or pass database config to createCMS().");
	return dbInstance;
};
/**
* Set an external database instance (useful for testing or custom setup)
*/
const setDatabase = (db) => {
	dbInstance = db;
};

//#endregion
//#region src/storage/index.ts
/**
* Storage configuration for file uploads
* Supports S3-compatible storage (AWS S3, Cloudflare R2, MinIO, etc.)
*/
const storageConfigSchema = z.object({
	endpoint: z.url(),
	bucket: z.string(),
	accessKeyId: z.string(),
	secretAccessKey: z.string(),
	region: z.string().optional().default("auto"),
	publicUrl: z.string().url().optional(),
	pathPrefix: z.string().optional().default("cms"),
	urlStyle: z.enum(["virtual-hosted", "path"]).optional().default("virtual-hosted")
});
let storageInstance = null;
async function sha256(message) {
	const encoder = new TextEncoder();
	const data = typeof message === "string" ? encoder.encode(message) : message;
	return await crypto.subtle.digest("SHA-256", data);
}
function toHex(buffer) {
	return Array.from(new Uint8Array(buffer)).map((b) => b.toString(16).padStart(2, "0")).join("");
}
async function hmacSha256(key, message) {
	const encoder = new TextEncoder();
	const keyData = typeof key === "string" ? encoder.encode(key) : key;
	const cryptoKey = await crypto.subtle.importKey("raw", keyData, {
		name: "HMAC",
		hash: "SHA-256"
	}, false, ["sign"]);
	return await crypto.subtle.sign("HMAC", cryptoKey, encoder.encode(message));
}
async function getSignatureKey(secretKey, dateStamp, region, service) {
	return await hmacSha256(await hmacSha256(await hmacSha256(await hmacSha256("AWS4" + secretKey, dateStamp), region), service), "aws4_request");
}
async function signRequest(method, url, headers, body, accessKeyId, secretAccessKey, region, service = "s3") {
	const amzDate = (/* @__PURE__ */ new Date()).toISOString().replace(/[:-]|\.\d{3}/g, "");
	const dateStamp = amzDate.slice(0, 8);
	const payloadHash = toHex(await sha256(body));
	const host = url.host;
	const signedHeadersList = [
		"host",
		"x-amz-content-sha256",
		"x-amz-date"
	];
	if (headers["Content-Type"]) signedHeadersList.push("content-type");
	signedHeadersList.sort();
	const canonicalHeaders = signedHeadersList.map((h) => {
		if (h === "host") return `host:${host}`;
		if (h === "x-amz-date") return `x-amz-date:${amzDate}`;
		if (h === "x-amz-content-sha256") return `x-amz-content-sha256:${payloadHash}`;
		if (h === "content-type") return `content-type:${headers["Content-Type"]}`;
		return `${h}:${headers[h]}`;
	}).join("\n");
	const signedHeaders = signedHeadersList.join(";");
	const canonicalRequest = [
		method,
		url.pathname,
		url.search.slice(1),
		canonicalHeaders + "\n",
		signedHeaders,
		payloadHash
	].join("\n");
	const algorithm = "AWS4-HMAC-SHA256";
	const credentialScope = `${dateStamp}/${region}/${service}/aws4_request`;
	const stringToSign = [
		algorithm,
		amzDate,
		credentialScope,
		toHex(await sha256(canonicalRequest))
	].join("\n");
	const signature = toHex(await hmacSha256(await getSignatureKey(secretAccessKey, dateStamp, region, service), stringToSign));
	return {
		Authorization: [
			`${algorithm} Credential=${accessKeyId}/${credentialScope}`,
			`SignedHeaders=${signedHeaders}`,
			`Signature=${signature}`
		].join(", "),
		"x-amz-date": amzDate,
		"x-amz-content-sha256": payloadHash
	};
}
/**
* Creates a storage client for S3-compatible storage
*/
const createStorageClient = (config) => {
	const validatedConfig = storageConfigSchema.parse(config);
	const useVirtualHosted = validatedConfig.urlStyle === "virtual-hosted";
	/**
	* Build the S3 URL based on the configured URL style
	*/
	const buildS3Url = (bucketPath) => {
		if (useVirtualHosted) {
			const endpointUrl = new URL(validatedConfig.endpoint);
			const virtualHostedUrl = `${endpointUrl.protocol}//${validatedConfig.bucket}.${endpointUrl.host}/${bucketPath}`;
			return new URL(virtualHostedUrl);
		} else return new URL(`${validatedConfig.endpoint}/${validatedConfig.bucket}/${bucketPath}`);
	};
	const getPublicUrl = (bucketPath) => {
		if (validatedConfig.publicUrl) return `${validatedConfig.publicUrl}/${bucketPath}`;
		return buildS3Url(bucketPath).toString();
	};
	const generatePath = (filename, folder) => {
		return [
			validatedConfig.pathPrefix,
			folder,
			`${Date.now()}-${Math.random().toString(36).substring(2, 8)}-${filename.replace(/[^a-zA-Z0-9.-]/g, "_")}`
		].filter(Boolean).join("/");
	};
	const upload = async (file, options) => {
		const filename = options?.filename || (file instanceof File ? file.name : "file");
		const contentType$1 = options?.contentType || file.type || "application/octet-stream";
		const bucketPath = generatePath(filename, options?.folder);
		const uploadUrl = buildS3Url(bucketPath);
		const arrayBuffer = await file.arrayBuffer();
		const headers = { "Content-Type": contentType$1 };
		const signedHeaders = await signRequest("PUT", uploadUrl, headers, arrayBuffer, validatedConfig.accessKeyId, validatedConfig.secretAccessKey, validatedConfig.region || "auto");
		const response = await fetch(uploadUrl.toString(), {
			method: "PUT",
			headers: {
				...headers,
				...signedHeaders
			},
			body: arrayBuffer
		});
		if (!response.ok) {
			const errorText = await response.text().catch(() => "");
			throw new Error(`Upload failed: ${response.status} ${response.statusText}${errorText ? ` - ${errorText}` : ""}`);
		}
		return {
			url: getPublicUrl(bucketPath),
			bucketPath,
			filename
		};
	};
	const deleteFile = async (bucketPath) => {
		const deleteUrl = buildS3Url(bucketPath);
		const signedHeaders = await signRequest("DELETE", deleteUrl, {}, /* @__PURE__ */ new ArrayBuffer(0), validatedConfig.accessKeyId, validatedConfig.secretAccessKey, validatedConfig.region || "auto");
		const response = await fetch(deleteUrl.toString(), {
			method: "DELETE",
			headers: signedHeaders
		});
		if (!response.ok && response.status !== 404) throw new Error(`Delete failed: ${response.status} ${response.statusText}`);
	};
	const getSignedUrl = async (bucketPath, _expiresIn = 3600) => {
		return getPublicUrl(bucketPath);
	};
	const fetchFile = async (bucketPath) => {
		const fileUrl = buildS3Url(bucketPath);
		const signedHeaders = await signRequest("GET", fileUrl, {}, /* @__PURE__ */ new ArrayBuffer(0), validatedConfig.accessKeyId, validatedConfig.secretAccessKey, validatedConfig.region || "auto");
		return fetch(fileUrl.toString(), {
			method: "GET",
			headers: signedHeaders
		});
	};
	return {
		upload,
		delete: deleteFile,
		getSignedUrl,
		getPublicUrl,
		fetch: fetchFile
	};
};
/**
* Initialize the storage client
*/
const initStorage = (config) => {
	storageInstance = createStorageClient(config);
	return storageInstance;
};
/**
* Get the current storage client
*/
const getStorage = () => {
	if (!storageInstance) throw new Error("Storage not initialized. Call initStorage() first or pass storage config to createCMS().");
	return storageInstance;
};
/**
* Set an external storage client (useful for testing)
*/
const setStorage = (client) => {
	storageInstance = client;
};

//#endregion
//#region src/auth/index.ts
let authInstance = null;
/**
* Creates the better-auth instance
*/
const createAuth = (db, config) => {
	const auth = betterAuth({
		database: drizzleAdapter(db, {
			provider: "pg",
			schema: {
				user,
				session,
				account,
				verification
			}
		}),
		basePath: config.authBasePath ?? "/admin/api/auth",
		secret: config.secret,
		baseURL: config.baseUrl,
		trustedOrigins: config.trustedOrigins,
		emailAndPassword: { enabled: config.emailAndPassword ?? true },
		socialProviders: {
			...config.socialProviders?.github && { github: {
				clientId: config.socialProviders.github.clientId,
				clientSecret: config.socialProviders.github.clientSecret
			} },
			...config.socialProviders?.google && { google: {
				clientId: config.socialProviders.google.clientId,
				clientSecret: config.socialProviders.google.clientSecret
			} }
		},
		session: {
			expiresIn: 3600 * 24 * 7,
			updateAge: 3600 * 24
		}
	});
	authInstance = auth;
	return auth;
};
/**
* Get the current auth instance
*/
const getAuth = () => {
	if (!authInstance) throw new Error("Auth not initialized. Call createAuth() first or pass auth config to createCMS().");
	return authInstance;
};
/**
* Get session from request using better-auth
*/
const getSession = async (req) => {
	return await getAuth().api.getSession({ headers: req.headers });
};
/**
* Verify if a request is authenticated
*/
const isAuthenticated = async (req) => {
	try {
		const session$1 = await getSession(req);
		return session$1 !== null && session$1.session !== null;
	} catch {
		return false;
	}
};

//#endregion
//#region src/trpc/init.ts
/**
* Create the tRPC instance with context
*/
const t = initTRPC.context().create({
	transformer: superjson,
	errorFormatter({ shape, error }) {
		return {
			...shape,
			data: {
				...shape.data,
				zodError: error.cause instanceof Error ? error.cause.message : void 0
			}
		};
	}
});
/**
* Export reusable tRPC helpers
*/
const createTRPCRouter = t.router;
const createCallerFactory = t.createCallerFactory;
/**
* Public (unauthenticated) procedure
* Can be used by anyone, no session required
*/
const publicProcedure = t.procedure;
/**
* Protected (authenticated) procedure
* Requires a valid session
*/
const protectedProcedure = t.procedure.use(({ ctx, next }) => {
	if (!ctx.session || !ctx.user) throw new TRPCError({
		code: "UNAUTHORIZED",
		message: "You must be logged in to access this resource"
	});
	return next({ ctx: {
		...ctx,
		session: ctx.session,
		user: ctx.user
	} });
});
/**
* Middleware for logging
*/
const loggerMiddleware = t.middleware(async ({ path, type, next }) => {
	const start = Date.now();
	const result = await next();
	const duration = Date.now() - start;
	console.log(`[tRPC] ${type} ${path} - ${duration}ms`);
	return result;
});

//#endregion
//#region src/trpc/routers/content-type.ts
const contentTypeRouter = createTRPCRouter({
	list: publicProcedure.query(async () => {
		return await getDatabase().select().from(contentType).orderBy(contentType.name);
	}),
	getBySlug: publicProcedure.input(z.object({ slug: z.string() })).query(async ({ input }) => {
		const [type] = await getDatabase().select().from(contentType).where(eq(contentType.slug, input.slug)).limit(1);
		return type ?? null;
	}),
	create: protectedProcedure.input(z.object({
		name: z.string().min(1).max(100),
		slug: z.string().min(1).max(100).regex(/^[a-z0-9-]+$/),
		description: z.string().optional(),
		schema: contentTypeSchemaValidator
	})).mutation(async ({ input, ctx }) => {
		const [newType] = await getDatabase().insert(contentType).values({
			name: input.name,
			slug: input.slug,
			description: input.description,
			schema: input.schema,
			createdById: ctx.user.id
		}).returning();
		return newType;
	}),
	update: protectedProcedure.input(z.object({
		id: z.string().uuid(),
		name: z.string().min(1).max(100).optional(),
		description: z.string().optional(),
		schema: contentTypeSchemaValidator.optional()
	})).mutation(async ({ input }) => {
		const db = getDatabase();
		const updateData = { updatedAt: /* @__PURE__ */ new Date() };
		if (input.name) updateData.name = input.name;
		if (input.description !== void 0) updateData.description = input.description;
		if (input.schema) updateData.schema = input.schema;
		const [updated] = await db.update(contentType).set(updateData).where(eq(contentType.id, input.id)).returning();
		return updated;
	}),
	delete: protectedProcedure.input(z.object({ id: z.string().uuid() })).mutation(async ({ input }) => {
		await getDatabase().delete(contentType).where(eq(contentType.id, input.id));
		return { success: true };
	})
});

//#endregion
//#region src/trpc/routers/content-entry.ts
const contentEntryRouter = createTRPCRouter({
	list: publicProcedure.input(z.object({
		contentTypeSlug: z.string(),
		status: z.enum([
			"draft",
			"published",
			"archived"
		]).optional(),
		limit: z.number().min(1).max(100).optional().default(50),
		offset: z.number().min(0).optional().default(0)
	})).query(async ({ input }) => {
		const db = getDatabase();
		const [type] = await db.select().from(contentType).where(eq(contentType.slug, input.contentTypeSlug)).limit(1);
		if (!type) return {
			entries: [],
			total: 0
		};
		const conditions = [eq(contentEntry.contentTypeId, type.id)];
		if (input.status) conditions.push(eq(contentEntry.status, input.status));
		const entries = await db.select().from(contentEntry).where(and(...conditions)).orderBy(desc(contentEntry.createdAt)).limit(input.limit).offset(input.offset);
		return {
			entries,
			total: entries.length
		};
	}),
	getById: publicProcedure.input(z.object({ id: z.string().uuid() })).query(async ({ input }) => {
		const [entry] = await getDatabase().select().from(contentEntry).where(eq(contentEntry.id, input.id)).limit(1);
		return entry ?? null;
	}),
	create: protectedProcedure.input(z.object({
		contentTypeId: z.string().uuid(),
		data: z.record(z.string(), z.unknown()),
		status: z.enum([
			"draft",
			"published",
			"archived"
		]).optional().default("draft")
	})).mutation(async ({ input, ctx }) => {
		const [newEntry] = await getDatabase().insert(contentEntry).values({
			contentTypeId: input.contentTypeId,
			data: input.data,
			status: input.status,
			publishedAt: input.status === "published" ? /* @__PURE__ */ new Date() : null,
			createdById: ctx.user.id,
			updatedById: ctx.user.id
		}).returning();
		return newEntry;
	}),
	update: protectedProcedure.input(z.object({
		id: z.string().uuid(),
		data: z.record(z.string(), z.unknown()).optional(),
		status: z.enum([
			"draft",
			"published",
			"archived"
		]).optional()
	})).mutation(async ({ input, ctx }) => {
		const db = getDatabase();
		const updateData = {
			updatedAt: /* @__PURE__ */ new Date(),
			updatedById: ctx.user.id
		};
		if (input.data) updateData.data = input.data;
		if (input.status) {
			updateData.status = input.status;
			if (input.status === "published") updateData.publishedAt = /* @__PURE__ */ new Date();
		}
		const [updated] = await db.update(contentEntry).set(updateData).where(eq(contentEntry.id, input.id)).returning();
		return updated;
	}),
	delete: protectedProcedure.input(z.object({ id: z.string().uuid() })).mutation(async ({ input }) => {
		await getDatabase().delete(contentEntry).where(eq(contentEntry.id, input.id));
		return { success: true };
	}),
	publish: protectedProcedure.input(z.object({ id: z.string().uuid() })).mutation(async ({ input, ctx }) => {
		const [updated] = await getDatabase().update(contentEntry).set({
			status: "published",
			publishedAt: /* @__PURE__ */ new Date(),
			updatedAt: /* @__PURE__ */ new Date(),
			updatedById: ctx.user.id
		}).where(eq(contentEntry.id, input.id)).returning();
		return updated;
	}),
	unpublish: protectedProcedure.input(z.object({ id: z.string().uuid() })).mutation(async ({ input, ctx }) => {
		const [updated] = await getDatabase().update(contentEntry).set({
			status: "draft",
			updatedAt: /* @__PURE__ */ new Date(),
			updatedById: ctx.user.id
		}).where(eq(contentEntry.id, input.id)).returning();
		return updated;
	})
});

//#endregion
//#region src/trpc/routers/media.ts
const mediaRouter = createTRPCRouter({
	list: publicProcedure.input(z.object({
		limit: z.number().min(1).max(100).optional().default(50),
		offset: z.number().min(0).optional().default(0),
		mimeType: z.string().optional()
	})).query(async ({ input }) => {
		let query = getDatabase().select().from(media).orderBy(desc(media.createdAt)).limit(input.limit).offset(input.offset);
		if (input.mimeType) query = query.where(eq(media.mimeType, input.mimeType));
		const files = await query;
		return {
			files,
			total: files.length
		};
	}),
	getById: publicProcedure.input(z.object({ id: z.string().uuid() })).query(async ({ input }) => {
		const [file] = await getDatabase().select().from(media).where(eq(media.id, input.id)).limit(1);
		return file ?? null;
	}),
	create: protectedProcedure.input(z.object({
		filename: z.string(),
		originalFilename: z.string(),
		mimeType: z.string(),
		size: z.number(),
		url: z.string().url(),
		bucketPath: z.string(),
		alt: z.string().optional(),
		caption: z.string().optional(),
		metadata: z.record(z.string(), z.unknown()).optional()
	})).mutation(async ({ input, ctx }) => {
		const [newMedia] = await getDatabase().insert(media).values({
			filename: input.filename,
			originalFilename: input.originalFilename,
			mimeType: input.mimeType,
			size: input.size,
			url: input.url,
			bucketPath: input.bucketPath,
			alt: input.alt,
			caption: input.caption,
			metadata: input.metadata,
			uploadedById: ctx.user.id
		}).returning();
		return newMedia;
	}),
	update: protectedProcedure.input(z.object({
		id: z.string().uuid(),
		alt: z.string().optional(),
		caption: z.string().optional(),
		metadata: z.record(z.string(), z.unknown()).optional()
	})).mutation(async ({ input }) => {
		const db = getDatabase();
		const updateData = { updatedAt: /* @__PURE__ */ new Date() };
		if (input.alt !== void 0) updateData.alt = input.alt;
		if (input.caption !== void 0) updateData.caption = input.caption;
		if (input.metadata) updateData.metadata = input.metadata;
		const [updated] = await db.update(media).set(updateData).where(eq(media.id, input.id)).returning();
		return updated;
	}),
	delete: protectedProcedure.input(z.object({ id: z.string().uuid() })).mutation(async ({ input }) => {
		const db = getDatabase();
		const [mediaRecord] = await db.select().from(media).where(eq(media.id, input.id)).limit(1);
		if (!mediaRecord) return {
			success: false,
			error: "Media not found"
		};
		try {
			await getStorage().delete(mediaRecord.bucketPath);
		} catch (error) {
			console.error("Failed to delete file from storage:", error);
		}
		await db.delete(media).where(eq(media.id, input.id));
		return { success: true };
	}),
	getSignedUrl: protectedProcedure.input(z.object({
		id: z.string().uuid(),
		expiresIn: z.number().optional().default(3600)
	})).query(async ({ input }) => {
		const [mediaRecord] = await getDatabase().select().from(media).where(eq(media.id, input.id)).limit(1);
		if (!mediaRecord) return null;
		return { url: await getStorage().getSignedUrl(mediaRecord.bucketPath, input.expiresIn) };
	})
});

//#endregion
//#region src/trpc/routers/setup.ts
const setupRouter = createTRPCRouter({
	getStatus: publicProcedure.query(async () => {
		try {
			const [superadmin] = await getDatabase().select({ id: user.id }).from(user).where(eq(user.role, "superadmin")).limit(1);
			return {
				isSetupComplete: !!superadmin,
				hasSuperadmin: !!superadmin
			};
		} catch (error) {
			console.error("Setup status check failed:", error);
			return {
				isSetupComplete: false,
				hasSuperadmin: false,
				error: "Database not configured"
			};
		}
	}),
	createSuperadmin: publicProcedure.input(z.object({
		name: z.string().min(1).max(100),
		email: z.string().email(),
		password: z.string().min(8).max(100)
	})).mutation(async ({ input }) => {
		const db = getDatabase();
		const [existingSuperadmin] = await db.select({ id: user.id }).from(user).where(eq(user.role, "superadmin")).limit(1);
		if (existingSuperadmin) throw new Error("Setup already complete. A superadmin already exists.");
		const signUpResult = await getAuth().api.signUpEmail({ body: {
			name: input.name,
			email: input.email,
			password: input.password
		} });
		if (!signUpResult || !signUpResult.user) throw new Error("Failed to create user account");
		try {
			await db.update(user).set({
				role: "superadmin",
				updatedAt: /* @__PURE__ */ new Date()
			}).where(eq(user.id, signUpResult.user.id));
		} catch (error) {
			await db.delete(user).where(eq(user.id, signUpResult.user.id));
			throw new Error("Setup already complete. A superadmin already exists.");
		}
		return {
			success: true,
			message: "Superadmin created successfully",
			user: {
				id: signUpResult.user.id,
				name: signUpResult.user.name,
				email: signUpResult.user.email
			}
		};
	}),
	getMyRole: protectedProcedure.query(async ({ ctx }) => {
		const [userData] = await getDatabase().select({ role: user.role }).from(user).where(eq(user.id, ctx.user.id)).limit(1);
		return {
			role: userData?.role ?? "editor",
			isSuperadmin: userData?.role === "superadmin",
			isAdmin: userData?.role === "admin" || userData?.role === "superadmin"
		};
	}),
	inviteAdmin: protectedProcedure.input(z.object({
		name: z.string().min(1).max(100),
		email: z.string().email(),
		password: z.string().min(8).max(100),
		role: z.enum(["admin", "editor"])
	})).mutation(async ({ input, ctx }) => {
		const db = getDatabase();
		const [currentUser] = await db.select({ role: user.role }).from(user).where(eq(user.id, ctx.user.id)).limit(1);
		if (currentUser?.role !== "superadmin") throw new Error("Only superadmins can invite new admins");
		const [existingUser] = await db.select({ id: user.id }).from(user).where(eq(user.email, input.email)).limit(1);
		if (existingUser) throw new Error("A user with this email already exists");
		const signUpResult = await getAuth().api.signUpEmail({ body: {
			name: input.name,
			email: input.email,
			password: input.password
		} });
		if (!signUpResult || !signUpResult.user) throw new Error("Failed to create user account");
		await db.update(user).set({
			role: input.role,
			updatedAt: /* @__PURE__ */ new Date()
		}).where(eq(user.id, signUpResult.user.id));
		return {
			success: true,
			user: {
				id: signUpResult.user.id,
				name: signUpResult.user.name,
				email: signUpResult.user.email,
				role: input.role
			}
		};
	}),
	listAdmins: protectedProcedure.query(async ({ ctx }) => {
		const db = getDatabase();
		const [currentUser] = await db.select({ role: user.role }).from(user).where(eq(user.id, ctx.user.id)).limit(1);
		if (currentUser?.role !== "superadmin") throw new Error("Only superadmins can view admin list");
		return { admins: await db.select({
			id: user.id,
			name: user.name,
			email: user.email,
			role: user.role,
			createdAt: user.createdAt
		}).from(user).orderBy(user.createdAt) };
	})
});

//#endregion
//#region src/trpc/routers/collections.ts
/**
* Generate a URL-friendly slug from a name
*/
function generateSlug(name) {
	return name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}
/**
* Generate a unique ID for fields
*/
function generateFieldId() {
	return `field_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}
const collectionsRouter = createTRPCRouter({
	list: protectedProcedure.query(async () => {
		return await getDatabase().select({
			id: contentType.id,
			name: contentType.name,
			slug: contentType.slug,
			description: contentType.description,
			schema: contentType.schema,
			createdAt: contentType.createdAt,
			updatedAt: contentType.updatedAt
		}).from(contentType).orderBy(contentType.name);
	}),
	getById: protectedProcedure.input(z.object({ id: z.string().uuid() })).query(async ({ input }) => {
		const [collection] = await getDatabase().select().from(contentType).where(eq(contentType.id, input.id)).limit(1);
		if (!collection) throw new Error("Collection not found");
		return collection;
	}),
	getBySlug: protectedProcedure.input(z.object({ slug: z.string() })).query(async ({ input }) => {
		const [collection] = await getDatabase().select().from(contentType).where(eq(contentType.slug, input.slug)).limit(1);
		if (!collection) throw new Error("Collection not found");
		return collection;
	}),
	create: protectedProcedure.input(z.object({
		name: z.string().min(1).max(100),
		description: z.string().optional()
	})).mutation(async ({ input, ctx }) => {
		const db = getDatabase();
		const slug = generateSlug(input.name);
		const [existing] = await db.select({ id: contentType.id }).from(contentType).where(eq(contentType.slug, slug)).limit(1);
		if (existing) throw new Error(`A collection with the slug "${slug}" already exists`);
		const [collection] = await db.insert(contentType).values({
			name: input.name,
			slug,
			description: input.description,
			schema: { fields: [] },
			createdById: ctx.user.id
		}).returning();
		return collection;
	}),
	update: protectedProcedure.input(z.object({
		id: z.string().uuid(),
		name: z.string().min(1).max(100).optional(),
		description: z.string().optional()
	})).mutation(async ({ input }) => {
		const db = getDatabase();
		const updates = { updatedAt: /* @__PURE__ */ new Date() };
		if (input.name) {
			updates.name = input.name;
			updates.slug = generateSlug(input.name);
			const [existing] = await db.select({ id: contentType.id }).from(contentType).where(eq(contentType.slug, updates.slug)).limit(1);
			if (existing && existing.id !== input.id) throw new Error(`A collection with the slug "${updates.slug}" already exists`);
		}
		if (input.description !== void 0) updates.description = input.description;
		const [collection] = await db.update(contentType).set(updates).where(eq(contentType.id, input.id)).returning();
		if (!collection) throw new Error("Collection not found");
		return collection;
	}),
	delete: protectedProcedure.input(z.object({ id: z.string().uuid() })).mutation(async ({ input }) => {
		const [deleted] = await getDatabase().delete(contentType).where(eq(contentType.id, input.id)).returning({ id: contentType.id });
		if (!deleted) throw new Error("Collection not found");
		return { success: true };
	}),
	updateSchema: protectedProcedure.input(z.object({
		id: z.string().uuid(),
		schema: contentTypeSchemaValidator
	})).mutation(async ({ input }) => {
		const db = getDatabase();
		const keys = input.schema.fields.map((f) => f.key);
		if (new Set(keys).size !== keys.length) throw new Error("Field keys must be unique");
		const [collection] = await db.update(contentType).set({
			schema: input.schema,
			updatedAt: /* @__PURE__ */ new Date()
		}).where(eq(contentType.id, input.id)).returning();
		if (!collection) throw new Error("Collection not found");
		return collection;
	}),
	addField: protectedProcedure.input(z.object({
		collectionId: z.string().uuid(),
		field: collectionFieldSchema.omit({ id: true })
	})).mutation(async ({ input }) => {
		const db = getDatabase();
		const [collection] = await db.select({ schema: contentType.schema }).from(contentType).where(eq(contentType.id, input.collectionId)).limit(1);
		if (!collection) throw new Error("Collection not found");
		const currentSchema = collection.schema;
		if (currentSchema.fields.some((f) => f.key === input.field.key)) throw new Error(`A field with key "${input.field.key}" already exists`);
		const newField = {
			...input.field,
			id: generateFieldId()
		};
		const updatedSchema = { fields: [...currentSchema.fields, newField] };
		const [updated] = await db.update(contentType).set({
			schema: updatedSchema,
			updatedAt: /* @__PURE__ */ new Date()
		}).where(eq(contentType.id, input.collectionId)).returning();
		return updated;
	}),
	updateField: protectedProcedure.input(z.object({
		collectionId: z.string().uuid(),
		fieldId: z.string(),
		updates: collectionFieldSchema.partial().omit({ id: true })
	})).mutation(async ({ input }) => {
		const db = getDatabase();
		const [collection] = await db.select({ schema: contentType.schema }).from(contentType).where(eq(contentType.id, input.collectionId)).limit(1);
		if (!collection) throw new Error("Collection not found");
		const currentSchema = collection.schema;
		const fieldIndex = currentSchema.fields.findIndex((f) => f.id === input.fieldId);
		if (fieldIndex === -1) throw new Error("Field not found");
		if (input.updates.key && currentSchema.fields.some((f, i) => i !== fieldIndex && f.key === input.updates.key)) throw new Error(`A field with key "${input.updates.key}" already exists`);
		const updatedFields = [...currentSchema.fields];
		updatedFields[fieldIndex] = {
			...updatedFields[fieldIndex],
			...input.updates
		};
		const updatedSchema = { fields: updatedFields };
		const [updated] = await db.update(contentType).set({
			schema: updatedSchema,
			updatedAt: /* @__PURE__ */ new Date()
		}).where(eq(contentType.id, input.collectionId)).returning();
		return updated;
	}),
	removeField: protectedProcedure.input(z.object({
		collectionId: z.string().uuid(),
		fieldId: z.string()
	})).mutation(async ({ input }) => {
		const db = getDatabase();
		const [collection] = await db.select({ schema: contentType.schema }).from(contentType).where(eq(contentType.id, input.collectionId)).limit(1);
		if (!collection) throw new Error("Collection not found");
		const updatedSchema = { fields: collection.schema.fields.filter((f) => f.id !== input.fieldId) };
		const [updated] = await db.update(contentType).set({
			schema: updatedSchema,
			updatedAt: /* @__PURE__ */ new Date()
		}).where(eq(contentType.id, input.collectionId)).returning();
		return updated;
	}),
	reorderFields: protectedProcedure.input(z.object({
		collectionId: z.string().uuid(),
		fieldIds: z.array(z.string())
	})).mutation(async ({ input }) => {
		const db = getDatabase();
		const [collection] = await db.select({ schema: contentType.schema }).from(contentType).where(eq(contentType.id, input.collectionId)).limit(1);
		if (!collection) throw new Error("Collection not found");
		const currentSchema = collection.schema;
		const fieldMap = new Map(currentSchema.fields.map((f) => [f.id, f]));
		const reorderedFields = input.fieldIds.map((id) => fieldMap.get(id)).filter((f) => f !== void 0);
		for (const field of currentSchema.fields) if (!input.fieldIds.includes(field.id)) reorderedFields.push(field);
		const updatedSchema = { fields: reorderedFields };
		const [updated] = await db.update(contentType).set({
			schema: updatedSchema,
			updatedAt: /* @__PURE__ */ new Date()
		}).where(eq(contentType.id, input.collectionId)).returning();
		return updated;
	})
});

//#endregion
//#region src/trpc/routers/entries.ts
/**
* URL validation regex
*/
const URL_REGEX = /^https?:\/\/[^\s/$.?#].[^\s]*$/i;
/**
* ISO date string validation regex
*/
const ISO_DATE_REGEX = /^\d{4}-\d{2}-\d{2}(T\d{2}:\d{2}:\d{2}(\.\d{3})?Z?)?$/;
/**
* Validate a single value against a field type
*/
function validateValue(value, type, fieldName) {
	switch (type) {
		case "string":
		case "textarea":
			if (typeof value !== "string") return `Field "${fieldName}" must be a string`;
			break;
		case "number":
			if (typeof value !== "number" || isNaN(value)) return `Field "${fieldName}" must be a number`;
			break;
		case "boolean":
			if (typeof value !== "boolean") return `Field "${fieldName}" must be a boolean`;
			break;
		case "date":
			if (typeof value !== "string" || !ISO_DATE_REGEX.test(value)) return `Field "${fieldName}" must be a valid date`;
			break;
		case "url":
			if (typeof value !== "string" || !URL_REGEX.test(value)) return `Field "${fieldName}" must be a valid URL`;
			break;
		case "image":
			if (typeof value !== "string" && typeof value !== "object") return `Field "${fieldName}" must be a valid image reference`;
			break;
	}
	return null;
}
/**
* Validate entry data against the collection schema
*/
function validateEntryData(data, schema) {
	const errors = [];
	for (const field of schema.fields) {
		const value = data[field.key];
		if (field.required) {
			if (value === void 0 || value === null || value === "" || Array.isArray(value) && value.length === 0) {
				errors.push(`Field "${field.name}" is required`);
				continue;
			}
		}
		if (value === void 0 || value === null || value === "") continue;
		if (field.type === "array") {
			if (!Array.isArray(value)) {
				errors.push(`Field "${field.name}" must be an array`);
				continue;
			}
			const itemType = field.arrayItemType || "string";
			for (let i = 0; i < value.length; i++) {
				const itemError = validateValue(value[i], itemType, `${field.name}[${i}]`);
				if (itemError) errors.push(itemError);
			}
		} else {
			const error = validateValue(value, field.type, field.name);
			if (error) errors.push(error);
		}
	}
	return {
		valid: errors.length === 0,
		errors
	};
}
/**
* Apply default values from schema to entry data
*/
function applyDefaults(data, schema) {
	const result = { ...data };
	for (const field of schema.fields) if ((result[field.key] === void 0 || result[field.key] === null) && field.defaultValue !== void 0) result[field.key] = field.defaultValue;
	return result;
}
const entriesRouter = createTRPCRouter({
	list: protectedProcedure.input(z.object({
		collectionId: z.string().uuid(),
		status: z.enum([
			"draft",
			"published",
			"archived"
		]).optional(),
		limit: z.number().min(1).max(100).default(50),
		offset: z.number().min(0).default(0),
		orderBy: z.enum(["createdAt", "updatedAt"]).default("createdAt"),
		orderDir: z.enum(["asc", "desc"]).default("desc")
	})).query(async ({ input }) => {
		const db = getDatabase();
		const conditions = [eq(contentEntry.contentTypeId, input.collectionId)];
		if (input.status) conditions.push(eq(contentEntry.status, input.status));
		const entries = await db.select({
			id: contentEntry.id,
			data: contentEntry.data,
			status: contentEntry.status,
			publishedAt: contentEntry.publishedAt,
			createdAt: contentEntry.createdAt,
			updatedAt: contentEntry.updatedAt
		}).from(contentEntry).where(and(...conditions)).orderBy(input.orderDir === "desc" ? desc(contentEntry[input.orderBy]) : asc(contentEntry[input.orderBy])).limit(input.limit).offset(input.offset);
		const [{ count }] = await db.select({ count: sql`count(*)::int` }).from(contentEntry).where(and(...conditions));
		return {
			entries,
			total: count,
			limit: input.limit,
			offset: input.offset
		};
	}),
	getById: protectedProcedure.input(z.object({ id: z.string().uuid() })).query(async ({ input }) => {
		const [entry] = await getDatabase().select().from(contentEntry).where(eq(contentEntry.id, input.id)).limit(1);
		if (!entry) throw new Error("Entry not found");
		return entry;
	}),
	create: protectedProcedure.input(z.object({
		collectionId: z.string().uuid(),
		data: z.record(z.string(), z.unknown()),
		status: z.enum(["draft", "published"]).default("draft")
	})).mutation(async ({ input, ctx }) => {
		const db = getDatabase();
		const [collection] = await db.select({ schema: contentType.schema }).from(contentType).where(eq(contentType.id, input.collectionId)).limit(1);
		if (!collection) throw new Error("Collection not found");
		const schema = collection.schema;
		const dataWithDefaults = applyDefaults(input.data, schema);
		const validation = validateEntryData(dataWithDefaults, schema);
		if (!validation.valid) throw new Error(`Validation failed: ${validation.errors.join(", ")}`);
		const [entry] = await db.insert(contentEntry).values({
			contentTypeId: input.collectionId,
			data: dataWithDefaults,
			status: input.status,
			publishedAt: input.status === "published" ? /* @__PURE__ */ new Date() : null,
			createdById: ctx.user.id,
			updatedById: ctx.user.id
		}).returning();
		return entry;
	}),
	update: protectedProcedure.input(z.object({
		id: z.string().uuid(),
		data: z.record(z.string(), z.unknown()).optional(),
		status: z.enum([
			"draft",
			"published",
			"archived"
		]).optional()
	})).mutation(async ({ input, ctx }) => {
		const db = getDatabase();
		const [entry] = await db.select({
			entry: contentEntry,
			schema: contentType.schema
		}).from(contentEntry).innerJoin(contentType, eq(contentEntry.contentTypeId, contentType.id)).where(eq(contentEntry.id, input.id)).limit(1);
		if (!entry) throw new Error("Entry not found");
		const schema = entry.schema;
		const updates = {
			updatedAt: /* @__PURE__ */ new Date(),
			updatedById: ctx.user.id
		};
		if (input.data) {
			const dataWithDefaults = applyDefaults({
				...entry.entry.data,
				...input.data
			}, schema);
			const validation = validateEntryData(dataWithDefaults, schema);
			if (!validation.valid) throw new Error(`Validation failed: ${validation.errors.join(", ")}`);
			updates.data = dataWithDefaults;
		}
		if (input.status) {
			updates.status = input.status;
			if (input.status === "published" && entry.entry.status !== "published") updates.publishedAt = /* @__PURE__ */ new Date();
		}
		const [updated] = await db.update(contentEntry).set(updates).where(eq(contentEntry.id, input.id)).returning();
		return updated;
	}),
	delete: protectedProcedure.input(z.object({ id: z.string().uuid() })).mutation(async ({ input }) => {
		const [deleted] = await getDatabase().delete(contentEntry).where(eq(contentEntry.id, input.id)).returning({ id: contentEntry.id });
		if (!deleted) throw new Error("Entry not found");
		return { success: true };
	}),
	publish: protectedProcedure.input(z.object({ id: z.string().uuid() })).mutation(async ({ input, ctx }) => {
		const [entry] = await getDatabase().update(contentEntry).set({
			status: "published",
			publishedAt: /* @__PURE__ */ new Date(),
			updatedAt: /* @__PURE__ */ new Date(),
			updatedById: ctx.user.id
		}).where(eq(contentEntry.id, input.id)).returning();
		if (!entry) throw new Error("Entry not found");
		return entry;
	}),
	unpublish: protectedProcedure.input(z.object({ id: z.string().uuid() })).mutation(async ({ input, ctx }) => {
		const [entry] = await getDatabase().update(contentEntry).set({
			status: "draft",
			updatedAt: /* @__PURE__ */ new Date(),
			updatedById: ctx.user.id
		}).where(eq(contentEntry.id, input.id)).returning();
		if (!entry) throw new Error("Entry not found");
		return entry;
	}),
	archive: protectedProcedure.input(z.object({ id: z.string().uuid() })).mutation(async ({ input, ctx }) => {
		const [entry] = await getDatabase().update(contentEntry).set({
			status: "archived",
			updatedAt: /* @__PURE__ */ new Date(),
			updatedById: ctx.user.id
		}).where(eq(contentEntry.id, input.id)).returning();
		if (!entry) throw new Error("Entry not found");
		return entry;
	}),
	bulkDelete: protectedProcedure.input(z.object({ ids: z.array(z.string().uuid()) })).mutation(async ({ input }) => {
		const db = getDatabase();
		let deletedCount = 0;
		for (const id of input.ids) {
			const [deleted] = await db.delete(contentEntry).where(eq(contentEntry.id, id)).returning({ id: contentEntry.id });
			if (deleted) deletedCount++;
		}
		return { deletedCount };
	})
});

//#endregion
//#region src/trpc/router.ts
/**
* Main CMS API Router
*/
const appRouter = createTRPCRouter({
	setup: setupRouter,
	collections: collectionsRouter,
	entries: entriesRouter,
	contentType: contentTypeRouter,
	contentEntry: contentEntryRouter,
	media: mediaRouter,
	health: publicProcedure.query(() => {
		return {
			status: "ok",
			timestamp: (/* @__PURE__ */ new Date()).toISOString(),
			version: "0.1.0"
		};
	}),
	me: protectedProcedure.query(({ ctx }) => {
		return {
			user: ctx.user,
			session: {
				id: ctx.session.id,
				expiresAt: ctx.session.expiresAt
			}
		};
	})
});

//#endregion
//#region src/trpc/handler.ts
/**
* Creates the context for each tRPC request
* Extracts session and user from the request using better-auth
*/
const createContext = async (req) => {
	let session$1 = null;
	let user$1 = null;
	try {
		const authSession = await getSession(req);
		if (authSession?.session && authSession?.user) {
			session$1 = {
				id: authSession.session.id,
				token: authSession.session.token,
				expiresAt: authSession.session.expiresAt,
				createdAt: authSession.session.createdAt,
				updatedAt: authSession.session.updatedAt,
				ipAddress: authSession.session.ipAddress ?? null,
				userAgent: authSession.session.userAgent ?? null,
				userId: authSession.session.userId
			};
			user$1 = {
				id: authSession.user.id,
				name: authSession.user.name,
				email: authSession.user.email,
				emailVerified: authSession.user.emailVerified,
				image: authSession.user.image ?? null,
				createdAt: authSession.user.createdAt,
				updatedAt: authSession.user.updatedAt
			};
		}
	} catch (error) {
		console.debug("No valid session found:", error);
	}
	return {
		session: session$1,
		user: user$1,
		req
	};
};
/**
* Handle tRPC requests using the fetch adapter
*/
const handleTRPCRequest = async (req) => {
	return fetchRequestHandler({
		endpoint: "/admin/api/trpc",
		req,
		router: appRouter,
		createContext: () => createContext(req),
		onError: ({ path, error }) => {
			console.error(`[tRPC Error] ${path}:`, error);
		}
	});
};

//#endregion
//#region src/create-cms.ts
const defaultOptions = {
	basePath: "/admin",
	database: false,
	storage: false,
	auth: false
};
/**
* Creates a CMS instance with GET and POST handlers
* Uses Web Standard Request/Response - works with any framework
*/
const createCMS = (options) => {
	const opts = {
		...defaultOptions,
		basePath: options?.basePath ?? defaultOptions.basePath,
		database: !!options?.database,
		storage: !!options?.storage,
		auth: !!options?.auth
	};
	let initPromise = null;
	let initialized = false;
	const ensureInitialized = async () => {
		if (initialized) return;
		if (!initPromise) initPromise = (async () => {
			let db = null;
			if (options?.database) db = await createDatabase(options.database);
			if (options?.storage) initStorage(options.storage);
			if (options?.auth && db) createAuth(db, {
				...options.auth,
				authBasePath: `${opts.basePath}/api/auth`
			});
			initialized = true;
			return db;
		})();
		await initPromise;
	};
	const GET = async (req) => {
		await ensureInitialized();
		const { pathname } = new URL(req.url);
		if (options?.auth && pathname.startsWith(`${opts.basePath}/api/auth`)) return getAuth().handler(req);
		if (pathname.startsWith(`${opts.basePath}/api/trpc`)) return handleTRPCRequest(req);
		if (pathname.startsWith(`${opts.basePath}/api/media/`)) return handleMediaProxy(req, opts.basePath, options?.storage);
		if (!pathname.startsWith(opts.basePath)) return Response.json({ message: "Please put your CMS in the /admin route. Or customize basePath in the options." });
		return await runGetRouter(req, opts);
	};
	const POST = async (req) => {
		await ensureInitialized();
		const url = new URL(req.url);
		const { pathname } = url;
		if (options?.auth && pathname.startsWith(`${opts.basePath}/api/auth`)) return getAuth().handler(req);
		if (pathname.startsWith(`${opts.basePath}/api/trpc`)) return handleTRPCRequest(req);
		if (pathname.startsWith(`${opts.basePath}/api/upload`)) return handleUpload(req, options?.storage);
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
/**
* Handle file upload requests
* Accepts JSON body with base64 encoded data to avoid binary corruption in Next.js 16
*/
async function handleUpload(req, storageConfigured) {
	if (!storageConfigured) return Response.json({ error: "Storage not configured" }, { status: 500 });
	try {
		const { filename, contentType: contentType$1, data } = await req.json();
		if (!data || !filename) return Response.json({ error: "Missing required fields: filename, data" }, { status: 400 });
		const binaryString = atob(data);
		const bytes = new Uint8Array(binaryString.length);
		for (let i = 0; i < binaryString.length; i++) bytes[i] = binaryString.charCodeAt(i);
		const blob = new Blob([bytes], { type: contentType$1 || "application/octet-stream" });
		const result = await getStorage().upload(blob, {
			filename,
			contentType: contentType$1 || "application/octet-stream",
			folder: "uploads"
		});
		const url = new URL(req.url);
		const basePath = url.pathname.replace("/api/upload", "");
		const proxyUrl = `${url.origin}${basePath}/api/media/${result.bucketPath}`;
		return Response.json({
			url: proxyUrl,
			bucketPath: result.bucketPath,
			filename: result.filename
		});
	} catch (error) {
		console.error("Upload error:", error);
		return Response.json({ error: error instanceof Error ? error.message : "Upload failed" }, { status: 500 });
	}
}
/**
* Handle media proxy requests - serves files from the bucket through the backend
* This avoids CORS issues with private buckets
*/
async function handleMediaProxy(req, basePath, storageConfigured) {
	if (!storageConfigured) return Response.json({ error: "Storage not configured" }, { status: 500 });
	try {
		const mediaPath = new URL(req.url).pathname.replace(`${basePath}/api/media/`, "");
		if (!mediaPath) return Response.json({ error: "No file path provided" }, { status: 400 });
		const response = await getStorage().fetch(mediaPath);
		if (!response.ok) return new Response(`File not found: ${response.status}`, { status: 404 });
		const contentType$1 = response.headers.get("Content-Type") || getContentTypeFromPath(mediaPath);
		const buffer = await response.arrayBuffer();
		return new Response(buffer, {
			status: 200,
			headers: {
				"Content-Type": contentType$1,
				"Cache-Control": "public, max-age=31536000, immutable",
				"Access-Control-Allow-Origin": "*"
			}
		});
	} catch (error) {
		console.error("Media proxy error:", error);
		return Response.json({ error: error instanceof Error ? error.message : "Failed to fetch file" }, { status: 500 });
	}
}
/**
* Get content type from file path extension
*/
function getContentTypeFromPath(path) {
	return {
		jpg: "image/jpeg",
		jpeg: "image/jpeg",
		png: "image/png",
		gif: "image/gif",
		webp: "image/webp",
		svg: "image/svg+xml",
		ico: "image/x-icon",
		pdf: "application/pdf",
		json: "application/json",
		txt: "text/plain",
		html: "text/html",
		css: "text/css",
		js: "application/javascript",
		mp4: "video/mp4",
		webm: "video/webm",
		mp3: "audio/mpeg",
		wav: "audio/wav"
	}[path.split(".").pop()?.toLowerCase() || ""] || "application/octet-stream";
}

//#endregion
export { user as A, contentEntry as C, fieldTypeEnum as D, contentTypeSchemaValidator as E, verification as M, renderAdminPanel as N, media as O, htmlTemplate as P, collectionFieldSchema as S, contentType as T, getDatabase as _, createTRPCRouter as a, account as b, createAuth as c, isAuthenticated as d, createStorageClient as f, createDatabase as g, setStorage as h, appRouter as i, userRoleEnum as j, session as k, getAuth as l, initStorage as m, createContext as n, protectedProcedure as o, getStorage as p, handleTRPCRequest as r, publicProcedure as s, createCMS as t, getSession as u, runMigrations as v, contentFieldSchema as w, arrayItemTypeEnum as x, setDatabase as y };
//# sourceMappingURL=create-cms-T-f3xFh4.js.map