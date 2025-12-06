import { t as __export } from "./chunk-DGgIvueF.js";
import { NodePgDatabase } from "drizzle-orm/node-postgres";
import * as drizzle_orm_pg_core0 from "drizzle-orm/pg-core";
import { z } from "zod";
import * as better_auth0 from "better-auth";
import * as _trpc_server53 from "@trpc/server";
import { TRPCError } from "@trpc/server";
import superjson from "superjson";

//#region src/db/schema.d.ts
/**
 * User roles in the CMS
 * - superadmin: Full access, can manage other admins
 * - admin: Can manage content
 * - editor: Can edit content but not publish
 */
declare const userRoleEnum: readonly ["superadmin", "admin", "editor"];
type UserRole = (typeof userRoleEnum)[number];
declare const user: drizzle_orm_pg_core0.PgTableWithColumns<{
  name: "cms_user";
  schema: undefined;
  columns: {
    id: drizzle_orm_pg_core0.PgColumn<{
      name: "id";
      tableName: "cms_user";
      dataType: "string";
      columnType: "PgText";
      data: string;
      driverParam: string;
      notNull: true;
      hasDefault: false;
      isPrimaryKey: true;
      isAutoincrement: false;
      hasRuntimeDefault: false;
      enumValues: [string, ...string[]];
      baseColumn: never;
      identity: undefined;
      generated: undefined;
    }, {}, {}>;
    name: drizzle_orm_pg_core0.PgColumn<{
      name: "name";
      tableName: "cms_user";
      dataType: "string";
      columnType: "PgText";
      data: string;
      driverParam: string;
      notNull: true;
      hasDefault: false;
      isPrimaryKey: false;
      isAutoincrement: false;
      hasRuntimeDefault: false;
      enumValues: [string, ...string[]];
      baseColumn: never;
      identity: undefined;
      generated: undefined;
    }, {}, {}>;
    email: drizzle_orm_pg_core0.PgColumn<{
      name: "email";
      tableName: "cms_user";
      dataType: "string";
      columnType: "PgText";
      data: string;
      driverParam: string;
      notNull: true;
      hasDefault: false;
      isPrimaryKey: false;
      isAutoincrement: false;
      hasRuntimeDefault: false;
      enumValues: [string, ...string[]];
      baseColumn: never;
      identity: undefined;
      generated: undefined;
    }, {}, {}>;
    emailVerified: drizzle_orm_pg_core0.PgColumn<{
      name: "email_verified";
      tableName: "cms_user";
      dataType: "boolean";
      columnType: "PgBoolean";
      data: boolean;
      driverParam: boolean;
      notNull: true;
      hasDefault: true;
      isPrimaryKey: false;
      isAutoincrement: false;
      hasRuntimeDefault: false;
      enumValues: undefined;
      baseColumn: never;
      identity: undefined;
      generated: undefined;
    }, {}, {}>;
    image: drizzle_orm_pg_core0.PgColumn<{
      name: "image";
      tableName: "cms_user";
      dataType: "string";
      columnType: "PgText";
      data: string;
      driverParam: string;
      notNull: false;
      hasDefault: false;
      isPrimaryKey: false;
      isAutoincrement: false;
      hasRuntimeDefault: false;
      enumValues: [string, ...string[]];
      baseColumn: never;
      identity: undefined;
      generated: undefined;
    }, {}, {}>;
    role: drizzle_orm_pg_core0.PgColumn<{
      name: "role";
      tableName: "cms_user";
      dataType: "string";
      columnType: "PgText";
      data: "superadmin" | "admin" | "editor";
      driverParam: string;
      notNull: true;
      hasDefault: true;
      isPrimaryKey: false;
      isAutoincrement: false;
      hasRuntimeDefault: false;
      enumValues: ["superadmin", "admin", "editor"];
      baseColumn: never;
      identity: undefined;
      generated: undefined;
    }, {}, {}>;
    createdAt: drizzle_orm_pg_core0.PgColumn<{
      name: "created_at";
      tableName: "cms_user";
      dataType: "date";
      columnType: "PgTimestamp";
      data: Date;
      driverParam: string;
      notNull: true;
      hasDefault: true;
      isPrimaryKey: false;
      isAutoincrement: false;
      hasRuntimeDefault: false;
      enumValues: undefined;
      baseColumn: never;
      identity: undefined;
      generated: undefined;
    }, {}, {}>;
    updatedAt: drizzle_orm_pg_core0.PgColumn<{
      name: "updated_at";
      tableName: "cms_user";
      dataType: "date";
      columnType: "PgTimestamp";
      data: Date;
      driverParam: string;
      notNull: true;
      hasDefault: true;
      isPrimaryKey: false;
      isAutoincrement: false;
      hasRuntimeDefault: false;
      enumValues: undefined;
      baseColumn: never;
      identity: undefined;
      generated: undefined;
    }, {}, {}>;
  };
  dialect: "pg";
}>;
declare const session: drizzle_orm_pg_core0.PgTableWithColumns<{
  name: "cms_session";
  schema: undefined;
  columns: {
    id: drizzle_orm_pg_core0.PgColumn<{
      name: "id";
      tableName: "cms_session";
      dataType: "string";
      columnType: "PgText";
      data: string;
      driverParam: string;
      notNull: true;
      hasDefault: false;
      isPrimaryKey: true;
      isAutoincrement: false;
      hasRuntimeDefault: false;
      enumValues: [string, ...string[]];
      baseColumn: never;
      identity: undefined;
      generated: undefined;
    }, {}, {}>;
    expiresAt: drizzle_orm_pg_core0.PgColumn<{
      name: "expires_at";
      tableName: "cms_session";
      dataType: "date";
      columnType: "PgTimestamp";
      data: Date;
      driverParam: string;
      notNull: true;
      hasDefault: false;
      isPrimaryKey: false;
      isAutoincrement: false;
      hasRuntimeDefault: false;
      enumValues: undefined;
      baseColumn: never;
      identity: undefined;
      generated: undefined;
    }, {}, {}>;
    token: drizzle_orm_pg_core0.PgColumn<{
      name: "token";
      tableName: "cms_session";
      dataType: "string";
      columnType: "PgText";
      data: string;
      driverParam: string;
      notNull: true;
      hasDefault: false;
      isPrimaryKey: false;
      isAutoincrement: false;
      hasRuntimeDefault: false;
      enumValues: [string, ...string[]];
      baseColumn: never;
      identity: undefined;
      generated: undefined;
    }, {}, {}>;
    createdAt: drizzle_orm_pg_core0.PgColumn<{
      name: "created_at";
      tableName: "cms_session";
      dataType: "date";
      columnType: "PgTimestamp";
      data: Date;
      driverParam: string;
      notNull: true;
      hasDefault: true;
      isPrimaryKey: false;
      isAutoincrement: false;
      hasRuntimeDefault: false;
      enumValues: undefined;
      baseColumn: never;
      identity: undefined;
      generated: undefined;
    }, {}, {}>;
    updatedAt: drizzle_orm_pg_core0.PgColumn<{
      name: "updated_at";
      tableName: "cms_session";
      dataType: "date";
      columnType: "PgTimestamp";
      data: Date;
      driverParam: string;
      notNull: true;
      hasDefault: true;
      isPrimaryKey: false;
      isAutoincrement: false;
      hasRuntimeDefault: false;
      enumValues: undefined;
      baseColumn: never;
      identity: undefined;
      generated: undefined;
    }, {}, {}>;
    ipAddress: drizzle_orm_pg_core0.PgColumn<{
      name: "ip_address";
      tableName: "cms_session";
      dataType: "string";
      columnType: "PgText";
      data: string;
      driverParam: string;
      notNull: false;
      hasDefault: false;
      isPrimaryKey: false;
      isAutoincrement: false;
      hasRuntimeDefault: false;
      enumValues: [string, ...string[]];
      baseColumn: never;
      identity: undefined;
      generated: undefined;
    }, {}, {}>;
    userAgent: drizzle_orm_pg_core0.PgColumn<{
      name: "user_agent";
      tableName: "cms_session";
      dataType: "string";
      columnType: "PgText";
      data: string;
      driverParam: string;
      notNull: false;
      hasDefault: false;
      isPrimaryKey: false;
      isAutoincrement: false;
      hasRuntimeDefault: false;
      enumValues: [string, ...string[]];
      baseColumn: never;
      identity: undefined;
      generated: undefined;
    }, {}, {}>;
    userId: drizzle_orm_pg_core0.PgColumn<{
      name: "user_id";
      tableName: "cms_session";
      dataType: "string";
      columnType: "PgText";
      data: string;
      driverParam: string;
      notNull: true;
      hasDefault: false;
      isPrimaryKey: false;
      isAutoincrement: false;
      hasRuntimeDefault: false;
      enumValues: [string, ...string[]];
      baseColumn: never;
      identity: undefined;
      generated: undefined;
    }, {}, {}>;
  };
  dialect: "pg";
}>;
declare const account: drizzle_orm_pg_core0.PgTableWithColumns<{
  name: "cms_account";
  schema: undefined;
  columns: {
    id: drizzle_orm_pg_core0.PgColumn<{
      name: "id";
      tableName: "cms_account";
      dataType: "string";
      columnType: "PgText";
      data: string;
      driverParam: string;
      notNull: true;
      hasDefault: false;
      isPrimaryKey: true;
      isAutoincrement: false;
      hasRuntimeDefault: false;
      enumValues: [string, ...string[]];
      baseColumn: never;
      identity: undefined;
      generated: undefined;
    }, {}, {}>;
    accountId: drizzle_orm_pg_core0.PgColumn<{
      name: "account_id";
      tableName: "cms_account";
      dataType: "string";
      columnType: "PgText";
      data: string;
      driverParam: string;
      notNull: true;
      hasDefault: false;
      isPrimaryKey: false;
      isAutoincrement: false;
      hasRuntimeDefault: false;
      enumValues: [string, ...string[]];
      baseColumn: never;
      identity: undefined;
      generated: undefined;
    }, {}, {}>;
    providerId: drizzle_orm_pg_core0.PgColumn<{
      name: "provider_id";
      tableName: "cms_account";
      dataType: "string";
      columnType: "PgText";
      data: string;
      driverParam: string;
      notNull: true;
      hasDefault: false;
      isPrimaryKey: false;
      isAutoincrement: false;
      hasRuntimeDefault: false;
      enumValues: [string, ...string[]];
      baseColumn: never;
      identity: undefined;
      generated: undefined;
    }, {}, {}>;
    userId: drizzle_orm_pg_core0.PgColumn<{
      name: "user_id";
      tableName: "cms_account";
      dataType: "string";
      columnType: "PgText";
      data: string;
      driverParam: string;
      notNull: true;
      hasDefault: false;
      isPrimaryKey: false;
      isAutoincrement: false;
      hasRuntimeDefault: false;
      enumValues: [string, ...string[]];
      baseColumn: never;
      identity: undefined;
      generated: undefined;
    }, {}, {}>;
    accessToken: drizzle_orm_pg_core0.PgColumn<{
      name: "access_token";
      tableName: "cms_account";
      dataType: "string";
      columnType: "PgText";
      data: string;
      driverParam: string;
      notNull: false;
      hasDefault: false;
      isPrimaryKey: false;
      isAutoincrement: false;
      hasRuntimeDefault: false;
      enumValues: [string, ...string[]];
      baseColumn: never;
      identity: undefined;
      generated: undefined;
    }, {}, {}>;
    refreshToken: drizzle_orm_pg_core0.PgColumn<{
      name: "refresh_token";
      tableName: "cms_account";
      dataType: "string";
      columnType: "PgText";
      data: string;
      driverParam: string;
      notNull: false;
      hasDefault: false;
      isPrimaryKey: false;
      isAutoincrement: false;
      hasRuntimeDefault: false;
      enumValues: [string, ...string[]];
      baseColumn: never;
      identity: undefined;
      generated: undefined;
    }, {}, {}>;
    idToken: drizzle_orm_pg_core0.PgColumn<{
      name: "id_token";
      tableName: "cms_account";
      dataType: "string";
      columnType: "PgText";
      data: string;
      driverParam: string;
      notNull: false;
      hasDefault: false;
      isPrimaryKey: false;
      isAutoincrement: false;
      hasRuntimeDefault: false;
      enumValues: [string, ...string[]];
      baseColumn: never;
      identity: undefined;
      generated: undefined;
    }, {}, {}>;
    accessTokenExpiresAt: drizzle_orm_pg_core0.PgColumn<{
      name: "access_token_expires_at";
      tableName: "cms_account";
      dataType: "date";
      columnType: "PgTimestamp";
      data: Date;
      driverParam: string;
      notNull: false;
      hasDefault: false;
      isPrimaryKey: false;
      isAutoincrement: false;
      hasRuntimeDefault: false;
      enumValues: undefined;
      baseColumn: never;
      identity: undefined;
      generated: undefined;
    }, {}, {}>;
    refreshTokenExpiresAt: drizzle_orm_pg_core0.PgColumn<{
      name: "refresh_token_expires_at";
      tableName: "cms_account";
      dataType: "date";
      columnType: "PgTimestamp";
      data: Date;
      driverParam: string;
      notNull: false;
      hasDefault: false;
      isPrimaryKey: false;
      isAutoincrement: false;
      hasRuntimeDefault: false;
      enumValues: undefined;
      baseColumn: never;
      identity: undefined;
      generated: undefined;
    }, {}, {}>;
    scope: drizzle_orm_pg_core0.PgColumn<{
      name: "scope";
      tableName: "cms_account";
      dataType: "string";
      columnType: "PgText";
      data: string;
      driverParam: string;
      notNull: false;
      hasDefault: false;
      isPrimaryKey: false;
      isAutoincrement: false;
      hasRuntimeDefault: false;
      enumValues: [string, ...string[]];
      baseColumn: never;
      identity: undefined;
      generated: undefined;
    }, {}, {}>;
    password: drizzle_orm_pg_core0.PgColumn<{
      name: "password";
      tableName: "cms_account";
      dataType: "string";
      columnType: "PgText";
      data: string;
      driverParam: string;
      notNull: false;
      hasDefault: false;
      isPrimaryKey: false;
      isAutoincrement: false;
      hasRuntimeDefault: false;
      enumValues: [string, ...string[]];
      baseColumn: never;
      identity: undefined;
      generated: undefined;
    }, {}, {}>;
    createdAt: drizzle_orm_pg_core0.PgColumn<{
      name: "created_at";
      tableName: "cms_account";
      dataType: "date";
      columnType: "PgTimestamp";
      data: Date;
      driverParam: string;
      notNull: true;
      hasDefault: true;
      isPrimaryKey: false;
      isAutoincrement: false;
      hasRuntimeDefault: false;
      enumValues: undefined;
      baseColumn: never;
      identity: undefined;
      generated: undefined;
    }, {}, {}>;
    updatedAt: drizzle_orm_pg_core0.PgColumn<{
      name: "updated_at";
      tableName: "cms_account";
      dataType: "date";
      columnType: "PgTimestamp";
      data: Date;
      driverParam: string;
      notNull: true;
      hasDefault: true;
      isPrimaryKey: false;
      isAutoincrement: false;
      hasRuntimeDefault: false;
      enumValues: undefined;
      baseColumn: never;
      identity: undefined;
      generated: undefined;
    }, {}, {}>;
  };
  dialect: "pg";
}>;
declare const verification: drizzle_orm_pg_core0.PgTableWithColumns<{
  name: "cms_verification";
  schema: undefined;
  columns: {
    id: drizzle_orm_pg_core0.PgColumn<{
      name: "id";
      tableName: "cms_verification";
      dataType: "string";
      columnType: "PgText";
      data: string;
      driverParam: string;
      notNull: true;
      hasDefault: false;
      isPrimaryKey: true;
      isAutoincrement: false;
      hasRuntimeDefault: false;
      enumValues: [string, ...string[]];
      baseColumn: never;
      identity: undefined;
      generated: undefined;
    }, {}, {}>;
    identifier: drizzle_orm_pg_core0.PgColumn<{
      name: "identifier";
      tableName: "cms_verification";
      dataType: "string";
      columnType: "PgText";
      data: string;
      driverParam: string;
      notNull: true;
      hasDefault: false;
      isPrimaryKey: false;
      isAutoincrement: false;
      hasRuntimeDefault: false;
      enumValues: [string, ...string[]];
      baseColumn: never;
      identity: undefined;
      generated: undefined;
    }, {}, {}>;
    value: drizzle_orm_pg_core0.PgColumn<{
      name: "value";
      tableName: "cms_verification";
      dataType: "string";
      columnType: "PgText";
      data: string;
      driverParam: string;
      notNull: true;
      hasDefault: false;
      isPrimaryKey: false;
      isAutoincrement: false;
      hasRuntimeDefault: false;
      enumValues: [string, ...string[]];
      baseColumn: never;
      identity: undefined;
      generated: undefined;
    }, {}, {}>;
    expiresAt: drizzle_orm_pg_core0.PgColumn<{
      name: "expires_at";
      tableName: "cms_verification";
      dataType: "date";
      columnType: "PgTimestamp";
      data: Date;
      driverParam: string;
      notNull: true;
      hasDefault: false;
      isPrimaryKey: false;
      isAutoincrement: false;
      hasRuntimeDefault: false;
      enumValues: undefined;
      baseColumn: never;
      identity: undefined;
      generated: undefined;
    }, {}, {}>;
    createdAt: drizzle_orm_pg_core0.PgColumn<{
      name: "created_at";
      tableName: "cms_verification";
      dataType: "date";
      columnType: "PgTimestamp";
      data: Date;
      driverParam: string;
      notNull: true;
      hasDefault: true;
      isPrimaryKey: false;
      isAutoincrement: false;
      hasRuntimeDefault: false;
      enumValues: undefined;
      baseColumn: never;
      identity: undefined;
      generated: undefined;
    }, {}, {}>;
    updatedAt: drizzle_orm_pg_core0.PgColumn<{
      name: "updated_at";
      tableName: "cms_verification";
      dataType: "date";
      columnType: "PgTimestamp";
      data: Date;
      driverParam: string;
      notNull: true;
      hasDefault: true;
      isPrimaryKey: false;
      isAutoincrement: false;
      hasRuntimeDefault: false;
      enumValues: undefined;
      baseColumn: never;
      identity: undefined;
      generated: undefined;
    }, {}, {}>;
  };
  dialect: "pg";
}>;
/**
 * Content Types - Defines the structure of content (like a schema)
 * e.g., "blog_post", "page", "product"
 */
