import { z } from "zod";
import { eq, and, desc, asc, sql } from "drizzle-orm";
import { createTRPCRouter, protectedProcedure } from "../init";
import { getDatabase } from "../../db";
import {
  contentType,
  contentEntry,
  type ContentTypeSchema,
  type CollectionField,
  type ArrayItemType,
} from "../../db/schema";

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
function validateValue(
  value: unknown,
  type: string,
  fieldName: string
): string | null {
  switch (type) {
    case "string":
    case "textarea":
      if (typeof value !== "string") {
        return `Field "${fieldName}" must be a string`;
      }
      break;
    case "number":
      if (typeof value !== "number" || isNaN(value)) {
        return `Field "${fieldName}" must be a number`;
      }
      break;
    case "boolean":
      if (typeof value !== "boolean") {
        return `Field "${fieldName}" must be a boolean`;
      }
      break;
    case "date":
      if (typeof value !== "string" || !ISO_DATE_REGEX.test(value)) {
        return `Field "${fieldName}" must be a valid date`;
      }
      break;
    case "url":
      if (typeof value !== "string" || !URL_REGEX.test(value)) {
        return `Field "${fieldName}" must be a valid URL`;
      }
      break;
    case "image":
      // Image stores a media ID (uuid string) or object with id
      if (typeof value !== "string" && typeof value !== "object") {
        return `Field "${fieldName}" must be a valid image reference`;
      }
      break;
  }
  return null;
}

/**
 * Validate entry data against the collection schema
 */
function validateEntryData(
  data: Record<string, unknown>,
  schema: ContentTypeSchema
): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  for (const field of schema.fields) {
    const value = data[field.key];

    // Check required fields
    if (field.required) {
      const isEmpty =
        value === undefined ||
        value === null ||
        value === "" ||
        (Array.isArray(value) && value.length === 0);
      if (isEmpty) {
        errors.push(`Field "${field.name}" is required`);
        continue;
      }
    }

    // Skip validation if value is empty and not required
    if (value === undefined || value === null || value === "") {
      continue;
    }

    // Type validation
    if (field.type === "array") {
      if (!Array.isArray(value)) {
        errors.push(`Field "${field.name}" must be an array`);
        continue;
      }
      // Validate each item in the array
      const itemType = field.arrayItemType || "string";
      for (let i = 0; i < value.length; i++) {
        const itemError = validateValue(
          value[i],
          itemType,
          `${field.name}[${i}]`
        );
        if (itemError) {
          errors.push(itemError);
        }
      }
    } else {
      const error = validateValue(value, field.type, field.name);
      if (error) {
        errors.push(error);
      }
    }
  }

  return { valid: errors.length === 0, errors };
}

/**
 * Apply default values from schema to entry data
 */
function applyDefaults(
  data: Record<string, unknown>,
  schema: ContentTypeSchema
): Record<string, unknown> {
  const result = { ...data };

  for (const field of schema.fields) {
    if (
      (result[field.key] === undefined || result[field.key] === null) &&
      field.defaultValue !== undefined
    ) {
      result[field.key] = field.defaultValue;
    }
  }

  return result;
}

