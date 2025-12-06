import {
  pgTable,
  text,
  timestamp,
  boolean,
  jsonb,
  uuid,
  integer,
  uniqueIndex,
} from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";
import { z } from "zod";

// ============================================================================
// User & Authentication Tables (for better-auth)
// ============================================================================

/**
 * User roles in the CMS
 * - superadmin: Full access, can manage other admins
 * - admin: Can manage content
 * - editor: Can edit content but not publish
 */
export const userRoleEnum = ["superadmin", "admin", "editor"] as const;
export type UserRole = (typeof userRoleEnum)[number];

export const user = pgTable(
  "cms_user",
  {
    id: text("id").primaryKey(),
    name: text("name").notNull(),
    email: text("email").notNull().unique(),
    emailVerified: boolean("email_verified").notNull().default(false),
    image: text("image"),
    role: text("role", { enum: userRoleEnum }).notNull().default("editor"),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").notNull().defaultNow(),
  },
  (table) => [
    // Partial unique index: only one superadmin can exist
    uniqueIndex("cms_user_unique_superadmin")
      .on(table.role)
      .where(sql`${table.role} = 'superadmin'`),
  ]
);

export const session = pgTable("cms_session", {
  id: text("id").primaryKey(),
  expiresAt: timestamp("expires_at").notNull(),
  token: text("token").notNull().unique(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
  ipAddress: text("ip_address"),
  userAgent: text("user_agent"),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
});

export const account = pgTable("cms_account", {
  id: text("id").primaryKey(),
  accountId: text("account_id").notNull(),
  providerId: text("provider_id").notNull(),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  accessToken: text("access_token"),
  refreshToken: text("refresh_token"),
  idToken: text("id_token"),
  accessTokenExpiresAt: timestamp("access_token_expires_at"),
  refreshTokenExpiresAt: timestamp("refresh_token_expires_at"),
  scope: text("scope"),
  password: text("password"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const verification = pgTable("cms_verification", {
  id: text("id").primaryKey(),
  identifier: text("identifier").notNull(),
  value: text("value").notNull(),
  expiresAt: timestamp("expires_at").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

// ============================================================================
// CMS Content Tables
// ============================================================================

/**
 * Content Types - Defines the structure of content (like a schema)
 * e.g., "blog_post", "page", "product"
 */
export const contentType = pgTable("cms_content_type", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").notNull().unique(),
  slug: text("slug").notNull().unique(),
  description: text("description"),
  // JSON Schema defining the fields for this content type
  schema: jsonb("schema").notNull().$type<ContentTypeSchema>(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
  createdById: text("created_by_id").references(() => user.id),
});

/**
 * Content Entries - Actual content data
 */
export const contentEntry = pgTable("cms_content_entry", {
  id: uuid("id").primaryKey().defaultRandom(),
  contentTypeId: uuid("content_type_id")
    .notNull()
    .references(() => contentType.id, { onDelete: "cascade" }),
  // The actual content data, validated against the content type schema
  data: jsonb("data").notNull().$type<Record<string, unknown>>(),
  status: text("status", { enum: ["draft", "published", "archived"] })
    .notNull()
    .default("draft"),
  publishedAt: timestamp("published_at"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
  createdById: text("created_by_id").references(() => user.id),
  updatedById: text("updated_by_id").references(() => user.id),
});

/**
 * Media/Assets - Files stored in the bucket
 */
export const media = pgTable("cms_media", {
  id: uuid("id").primaryKey().defaultRandom(),
  filename: text("filename").notNull(),
  originalFilename: text("original_filename").notNull(),
  mimeType: text("mime_type").notNull(),
  size: integer("size").notNull(), // in bytes
  url: text("url").notNull(),
  bucketPath: text("bucket_path").notNull(),
  alt: text("alt"),
  caption: text("caption"),
  metadata: jsonb("metadata").$type<Record<string, unknown>>(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
  uploadedById: text("uploaded_by_id").references(() => user.id),
});

// ============================================================================
// Zod Schemas for JSONB validation
// ============================================================================

/**
 * Schema for defining content type fields
 */
export const contentFieldSchema = z.object({
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
    "array",
  ]),
  required: z.boolean().default(false),
  description: z.string().optional(),
  defaultValue: z.unknown().optional(),
  validation: z
    .object({
      min: z.number().optional(),
      max: z.number().optional(),
      pattern: z.string().optional(),
      options: z.array(z.string()).optional(), // For select/enum fields
    })
    .optional(),
  // For reference type - which content type to reference
  referenceType: z.string().optional(),
  // For array type - the type of items in the array
  arrayItemType: z.string().optional(),
});

export const contentTypeSchemaValidator = z.object({
  fields: z.array(contentFieldSchema),
});

export type ContentField = z.infer<typeof contentFieldSchema>;
export type ContentTypeSchema = z.infer<typeof contentTypeSchemaValidator>;

// ============================================================================
// Type exports for Drizzle
// ============================================================================

export type User = typeof user.$inferSelect;
export type NewUser = typeof user.$inferInsert;

export type Session = typeof session.$inferSelect;
export type NewSession = typeof session.$inferInsert;

export type ContentType = typeof contentType.$inferSelect;
export type NewContentType = typeof contentType.$inferInsert;

export type ContentEntry = typeof contentEntry.$inferSelect;
export type NewContentEntry = typeof contentEntry.$inferInsert;

export type Media = typeof media.$inferSelect;
export type NewMedia = typeof media.$inferInsert;