declare const contentType: drizzle_orm_pg_core0.PgTableWithColumns<{
  name: "cms_content_type";
  schema: undefined;
  columns: {
    id: drizzle_orm_pg_core0.PgColumn<{
      name: "id";
      tableName: "cms_content_type";
      dataType: "string";
      columnType: "PgUUID";
      data: string;
      driverParam: string;
      notNull: true;
      hasDefault: true;
      isPrimaryKey: true;
      isAutoincrement: false;
      hasRuntimeDefault: false;
      enumValues: undefined;
      baseColumn: never;
      identity: undefined;
      generated: undefined;
    }, {}, {}>;
    name: drizzle_orm_pg_core0.PgColumn<{
      name: "name";
      tableName: "cms_content_type";
      dataType: "string";
      columnType: "PgText";
      data: string;
      driverParam: string;
      notNull: true;
      hasDefault: false;
      isPrimaryKey: false;
      isAutoincrement: false;
      hasRuntimeDefault: false;
      enumValues: [string, ...string[]];
      baseColumn: never;
      identity: undefined;
      generated: undefined;
    }, {}, {}>;
    slug: drizzle_orm_pg_core0.PgColumn<{
      name: "slug";
      tableName: "cms_content_type";
      dataType: "string";
      columnType: "PgText";
      data: string;
      driverParam: string;
      notNull: true;
      hasDefault: false;
      isPrimaryKey: false;
      isAutoincrement: false;
      hasRuntimeDefault: false;
      enumValues: [string, ...string[]];
      baseColumn: never;
      identity: undefined;
      generated: undefined;
    }, {}, {}>;
    description: drizzle_orm_pg_core0.PgColumn<{
      name: "description";
      tableName: "cms_content_type";
      dataType: "string";
      columnType: "PgText";
      data: string;
      driverParam: string;
      notNull: false;
      hasDefault: false;
      isPrimaryKey: false;
      isAutoincrement: false;
      hasRuntimeDefault: false;
      enumValues: [string, ...string[]];
      baseColumn: never;
      identity: undefined;
      generated: undefined;
    }, {}, {}>;
    schema: drizzle_orm_pg_core0.PgColumn<{
      name: "schema";
      tableName: "cms_content_type";
      dataType: "json";
      columnType: "PgJsonb";
      data: {
        fields: {
          name: string;
          type: "number" | "boolean" | "array" | "json" | "date" | "text" | "richtext" | "datetime" | "media" | "reference";
          required: boolean;
          description?: string | undefined;
          defaultValue?: unknown;
          validation?: {
            min?: number | undefined;
            max?: number | undefined;
            pattern?: string | undefined;
            options?: string[] | undefined;
          } | undefined;
          referenceType?: string | undefined;
          arrayItemType?: string | undefined;
        }[];
      };
      driverParam: unknown;
      notNull: true;
      hasDefault: false;
      isPrimaryKey: false;
      isAutoincrement: false;
      hasRuntimeDefault: false;
      enumValues: undefined;
      baseColumn: never;
      identity: undefined;
      generated: undefined;
    }, {}, {
      $type: {
        fields: {
          name: string;
          type: "number" | "boolean" | "array" | "json" | "date" | "text" | "richtext" | "datetime" | "media" | "reference";
          required: boolean;
          description?: string | undefined;
          defaultValue?: unknown;
          validation?: {
            min?: number | undefined;
            max?: number | undefined;
            pattern?: string | undefined;
            options?: string[] | undefined;
          } | undefined;
          referenceType?: string | undefined;
          arrayItemType?: string | undefined;
        }[];
      };
    }>;
    createdAt: drizzle_orm_pg_core0.PgColumn<{
      name: "created_at";
      tableName: "cms_content_type";
      dataType: "date";
      columnType: "PgTimestamp";
      data: Date;
      driverParam: string;
      notNull: true;
      hasDefault: true;
      isPrimaryKey: false;
      isAutoincrement: false;
      hasRuntimeDefault: false;
      enumValues: undefined;
      baseColumn: never;
      identity: undefined;
      generated: undefined;
    }, {}, {}>;
    updatedAt: drizzle_orm_pg_core0.PgColumn<{
      name: "updated_at";
      tableName: "cms_content_type";
      dataType: "date";
      columnType: "PgTimestamp";
      data: Date;
      driverParam: string;
      notNull: true;
      hasDefault: true;
      isPrimaryKey: false;
      isAutoincrement: false;
      hasRuntimeDefault: false;
      enumValues: undefined;
      baseColumn: never;
      identity: undefined;
      generated: undefined;
    }, {}, {}>;
    createdById: drizzle_orm_pg_core0.PgColumn<{
      name: "created_by_id";
      tableName: "cms_content_type";
      dataType: "string";
      columnType: "PgText";
      data: string;
      driverParam: string;
      notNull: false;
      hasDefault: false;
      isPrimaryKey: false;
      isAutoincrement: false;
      hasRuntimeDefault: false;
      enumValues: [string, ...string[]];
      baseColumn: never;
      identity: undefined;
      generated: undefined;
    }, {}, {}>;
  };
  dialect: "pg";
}>;
/**
 * Content Entries - Actual content data
 */