export const entriesRouter = createTRPCRouter({
  /**
   * List entries for a collection
   */
  list: protectedProcedure
    .input(
      z.object({
        collectionId: z.string().uuid(),
        status: z.enum(["draft", "published", "archived"]).optional(),
        limit: z.number().min(1).max(100).default(50),
        offset: z.number().min(0).default(0),
        orderBy: z.enum(["createdAt", "updatedAt"]).default("createdAt"),
        orderDir: z.enum(["asc", "desc"]).default("desc"),
      })
    )
    .query(async ({ input }) => {
      const db = getDatabase();

      // Build conditions
      const conditions = [eq(contentEntry.contentTypeId, input.collectionId)];

      if (input.status) {
        conditions.push(eq(contentEntry.status, input.status));
      }

      // Get entries
      const entries = await db
        .select({
          id: contentEntry.id,
          data: contentEntry.data,
          status: contentEntry.status,
          publishedAt: contentEntry.publishedAt,
          createdAt: contentEntry.createdAt,
          updatedAt: contentEntry.updatedAt,
        })
        .from(contentEntry)
        .where(and(...conditions))
        .orderBy(
          input.orderDir === "desc"
            ? desc(contentEntry[input.orderBy])
            : asc(contentEntry[input.orderBy])
        )
        .limit(input.limit)
        .offset(input.offset);

      // Get total count
      const [{ count }] = await db
        .select({ count: sql<number>`count(*)::int` })
        .from(contentEntry)
        .where(and(...conditions));

      return {
        entries,
        total: count,
        limit: input.limit,
        offset: input.offset,
      };
    }),

  /**
   * Get a single entry by ID
   */
  getById: protectedProcedure
    .input(z.object({ id: z.string().uuid() }))
    .query(async ({ input }) => {
      const db = getDatabase();

      const [entry] = await db
        .select()
        .from(contentEntry)
        .where(eq(contentEntry.id, input.id))
        .limit(1);

      if (!entry) {
        throw new Error("Entry not found");
      }

      return entry;
    }),

  /**
   * Create a new entry
   */
  create: protectedProcedure
    .input(
      z.object({
        collectionId: z.string().uuid(),
        data: z.record(z.string(), z.unknown()),
        status: z.enum(["draft", "published"]).default("draft"),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const db = getDatabase();

      // Get the collection schema
      const [collection] = await db
        .select({ schema: contentType.schema })
        .from(contentType)
        .where(eq(contentType.id, input.collectionId))
        .limit(1);

      if (!collection) {
        throw new Error("Collection not found");
      }

      const schema = collection.schema as ContentTypeSchema;

      // Apply defaults
      const dataWithDefaults = applyDefaults(input.data, schema);

      // Validate data against schema
      const validation = validateEntryData(dataWithDefaults, schema);
      if (!validation.valid) {
        throw new Error(`Validation failed: ${validation.errors.join(", ")}`);
      }

      const [entry] = await db
        .insert(contentEntry)
        .values({
          contentTypeId: input.collectionId,
          data: dataWithDefaults,
          status: input.status,
          publishedAt: input.status === "published" ? new Date() : null,
          createdById: ctx.user.id,
          updatedById: ctx.user.id,
        })
        .returning();

      return entry;
    }),

  /**
   * Update an entry
   */
  update: protectedProcedure
    .input(
      z.object({
        id: z.string().uuid(),
        data: z.record(z.string(), z.unknown()).optional(),
        status: z.enum(["draft", "published", "archived"]).optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const db = getDatabase();

      // Get the entry and its collection schema
      const [entry] = await db
        .select({
          entry: contentEntry,
          schema: contentType.schema,
        })
        .from(contentEntry)
        .innerJoin(contentType, eq(contentEntry.contentTypeId, contentType.id))
        .where(eq(contentEntry.id, input.id))
        .limit(1);

      if (!entry) {
        throw new Error("Entry not found");
      }

      const schema = entry.schema as ContentTypeSchema;

      // Prepare updates
      const updates: Partial<typeof contentEntry.$inferInsert> = {
        updatedAt: new Date(),
        updatedById: ctx.user.id,
      };

      if (input.data) {
        // Merge with existing data and apply defaults
        const mergedData = { ...entry.entry.data, ...input.data };
        const dataWithDefaults = applyDefaults(mergedData, schema);

        // Validate
        const validation = validateEntryData(dataWithDefaults, schema);
        if (!validation.valid) {
          throw new Error(`Validation failed: ${validation.errors.join(", ")}`);
        }

        updates.data = dataWithDefaults;
      }

      if (input.status) {
        updates.status = input.status;

        // Set publishedAt when publishing
        if (
          input.status === "published" &&
          entry.entry.status !== "published"
        ) {
          updates.publishedAt = new Date();
        }
      }

      const [updated] = await db
        .update(contentEntry)
        .set(updates)
        .where(eq(contentEntry.id, input.id))
        .returning();

      return updated;
    }),

  /**
   * Delete an entry
   */
  delete: protectedProcedure
    .input(z.object({ id: z.string().uuid() }))
    .mutation(async ({ input }) => {
      const db = getDatabase();

      const [deleted] = await db
        .delete(contentEntry)
        .where(eq(contentEntry.id, input.id))
        .returning({ id: contentEntry.id });

      if (!deleted) {
        throw new Error("Entry not found");
      }

      return { success: true };
    }),

  /**
   * Publish an entry
   */
  publish: protectedProcedure
    .input(z.object({ id: z.string().uuid() }))
    .mutation(async ({ input, ctx }) => {
      const db = getDatabase();

      const [entry] = await db
        .update(contentEntry)
        .set({
          status: "published",
          publishedAt: new Date(),
          updatedAt: new Date(),
          updatedById: ctx.user.id,
        })
        .where(eq(contentEntry.id, input.id))
        .returning();

      if (!entry) {
        throw new Error("Entry not found");
      }

      return entry;
    }),

  /**
   * Unpublish an entry (set to draft)
   */
  unpublish: protectedProcedure
    .input(z.object({ id: z.string().uuid() }))
    .mutation(async ({ input, ctx }) => {
      const db = getDatabase();

      const [entry] = await db
        .update(contentEntry)
        .set({
          status: "draft",
          updatedAt: new Date(),
          updatedById: ctx.user.id,
        })
        .where(eq(contentEntry.id, input.id))
        .returning();

      if (!entry) {
        throw new Error("Entry not found");
      }

      return entry;
    }),

  /**
   * Archive an entry
   */
  archive: protectedProcedure
    .input(z.object({ id: z.string().uuid() }))
    .mutation(async ({ input, ctx }) => {
      const db = getDatabase();

      const [entry] = await db
        .update(contentEntry)
        .set({
          status: "archived",
          updatedAt: new Date(),
          updatedById: ctx.user.id,
        })
        .where(eq(contentEntry.id, input.id))
        .returning();

      if (!entry) {
        throw new Error("Entry not found");
      }

      return entry;
    }),

  /**
   * Bulk delete entries
   */
  bulkDelete: protectedProcedure
    .input(z.object({ ids: z.array(z.string().uuid()) }))
    .mutation(async ({ input }) => {
      const db = getDatabase();

      let deletedCount = 0;

      for (const id of input.ids) {
        const [deleted] = await db
          .delete(contentEntry)
          .where(eq(contentEntry.id, id))
          .returning({ id: contentEntry.id });

        if (deleted) {
          deletedCount++;
        }
      }

      return { deletedCount };
    }),
});
