import { t as __export } from "./chunk-DGgIvueF.js";
import { readFile } from "fs/promises";
import { dirname, join } from "path";
import { drizzle } from "drizzle-orm/node-postgres";
import { migrate } from "drizzle-orm/node-postgres/migrator";
import { fileURLToPath } from "url";
import { existsSync } from "fs";
import { boolean, integer, jsonb, pgTable, text, timestamp, uniqueIndex, uuid } from "drizzle-orm/pg-core";
import { and, desc, eq, sql } from "drizzle-orm";
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
	contentEntry: () => contentEntry,
	contentFieldSchema: () => contentFieldSchema,
	contentType: () => contentType,
	contentTypeSchemaValidator: () => contentTypeSchemaValidator,
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
* Schema for defining content type fields
*/
const contentFieldSchema = z.object({
	name: z.string(),
	type: z.enum([
		"text",
		"richtext",
		"number",
		"boolean",
		"date",
		"datetime",
		"json",
		"media",
		"reference",
		"array"
	]),
	required: z.boolean().default(false),
	description: z.string().optional(),
	defaultValue: z.unknown().optional(),
	validation: z.object({
		min: z.number().optional(),
		max: z.number().optional(),
		pattern: z.string().optional(),
		options: z.array(z.string()).optional()
	}).optional(),
	referenceType: z.string().optional(),
	arrayItemType: z.string().optional()
});
const contentTypeSchemaValidator = z.object({ fields: z.array(contentFieldSchema) });

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
	pathPrefix: z.string().optional().default("cms")
});
let storageInstance = null;
/**
* Creates a storage client for S3-compatible storage
*/
const createStorageClient = (config) => {
	const validatedConfig = storageConfigSchema.parse(config);
	const getPublicUrl = (bucketPath) => {
		if (validatedConfig.publicUrl) return `${validatedConfig.publicUrl}/${bucketPath}`;
		return `${validatedConfig.endpoint}/${validatedConfig.bucket}/${bucketPath}`;
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
		const uploadUrl = `${validatedConfig.endpoint}/${validatedConfig.bucket}/${bucketPath}`;
		const arrayBuffer = await file.arrayBuffer();
		const response = await fetch(uploadUrl, {
			method: "PUT",
			headers: {
				"Content-Type": contentType$1,
				"Content-Length": String(arrayBuffer.byteLength)
			},
			body: arrayBuffer
		});
		if (!response.ok) throw new Error(`Upload failed: ${response.status} ${response.statusText}`);
		return {
			url: getPublicUrl(bucketPath),
			bucketPath,
			filename
		};
	};
	const deleteFile = async (bucketPath) => {
		const deleteUrl = `${validatedConfig.endpoint}/${validatedConfig.bucket}/${bucketPath}`;
		const response = await fetch(deleteUrl, { method: "DELETE" });
		if (!response.ok && response.status !== 404) throw new Error(`Delete failed: ${response.status} ${response.statusText}`);
	};
	const getSignedUrl = async (bucketPath, _expiresIn = 3600) => {
		return getPublicUrl(bucketPath);
	};
	return {
		upload,
		delete: deleteFile,
		getSignedUrl,
		getPublicUrl
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
		basePath: config.basePath ?? "/api/auth",
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
		data: z.record(z.unknown()),
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
		data: z.record(z.unknown()).optional(),
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
		metadata: z.record(z.unknown()).optional()
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
		metadata: z.record(z.unknown()).optional()
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
//#region src/trpc/router.ts
/**
* Main CMS API Router
*/
const appRouter = createTRPCRouter({
	setup: setupRouter,
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
			if (options?.auth && db) createAuth(db, options.auth);
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
		if (!pathname.startsWith(opts.basePath)) return Response.json({ message: "Please put your CMS in the /admin route. Or customize basePath in the options." });
		return await runGetRouter(req, opts);
	};
	const POST = async (req) => {
		await ensureInitialized();
		const url = new URL(req.url);
		const { pathname } = url;
		if (options?.auth && pathname.startsWith(`${opts.basePath}/api/auth`)) return getAuth().handler(req);
		if (pathname.startsWith(`${opts.basePath}/api/trpc`)) return handleTRPCRequest(req);
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
export { renderAdminPanel as A, contentType as C, user as D, session as E, userRoleEnum as O, contentFieldSchema as S, media as T, getDatabase as _, createTRPCRouter as a, account as b, createAuth as c, isAuthenticated as d, createStorageClient as f, createDatabase as g, setStorage as h, appRouter as i, htmlTemplate as j, verification as k, getAuth as l, initStorage as m, createContext as n, protectedProcedure as o, getStorage as p, handleTRPCRequest as r, publicProcedure as s, createCMS as t, getSession as u, runMigrations as v, contentTypeSchemaValidator as w, contentEntry as x, setDatabase as y };
//# sourceMappingURL=create-cms-Bm3-xas1.js.map