declare const contentEntry: drizzle_orm_pg_core0.PgTableWithColumns<{
  name: "cms_content_entry";
  schema: undefined;
  columns: {
    id: drizzle_orm_pg_core0.PgColumn<{
      name: "id";
      tableName: "cms_content_entry";
      dataType: "string";
      columnType: "PgUUID";
      data: string;
      driverParam: string;
      notNull: true;
      hasDefault: true;
      isPrimaryKey: true;
      isAutoincrement: false;
      hasRuntimeDefault: false;
      enumValues: undefined;
      baseColumn: never;
      identity: undefined;
      generated: undefined;
    }, {}, {}>;
    contentTypeId: drizzle_orm_pg_core0.PgColumn<{
      name: "content_type_id";
      tableName: "cms_content_entry";
      dataType: "string";
      columnType: "PgUUID";
      data: string;
      driverParam: string;
      notNull: true;
      hasDefault: false;
      isPrimaryKey: false;
      isAutoincrement: false;
      hasRuntimeDefault: false;
      enumValues: undefined;
      baseColumn: never;
      identity: undefined;
      generated: undefined;
    }, {}, {}>;
    data: drizzle_orm_pg_core0.PgColumn<{
      name: "data";
      tableName: "cms_content_entry";
      dataType: "json";
      columnType: "PgJsonb";
      data: Record<string, unknown>;
      driverParam: unknown;
      notNull: true;
      hasDefault: false;
      isPrimaryKey: false;
      isAutoincrement: false;
      hasRuntimeDefault: false;
      enumValues: undefined;
      baseColumn: never;
      identity: undefined;
      generated: undefined;
    }, {}, {
      $type: Record<string, unknown>;
    }>;
    status: drizzle_orm_pg_core0.PgColumn<{
      name: "status";
      tableName: "cms_content_entry";
      dataType: "string";
      columnType: "PgText";
      data: "draft" | "published" | "archived";
      driverParam: string;
      notNull: true;
      hasDefault: true;
      isPrimaryKey: false;
      isAutoincrement: false;
      hasRuntimeDefault: false;
      enumValues: ["draft", "published", "archived"];
      baseColumn: never;
      identity: undefined;
      generated: undefined;
    }, {}, {}>;
    publishedAt: drizzle_orm_pg_core0.PgColumn<{
      name: "published_at";
      tableName: "cms_content_entry";
      dataType: "date";
      columnType: "PgTimestamp";
      data: Date;
      driverParam: string;
      notNull: false;
      hasDefault: false;
      isPrimaryKey: false;
      isAutoincrement: false;
      hasRuntimeDefault: false;
      enumValues: undefined;
      baseColumn: never;
      identity: undefined;
      generated: undefined;
    }, {}, {}>;
    createdAt: drizzle_orm_pg_core0.PgColumn<{
      name: "created_at";
      tableName: "cms_content_entry";
      dataType: "date";
      columnType: "PgTimestamp";
      data: Date;
      driverParam: string;
      notNull: true;
      hasDefault: true;
      isPrimaryKey: false;
      isAutoincrement: false;
      hasRuntimeDefault: false;
      enumValues: undefined;
      baseColumn: never;
      identity: undefined;
      generated: undefined;
    }, {}, {}>;
    updatedAt: drizzle_orm_pg_core0.PgColumn<{
      name: "updated_at";
      tableName: "cms_content_entry";
      dataType: "date";
      columnType: "PgTimestamp";
      data: Date;
      driverParam: string;
      notNull: true;
      hasDefault: true;
      isPrimaryKey: false;
      isAutoincrement: false;
      hasRuntimeDefault: false;
      enumValues: undefined;
      baseColumn: never;
      identity: undefined;
      generated: undefined;
    }, {}, {}>;
    createdById: drizzle_orm_pg_core0.PgColumn<{
      name: "created_by_id";
      tableName: "cms_content_entry";
      dataType: "string";
      columnType: "PgText";
      data: string;
      driverParam: string;
      notNull: false;
      hasDefault: false;
      isPrimaryKey: false;
      isAutoincrement: false;
      hasRuntimeDefault: false;
      enumValues: [string, ...string[]];
      baseColumn: never;
      identity: undefined;
      generated: undefined;
    }, {}, {}>;
    updatedById: drizzle_orm_pg_core0.PgColumn<{
      name: "updated_by_id";
      tableName: "cms_content_entry";
      dataType: "string";
      columnType: "PgText";
      data: string;
      driverParam: string;
      notNull: false;
      hasDefault: false;
      isPrimaryKey: false;
      isAutoincrement: false;
      hasRuntimeDefault: false;
      enumValues: [string, ...string[]];
      baseColumn: never;
      identity: undefined;
      generated: undefined;
    }, {}, {}>;
  };
  dialect: "pg";
}>;
/**
 * Media/Assets - Files stored in the bucket
 */
declare const media: drizzle_orm_pg_core0.PgTableWithColumns<{
  name: "cms_media";
  schema: undefined;
  columns: {
    id: drizzle_orm_pg_core0.PgColumn<{
      name: "id";
      tableName: "cms_media";
      dataType: "string";
      columnType: "PgUUID";
      data: string;
      driverParam: string;
      notNull: true;
      hasDefault: true;
      isPrimaryKey: true;
      isAutoincrement: false;
      hasRuntimeDefault: false;
      enumValues: undefined;
      baseColumn: never;
      identity: undefined;
      generated: undefined;
    }, {}, {}>;
    filename: drizzle_orm_pg_core0.PgColumn<{
      name: "filename";
      tableName: "cms_media";
      dataType: "string";
      columnType: "PgText";
      data: string;
      driverParam: string;
      notNull: true;
      hasDefault: false;
      isPrimaryKey: false;
      isAutoincrement: false;
      hasRuntimeDefault: false;
      enumValues: [string, ...string[]];
      baseColumn: never;
      identity: undefined;
      generated: undefined;
    }, {}, {}>;
    originalFilename: drizzle_orm_pg_core0.PgColumn<{
      name: "original_filename";
      tableName: "cms_media";
      dataType: "string";
      columnType: "PgText";
      data: string;
      driverParam: string;
      notNull: true;
      hasDefault: false;
      isPrimaryKey: false;
      isAutoincrement: false;
      hasRuntimeDefault: false;
      enumValues: [string, ...string[]];
      baseColumn: never;
      identity: undefined;
      generated: undefined;
    }, {}, {}>;
    mimeType: drizzle_orm_pg_core0.PgColumn<{
      name: "mime_type";
      tableName: "cms_media";
      dataType: "string";
      columnType: "PgText";
      data: string;
      driverParam: string;
      notNull: true;
      hasDefault: false;
      isPrimaryKey: false;
      isAutoincrement: false;
      hasRuntimeDefault: false;
      enumValues: [string, ...string[]];
      baseColumn: never;
      identity: undefined;
      generated: undefined;
    }, {}, {}>;
    size: drizzle_orm_pg_core0.PgColumn<{
      name: "size";
      tableName: "cms_media";
      dataType: "number";
      columnType: "PgInteger";
      data: number;
      driverParam: string | number;
      notNull: true;
      hasDefault: false;
      isPrimaryKey: false;
      isAutoincrement: false;
      hasRuntimeDefault: false;
      enumValues: undefined;
      baseColumn: never;
      identity: undefined;
      generated: undefined;
    }, {}, {}>;
    url: drizzle_orm_pg_core0.PgColumn<{
      name: "url";
      tableName: "cms_media";
      dataType: "string";
      columnType: "PgText";
      data: string;
      driverParam: string;
      notNull: true;
      hasDefault: false;
      isPrimaryKey: false;
      isAutoincrement: false;
      hasRuntimeDefault: false;
      enumValues: [string, ...string[]];
      baseColumn: never;
      identity: undefined;
      generated: undefined;
    }, {}, {}>;
    bucketPath: drizzle_orm_pg_core0.PgColumn<{
      name: "bucket_path";
      tableName: "cms_media";
      dataType: "string";
      columnType: "PgText";
      data: string;
      driverParam: string;
      notNull: true;
      hasDefault: false;
      isPrimaryKey: false;
      isAutoincrement: false;
      hasRuntimeDefault: false;
      enumValues: [string, ...string[]];
      baseColumn: never;
      identity: undefined;
      generated: undefined;
    }, {}, {}>;
    alt: drizzle_orm_pg_core0.PgColumn<{
      name: "alt";
      tableName: "cms_media";
      dataType: "string";
      columnType: "PgText";
      data: string;
      driverParam: string;
      notNull: false;
      hasDefault: false;
      isPrimaryKey: false;
      isAutoincrement: false;
      hasRuntimeDefault: false;
      enumValues: [string, ...string[]];
      baseColumn: never;
      identity: undefined;
      generated: undefined;
    }, {}, {}>;
    caption: drizzle_orm_pg_core0.PgColumn<{
      name: "caption";
      tableName: "cms_media";
      dataType: "string";
      columnType: "PgText";
      data: string;
      driverParam: string;
      notNull: false;
      hasDefault: false;
      isPrimaryKey: false;
      isAutoincrement: false;
      hasRuntimeDefault: false;
      enumValues: [string, ...string[]];
      baseColumn: never;
      identity: undefined;
      generated: undefined;
    }, {}, {}>;
    metadata: drizzle_orm_pg_core0.PgColumn<{
      name: "metadata";
      tableName: "cms_media";
      dataType: "json";
      columnType: "PgJsonb";
      data: Record<string, unknown>;
      driverParam: unknown;
      notNull: false;
      hasDefault: false;
      isPrimaryKey: false;
      isAutoincrement: false;
      hasRuntimeDefault: false;
      enumValues: undefined;
      baseColumn: never;
      identity: undefined;
      generated: undefined;
    }, {}, {
      $type: Record<string, unknown>;
    }>;
    createdAt: drizzle_orm_pg_core0.PgColumn<{
      name: "created_at";
      tableName: "cms_media";
      dataType: "date";
      columnType: "PgTimestamp";
      data: Date;
      driverParam: string;
      notNull: true;
      hasDefault: true;
      isPrimaryKey: false;
      isAutoincrement: false;
      hasRuntimeDefault: false;
      enumValues: undefined;
      baseColumn: never;
      identity: undefined;
      generated: undefined;
    }, {}, {}>;
    updatedAt: drizzle_orm_pg_core0.PgColumn<{
      name: "updated_at";
      tableName: "cms_media";
      dataType: "date";
      columnType: "PgTimestamp";
      data: Date;
      driverParam: string;
      notNull: true;
      hasDefault: true;
      isPrimaryKey: false;
      isAutoincrement: false;
      hasRuntimeDefault: false;
      enumValues: undefined;
      baseColumn: never;
      identity: undefined;
      generated: undefined;
    }, {}, {}>;
    uploadedById: drizzle_orm_pg_core0.PgColumn<{
      name: "uploaded_by_id";
      tableName: "cms_media";
      dataType: "string";
      columnType: "PgText";
      data: string;
      driverParam: string;
      notNull: false;
      hasDefault: false;
      isPrimaryKey: false;
      isAutoincrement: false;
      hasRuntimeDefault: false;
      enumValues: [string, ...string[]];
      baseColumn: never;
      identity: undefined;
      generated: undefined;
    }, {}, {}>;
  };
  dialect: "pg";
}>;
/**
 * Schema for defining content type fields
 */
declare const contentFieldSchema: z.ZodObject<{
  name: z.ZodString;
  type: z.ZodEnum<{
    number: "number";
    boolean: "boolean";
    array: "array";
    json: "json";
    date: "date";
    text: "text";
    richtext: "richtext";
    datetime: "datetime";
    media: "media";
    reference: "reference";
  }>;
  required: z.ZodDefault<z.ZodBoolean>;
  description: z.ZodOptional<z.ZodString>;
  defaultValue: z.ZodOptional<z.ZodUnknown>;
  validation: z.ZodOptional<z.ZodObject<{
    min: z.ZodOptional<z.ZodNumber>;
    max: z.ZodOptional<z.ZodNumber>;
    pattern: z.ZodOptional<z.ZodString>;
    options: z.ZodOptional<z.ZodArray<z.ZodString>>;
  }, z.core.$strip>>;
  referenceType: z.ZodOptional<z.ZodString>;
  arrayItemType: z.ZodOptional<z.ZodString>;
}, z.core.$strip>;
declare const contentTypeSchemaValidator: z.ZodObject<{
  fields: z.ZodArray<z.ZodObject<{
    name: z.ZodString;
    type: z.ZodEnum<{
      number: "number";
      boolean: "boolean";
      array: "array";
      json: "json";
      date: "date";
      text: "text";
      richtext: "richtext";
      datetime: "datetime";
      media: "media";
      reference: "reference";
    }>;
    required: z.ZodDefault<z.ZodBoolean>;
    description: z.ZodOptional<z.ZodString>;
    defaultValue: z.ZodOptional<z.ZodUnknown>;
    validation: z.ZodOptional<z.ZodObject<{
      min: z.ZodOptional<z.ZodNumber>;
      max: z.ZodOptional<z.ZodNumber>;
      pattern: z.ZodOptional<z.ZodString>;
      options: z.ZodOptional<z.ZodArray<z.ZodString>>;
    }, z.core.$strip>>;
    referenceType: z.ZodOptional<z.ZodString>;
    arrayItemType: z.ZodOptional<z.ZodString>;
  }, z.core.$strip>>;
}, z.core.$strip>;
type ContentField = z.infer<typeof contentFieldSchema>;
type ContentTypeSchema = z.infer<typeof contentTypeSchemaValidator>;
type User = typeof user.$inferSelect;
type NewUser = typeof user.$inferInsert;
type Session = typeof session.$inferSelect;
type NewSession = typeof session.$inferInsert;
type ContentType = typeof contentType.$inferSelect;
type NewContentType = typeof contentType.$inferInsert;
type ContentEntry = typeof contentEntry.$inferSelect;
type NewContentEntry = typeof contentEntry.$inferInsert;
type Media = typeof media.$inferSelect;
type NewMedia = typeof media.$inferInsert;
//# sourceMappingURL=schema.d.ts.map
//#endregion
//#region src/db/index.d.ts
type DrizzleClient = NodePgDatabase<typeof schema_d_exports>;
type DatabaseConfig = {
  connectionString: string;
  /**
   * Automatically run migrations on startup
   * @default true
   */
  autoMigrate?: boolean;
} | {
  host: string;
  port?: number;
  user: string;
  password: string;
  database: string;
  ssl?: boolean;
  /**
   * Automatically run migrations on startup
   * @default true
   */
  autoMigrate?: boolean;
};
/**
 * Run schema migrations using Drizzle's migrator
 * Migrations are auto-generated from the schema using `drizzle-kit generate`
 */
declare const runMigrations: (db: DrizzleClient) => Promise<void>;
/**
 * Creates or returns existing database client
 */
declare const createDatabase: (config: DatabaseConfig) => Promise<DrizzleClient>;
/**
 * Get the current database instance
 * Throws if database hasn't been initialized
 */
declare const getDatabase: () => DrizzleClient;
/**
 * Set an external database instance (useful for testing or custom setup)
 */
declare const setDatabase: (db: DrizzleClient) => void;
//#endregion
//#region src/storage/index.d.ts
/**
 * Storage configuration for file uploads
 * Supports S3-compatible storage (AWS S3, Cloudflare R2, MinIO, etc.)
 */
declare const storageConfigSchema: z.ZodObject<{
  endpoint: z.ZodURL;
  bucket: z.ZodString;
  accessKeyId: z.ZodString;
  secretAccessKey: z.ZodString;
  region: z.ZodDefault<z.ZodOptional<z.ZodString>>;
  publicUrl: z.ZodOptional<z.ZodString>;
  pathPrefix: z.ZodDefault<z.ZodOptional<z.ZodString>>;
}, z.core.$strip>;
type StorageConfig = z.infer<typeof storageConfigSchema>;
interface UploadResult {
  url: string;
  bucketPath: string;
  filename: string;
}
interface StorageClient {
  /**
   * Upload a file to the storage bucket
   */
  upload(file: File | Blob, options?: {
    filename?: string;
    contentType?: string;
    folder?: string;
  }): Promise<UploadResult>;
  /**
   * Delete a file from the storage bucket
   */
  delete(bucketPath: string): Promise<void>;
  /**
   * Get a signed URL for temporary access
   */
  getSignedUrl(bucketPath: string, expiresIn?: number): Promise<string>;
  /**
   * Get the public URL for a file
   */
  getPublicUrl(bucketPath: string): string;
}
/**
 * Creates a storage client for S3-compatible storage
 */
declare const createStorageClient: (config: StorageConfig) => StorageClient;
/**
 * Initialize the storage client
 */
declare const initStorage: (config: StorageConfig) => StorageClient;
/**
 * Get the current storage client
 */
declare const getStorage: () => StorageClient;
/**
 * Set an external storage client (useful for testing)
 */
declare const setStorage: (client: StorageClient) => void;
//# sourceMappingURL=index.d.ts.map
//#endregion
//#region src/auth/index.d.ts
interface AuthConfig {
  /**
   * The base URL for the auth routes (relative to basePath)
   * This is automatically set based on the CMS basePath
   * @internal
   */
  authBasePath?: string;
  /**
   * Secret key for signing tokens
   * Should be a random string at least 32 characters long
   */
  secret: string;
  /**
   * The base URL of your application
   * e.g., "https://example.com" or "http://localhost:3000"
   */
  baseUrl: string;
  /**
   * Enable email/password authentication
   * @default true
   */
  emailAndPassword?: boolean;
  /**
   * Trusted origins for CORS
   */
  trustedOrigins?: string[];
  /**
   * Social login providers
   */
  socialProviders?: {
    github?: {
      clientId: string;
      clientSecret: string;
    };
    google?: {
      clientId: string;
      clientSecret: string;
    };
  };
}
/**
 * Creates the better-auth instance
 */
declare const createAuth: (db: DrizzleClient, config: AuthConfig) => better_auth0.Auth<{
  database: (options: better_auth0.BetterAuthOptions) => better_auth0.DBAdapter<better_auth0.BetterAuthOptions>;
  basePath: string;
  secret: string;
  baseURL: string;
  trustedOrigins: string[] | undefined;
  emailAndPassword: {
    enabled: boolean;
  };
  socialProviders: {
    google?: {
      clientId: string;
      clientSecret: string;
    } | undefined;
    github?: {
      clientId: string;
      clientSecret: string;
    } | undefined;
  };
  session: {
    expiresIn: number;
    updateAge: number;
  };
}>;
/**
 * Get the current auth instance
 */
declare const getAuth: () => better_auth0.Auth<better_auth0.BetterAuthOptions>;
/**
 * Get session from request using better-auth
 */
declare const getSession: (req: Request) => Promise<{
  session: {
    id: string;
    createdAt: Date;
    updatedAt: Date;
    userId: string;
    expiresAt: Date;
    token: string;
    ipAddress?: string | null | undefined | undefined;
    userAgent?: string | null | undefined | undefined;
  };
  user: {
    id: string;
    createdAt: Date;
    updatedAt: Date;
    email: string;
    emailVerified: boolean;
    name: string;
    image?: string | null | undefined | undefined;
  };
} | null>;
/**
 * Verify if a request is authenticated
 */
declare const isAuthenticated: (req: Request) => Promise<boolean>;
type Auth = ReturnType<typeof createAuth>;
//# sourceMappingURL=index.d.ts.map
//#endregion
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
//#region src/trpc/init.d.ts
/**
 * Context for tRPC procedures
 */
interface TRPCContext {
  session: Session | null;
  user: User | null;
  req: Request;
}
/**
 * Create the tRPC instance with context
 */

/**
 * Export reusable tRPC helpers
 */
declare const createTRPCRouter: _trpc_server53.TRPCRouterBuilder<{
  ctx: TRPCContext;
  meta: object;
  errorShape: {
    data: {
      zodError: string | undefined;
      code: _trpc_server53.TRPC_ERROR_CODE_KEY;
      httpStatus: number;
      path?: string;
      stack?: string;
    };
    message: string;
    code: _trpc_server53.TRPC_ERROR_CODE_NUMBER;
  };
  transformer: true;
}>;
/**
 * Public (unauthenticated) procedure
 * Can be used by anyone, no session required
 */
declare const publicProcedure: _trpc_server53.TRPCProcedureBuilder<TRPCContext, object, object, _trpc_server53.TRPCUnsetMarker, _trpc_server53.TRPCUnsetMarker, _trpc_server53.TRPCUnsetMarker, _trpc_server53.TRPCUnsetMarker, false>;
/**
 * Protected (authenticated) procedure
 * Requires a valid session
 */
declare const protectedProcedure: _trpc_server53.TRPCProcedureBuilder<TRPCContext, object, {
  user: {
    id: string;
    name: string;
    email: string;
    emailVerified: boolean;
    image: string | null;
    role: "superadmin" | "admin" | "editor";
    createdAt: Date;
    updatedAt: Date;
  };
  session: {
    id: string;
    createdAt: Date;
    updatedAt: Date;
    expiresAt: Date;
    token: string;
    ipAddress: string | null;
    userAgent: string | null;
    userId: string;
  };
  req: Request;
}, _trpc_server53.TRPCUnsetMarker, _trpc_server53.TRPCUnsetMarker, _trpc_server53.TRPCUnsetMarker, _trpc_server53.TRPCUnsetMarker, false>;
/**
 * Middleware for logging
 */
//#endregion
//#region src/trpc/router.d.ts
/**
 * Main CMS API Router
 */
declare const appRouter: _trpc_server53.TRPCBuiltRouter<{
  ctx: TRPCContext;
  meta: object;
  errorShape: {
    data: {
      zodError: string | undefined;
      code: _trpc_server53.TRPC_ERROR_CODE_KEY;
      httpStatus: number;
      path?: string;
      stack?: string;
    };
    message: string;
    code: _trpc_server53.TRPC_ERROR_CODE_NUMBER;
  };
  transformer: true;
}, _trpc_server53.TRPCDecorateCreateRouterOptions<{
  /**
   * Setup and admin management
   */
  setup: _trpc_server53.TRPCBuiltRouter<{
    ctx: TRPCContext;
    meta: object;
    errorShape: {
      data: {
        zodError: string | undefined;
        code: _trpc_server53.TRPC_ERROR_CODE_KEY;
        httpStatus: number;
        path?: string;
        stack?: string;
      };
      message: string;
      code: _trpc_server53.TRPC_ERROR_CODE_NUMBER;
    };
    transformer: true;
  }, _trpc_server53.TRPCDecorateCreateRouterOptions<{
    getStatus: _trpc_server53.TRPCQueryProcedure<{
      input: void;
      output: {
        isSetupComplete: boolean;
        hasSuperadmin: boolean;
        error?: undefined;
      } | {
        isSetupComplete: boolean;
        hasSuperadmin: boolean;
        error: string;
      };
      meta: object;
    }>;
    createSuperadmin: _trpc_server53.TRPCMutationProcedure<{
      input: {
        name: string;
        email: string;
        password: string;
      };
      output: {
        success: boolean;
        message: string;
        user: {
          id: string;
          name: string;
          email: string;
        };
      };
      meta: object;
    }>;
    getMyRole: _trpc_server53.TRPCQueryProcedure<{
      input: void;
      output: {
        role: "superadmin" | "admin" | "editor";
        isSuperadmin: boolean;
        isAdmin: boolean;
      };
      meta: object;
    }>;
    inviteAdmin: _trpc_server53.TRPCMutationProcedure<{
      input: {
        name: string;
        email: string;
        password: string;
        role: "admin" | "editor";
      };
      output: {
        success: boolean;
        user: {
          id: string;
          name: string;
          email: string;
          role: "admin" | "editor";
        };
      };
      meta: object;
    }>;
    listAdmins: _trpc_server53.TRPCQueryProcedure<{
      input: void;
      output: {
        admins: {
          id: string;
          name: string;
          email: string;
          role: "superadmin" | "admin" | "editor";
          createdAt: Date;
        }[];
      };
      meta: object;
    }>;
  }>>;
  /**
   * Content types (schemas)
   */
  contentType: _trpc_server53.TRPCBuiltRouter<{
    ctx: TRPCContext;
    meta: object;
    errorShape: {
      data: {
        zodError: string | undefined;
        code: _trpc_server53.TRPC_ERROR_CODE_KEY;
        httpStatus: number;
        path?: string;
        stack?: string;
      };
      message: string;
      code: _trpc_server53.TRPC_ERROR_CODE_NUMBER;
    };
    transformer: true;
  }, _trpc_server53.TRPCDecorateCreateRouterOptions<{
    list: _trpc_server53.TRPCQueryProcedure<{
      input: void;
      output: {
        id: string;
        name: string;
        slug: string;
        description: string | null;
        schema: {
          fields: {
            name: string;
            type: "number" | "boolean" | "array" | "json" | "date" | "text" | "richtext" | "datetime" | "media" | "reference";
            required: boolean;
            description?: string | undefined;
            defaultValue?: unknown;
            validation?: {
              min?: number | undefined;
              max?: number | undefined;
              pattern?: string | undefined;
              options?: string[] | undefined;
            } | undefined;
            referenceType?: string | undefined;
            arrayItemType?: string | undefined;
          }[];
        };
        createdAt: Date;
        updatedAt: Date;
        createdById: string | null;
      }[];
      meta: object;
    }>;
    getBySlug: _trpc_server53.TRPCQueryProcedure<{
      input: {
        slug: string;
      };
      output: {
        id: string;
        name: string;
        slug: string;
        description: string | null;
        schema: {
          fields: {
            name: string;
            type: "number" | "boolean" | "array" | "json" | "date" | "text" | "richtext" | "datetime" | "media" | "reference";
            required: boolean;
            description?: string | undefined;
            defaultValue?: unknown;
            validation?: {
              min?: number | undefined;
              max?: number | undefined;
              pattern?: string | undefined;
              options?: string[] | undefined;
            } | undefined;
            referenceType?: string | undefined;
            arrayItemType?: string | undefined;
          }[];
        };
        createdAt: Date;
        updatedAt: Date;
        createdById: string | null;
      };
      meta: object;
    }>;
    create: _trpc_server53.TRPCMutationProcedure<{
      input: {
        name: string;
        slug: string;
        schema: {
          fields: {
            name: string;
            type: "number" | "boolean" | "array" | "json" | "date" | "text" | "richtext" | "datetime" | "media" | "reference";
            required?: boolean | undefined;
            description?: string | undefined;
            defaultValue?: unknown;
            validation?: {
              min?: number | undefined;
              max?: number | undefined;
              pattern?: string | undefined;
              options?: string[] | undefined;
            } | undefined;
            referenceType?: string | undefined;
            arrayItemType?: string | undefined;
          }[];
        };
        description?: string | undefined;
      };
      output: {
        id: string;
        name: string;
        createdAt: Date;
        updatedAt: Date;
        description: string | null;
        slug: string;
        schema: {
          fields: {
            name: string;
            type: "number" | "boolean" | "array" | "json" | "date" | "text" | "richtext" | "datetime" | "media" | "reference";
            required: boolean;
            description?: string | undefined;
            defaultValue?: unknown;
            validation?: {
              min?: number | undefined;
              max?: number | undefined;
              pattern?: string | undefined;
              options?: string[] | undefined;
            } | undefined;
            referenceType?: string | undefined;
            arrayItemType?: string | undefined;
          }[];
        };
        createdById: string | null;
      };
      meta: object;
    }>;
    update: _trpc_server53.TRPCMutationProcedure<{
      input: {
        id: string;
        name?: string | undefined;
        description?: string | undefined;
        schema?: {
          fields: {
            name: string;
            type: "number" | "boolean" | "array" | "json" | "date" | "text" | "richtext" | "datetime" | "media" | "reference";
            required?: boolean | undefined;
            description?: string | undefined;
            defaultValue?: unknown;
            validation?: {
              min?: number | undefined;
              max?: number | undefined;
              pattern?: string | undefined;
              options?: string[] | undefined;
            } | undefined;
            referenceType?: string | undefined;
            arrayItemType?: string | undefined;
          }[];
        } | undefined;
      };
      output: {
        id: string;
        name: string;
        slug: string;
        description: string | null;
        schema: {
          fields: {
            name: string;
            type: "number" | "boolean" | "array" | "json" | "date" | "text" | "richtext" | "datetime" | "media" | "reference";
            required: boolean;
            description?: string | undefined;
            defaultValue?: unknown;
            validation?: {
              min?: number | undefined;
              max?: number | undefined;
              pattern?: string | undefined;
              options?: string[] | undefined;
            } | undefined;
            referenceType?: string | undefined;
            arrayItemType?: string | undefined;
          }[];
        };
        createdAt: Date;
        updatedAt: Date;
        createdById: string | null;
      };
      meta: object;
    }>;
    delete: _trpc_server53.TRPCMutationProcedure<{
      input: {
        id: string;
      };
      output: {
        success: boolean;
      };
      meta: object;
    }>;
  }>>;
  /**
   * Content entries (actual data)
   */
  contentEntry: _trpc_server53.TRPCBuiltRouter<{
    ctx: TRPCContext;
    meta: object;
    errorShape: {
      data: {
        zodError: string | undefined;
        code: _trpc_server53.TRPC_ERROR_CODE_KEY;
        httpStatus: number;
        path?: string;
        stack?: string;
      };
      message: string;
      code: _trpc_server53.TRPC_ERROR_CODE_NUMBER;
    };
    transformer: true;
  }, _trpc_server53.TRPCDecorateCreateRouterOptions<{
    list: _trpc_server53.TRPCQueryProcedure<{
      input: {
        contentTypeSlug: string;
        status?: "draft" | "published" | "archived" | undefined;
        limit?: number | undefined;
        offset?: number | undefined;
      };
      output: {
        entries: {
          id: string;
          contentTypeId: string;
          data: Record<string, unknown>;
          status: "draft" | "published" | "archived";
          publishedAt: Date | null;
          createdAt: Date;
          updatedAt: Date;
          createdById: string | null;
          updatedById: string | null;
        }[];
        total: number;
      };
      meta: object;
    }>;
    getById: _trpc_server53.TRPCQueryProcedure<{
      input: {
        id: string;
      };
      output: {
        id: string;
        contentTypeId: string;
        data: Record<string, unknown>;
        status: "draft" | "published" | "archived";
        publishedAt: Date | null;
        createdAt: Date;
        updatedAt: Date;
        createdById: string | null;
        updatedById: string | null;
      };
      meta: object;
    }>;
    create: _trpc_server53.TRPCMutationProcedure<{
      input: {
        contentTypeId: string;
        data: Record<string | number | symbol, unknown>;
        status?: "draft" | "published" | "archived" | undefined;
      };
      output: {
        id: string;
        data: Record<string, unknown>;
        createdAt: Date;
        updatedAt: Date;
        createdById: string | null;
        contentTypeId: string;
        status: "draft" | "published" | "archived";
        publishedAt: Date | null;
        updatedById: string | null;
      };
      meta: object;
    }>;
    update: _trpc_server53.TRPCMutationProcedure<{
      input: {
        id: string;
        data?: Record<string | number | symbol, unknown> | undefined;
        status?: "draft" | "published" | "archived" | undefined;
      };
      output: {
        id: string;
        contentTypeId: string;
        data: Record<string, unknown>;
        status: "draft" | "published" | "archived";
        publishedAt: Date | null;
        createdAt: Date;
        updatedAt: Date;
        createdById: string | null;
        updatedById: string | null;
      };
      meta: object;
    }>;
    delete: _trpc_server53.TRPCMutationProcedure<{
      input: {
        id: string;
      };
      output: {
        success: boolean;
      };
      meta: object;
    }>;
    publish: _trpc_server53.TRPCMutationProcedure<{
      input: {
        id: string;
      };
      output: {
        id: string;
        contentTypeId: string;
        data: Record<string, unknown>;
        status: "draft" | "published" | "archived";
        publishedAt: Date | null;
        createdAt: Date;
        updatedAt: Date;
        createdById: string | null;
        updatedById: string | null;
      };
      meta: object;
    }>;
    unpublish: _trpc_server53.TRPCMutationProcedure<{
      input: {
        id: string;
      };
      output: {
        id: string;
        contentTypeId: string;
        data: Record<string, unknown>;
        status: "draft" | "published" | "archived";
        publishedAt: Date | null;
        createdAt: Date;
        updatedAt: Date;
        createdById: string | null;
        updatedById: string | null;
      };
      meta: object;
    }>;
  }>>;
  /**
   * Media/file management
   */
  media: _trpc_server53.TRPCBuiltRouter<{
    ctx: TRPCContext;
    meta: object;
    errorShape: {
      data: {
        zodError: string | undefined;
        code: _trpc_server53.TRPC_ERROR_CODE_KEY;
        httpStatus: number;
        path?: string;
        stack?: string;
      };
      message: string;
      code: _trpc_server53.TRPC_ERROR_CODE_NUMBER;
    };
    transformer: true;
  }, _trpc_server53.TRPCDecorateCreateRouterOptions<{
    list: _trpc_server53.TRPCQueryProcedure<{
      input: {
        limit?: number | undefined;
        offset?: number | undefined;
        mimeType?: string | undefined;
      };
      output: {
        files: {
          id: string;
          filename: string;
          originalFilename: string;
          mimeType: string;
          size: number;
          url: string;
          bucketPath: string;
          alt: string | null;
          caption: string | null;
          metadata: Record<string, unknown> | null;
          createdAt: Date;
          updatedAt: Date;
          uploadedById: string | null;
        }[];
        total: number;
      };
      meta: object;
    }>;
    getById: _trpc_server53.TRPCQueryProcedure<{
      input: {
        id: string;
      };
      output: {
        id: string;
        filename: string;
        originalFilename: string;
        mimeType: string;
        size: number;
        url: string;
        bucketPath: string;
        alt: string | null;
        caption: string | null;
        metadata: Record<string, unknown> | null;
        createdAt: Date;
        updatedAt: Date;
        uploadedById: string | null;
      };
      meta: object;
    }>;
    create: _trpc_server53.TRPCMutationProcedure<{
      input: {
        filename: string;
        originalFilename: string;
        mimeType: string;
        size: number;
        url: string;
        bucketPath: string;
        alt?: string | undefined;
        caption?: string | undefined;
        metadata?: Record<string | number | symbol, unknown> | undefined;
      };
      output: {
        url: string;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        metadata: Record<string, unknown> | null;
        filename: string;
        originalFilename: string;
        mimeType: string;
        size: number;
        bucketPath: string;
        alt: string | null;
        caption: string | null;
        uploadedById: string | null;
      };
      meta: object;
    }>;
    update: _trpc_server53.TRPCMutationProcedure<{
      input: {
        id: string;
        alt?: string | undefined;
        caption?: string | undefined;
        metadata?: Record<string | number | symbol, unknown> | undefined;
      };
      output: {
        id: string;
        filename: string;
        originalFilename: string;
        mimeType: string;
        size: number;
        url: string;
        bucketPath: string;
        alt: string | null;
        caption: string | null;
        metadata: Record<string, unknown> | null;
        createdAt: Date;
        updatedAt: Date;
        uploadedById: string | null;
      };
      meta: object;
    }>;
    delete: _trpc_server53.TRPCMutationProcedure<{
      input: {
        id: string;
      };
      output: {
        success: boolean;
        error: string;
      } | {
        success: boolean;
        error?: undefined;
      };
      meta: object;
    }>;
    getSignedUrl: _trpc_server53.TRPCQueryProcedure<{
      input: {
        id: string;
        expiresIn?: number | undefined;
      };
      output: {
        url: string;
      } | null;
      meta: object;
    }>;
  }>>;
  /**
   * Example public endpoint - health check
   */
  health: _trpc_server53.TRPCQueryProcedure<{
    input: void;
    output: {
      status: string;
      timestamp: string;
      version: string;
    };
    meta: object;
  }>;
  /**
   * Example protected endpoint - get current user info
   */
  me: _trpc_server53.TRPCQueryProcedure<{
    input: void;
    output: {
      user: {
        id: string;
        name: string;
        email: string;
        emailVerified: boolean;
        image: string | null;
        role: "superadmin" | "admin" | "editor";
        createdAt: Date;
        updatedAt: Date;
      };
      session: {
        id: string;
        expiresAt: Date;
      };
    };
    meta: object;
  }>;
}>>;
type AppRouter = typeof appRouter;
//#endregion
//#region src/trpc/handler.d.ts
/**
 * Creates the context for each tRPC request
 * Extracts session and user from the request using better-auth
 */
declare const createContext: (req: Request) => Promise<TRPCContext>;
/**
 * Handle tRPC requests using the fetch adapter
 */
declare const handleTRPCRequest: (req: Request) => Promise<Response>;
//# sourceMappingURL=handler.d.ts.map
//#endregion
//#region src/index.d.ts
type CreateCMSOptions = {
  /**
   * Base path for the CMS admin panel
   * @default "/admin"
   */
  basePath?: string;
  /**
   * Database configuration for Drizzle ORM
   * Supports connection string or individual parameters
   */
  database?: DatabaseConfig;
  /**
   * Storage configuration for file uploads
   * Supports S3-compatible storage (AWS S3, Cloudflare R2, MinIO, etc.)
   */
  storage?: StorageConfig;
  /**
   * Authentication configuration using better-auth
   */
  auth?: AuthConfig;
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
export { session as $, createDatabase as A, NewContentType as B, UploadResult as C, setStorage as D, initStorage as E, ContentField as F, User as G, NewSession as H, ContentType as I, contentEntry as J, UserRole as K, ContentTypeSchema as L, runMigrations as M, setDatabase as N, DatabaseConfig as O, ContentEntry as P, media as Q, Media as R, StorageConfig as S, getStorage as T, NewUser as U, NewMedia as V, Session as W, contentType as X, contentFieldSchema as Y, contentTypeSchemaValidator as Z, createAuth as _, handleTRPCRequest as a, isAuthenticated as b, TRPCContext as c, publicProcedure as d, user as et, htmlTemplate as f, AuthConfig as g, Auth as h, createContext as i, getDatabase as j, DrizzleClient as k, createTRPCRouter as l, createCMS as m, CMSRequest as n, verification as nt, AppRouter as o, renderAdminPanel as p, account as q, CreateCMSOptions as r, appRouter as s, CMSHandlers as t, userRoleEnum as tt, protectedProcedure as u, getAuth as v, createStorageClient as w, StorageClient as x, getSession as y, NewContentEntry as z };
//# sourceMappingURL=index-KeDVcsYz.d.ts.map