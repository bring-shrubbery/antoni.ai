import { z } from "zod";
import { eq } from "drizzle-orm";
import { createTRPCRouter, protectedProcedure } from "../init";
import { getDatabase } from "../../db";
import {
  contentType,
  collectionFieldSchema,
  contentTypeSchemaValidator,
  type ContentTypeSchema,
} from "../../db/schema";

/**
 * Generate a URL-friendly slug from a name
 */
function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

/**
 * Generate a unique ID for fields
 */
function generateFieldId(): string {
  return `field_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

export const collectionsRouter = createTRPCRouter({
  /**
   * List all collections
   */
  list: protectedProcedure.query(async () => {
    const db = getDatabase();

    const collections = await db
      .select({
        id: contentType.id,
        name: contentType.name,
        slug: contentType.slug,
        description: contentType.description,
        schema: contentType.schema,
        createdAt: contentType.createdAt,
        updatedAt: contentType.updatedAt,
      })
      .from(contentType)
      .orderBy(contentType.name);

    return collections;
  }),

  /**
   * Get a single collection by ID
   */
  getById: protectedProcedure
    .input(z.object({ id: z.string().uuid() }))
    .query(async ({ input }) => {
      const db = getDatabase();

      const [collection] = await db
        .select()
        .from(contentType)
        .where(eq(contentType.id, input.id))
        .limit(1);

      if (!collection) {
        throw new Error("Collection not found");
      }

      return collection;
    }),

  /**
   * Get a single collection by slug
   */
  getBySlug: protectedProcedure
    .input(z.object({ slug: z.string() }))
    .query(async ({ input }) => {
      const db = getDatabase();

      const [collection] = await db
        .select()
        .from(contentType)
        .where(eq(contentType.slug, input.slug))
        .limit(1);

      if (!collection) {
        throw new Error("Collection not found");
      }

      return collection;
    }),

  /**
   * Create a new collection
   */
  create: protectedProcedure
    .input(
      z.object({
        name: z.string().min(1).max(100),
        description: z.string().optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const db = getDatabase();

      const slug = generateSlug(input.name);

      // Check if slug already exists
      const [existing] = await db
        .select({ id: contentType.id })
        .from(contentType)
        .where(eq(contentType.slug, slug))
        .limit(1);

      if (existing) {
        throw new Error(`A collection with the slug "${slug}" already exists`);
      }

      // Create with empty schema
      const schema: ContentTypeSchema = { fields: [] };

      const [collection] = await db
        .insert(contentType)
        .values({
          name: input.name,
          slug,
          description: input.description,
          schema,
          createdById: ctx.user.id,
        })
        .returning();

      return collection;
    }),

  /**
   * Update collection metadata (name, description)
   */
  update: protectedProcedure
    .input(
      z.object({
        id: z.string().uuid(),
        name: z.string().min(1).max(100).optional(),
        description: z.string().optional(),
      })
    )
    .mutation(async ({ input }) => {
      const db = getDatabase();

      const updates: Partial<typeof contentType.$inferInsert> = {
        updatedAt: new Date(),
      };

      if (input.name) {
        updates.name = input.name;
        updates.slug = generateSlug(input.name);

        // Check if new slug already exists (excluding current)
        const [existing] = await db
          .select({ id: contentType.id })
          .from(contentType)
          .where(eq(contentType.slug, updates.slug))
          .limit(1);

        if (existing && existing.id !== input.id) {
          throw new Error(
            `A collection with the slug "${updates.slug}" already exists`
          );
        }
      }

      if (input.description !== undefined) {
        updates.description = input.description;
      }

      const [collection] = await db
        .update(contentType)
        .set(updates)
        .where(eq(contentType.id, input.id))
        .returning();

      if (!collection) {
        throw new Error("Collection not found");
      }

      return collection;
    }),

  /**
   * Delete a collection
   */
  delete: protectedProcedure
    .input(z.object({ id: z.string().uuid() }))
    .mutation(async ({ input }) => {
      const db = getDatabase();

      const [deleted] = await db
        .delete(contentType)
        .where(eq(contentType.id, input.id))
        .returning({ id: contentType.id });

      if (!deleted) {
        throw new Error("Collection not found");
      }

      return { success: true };
    }),

  /**
   * Update the schema (fields) for a collection
   */
  updateSchema: protectedProcedure
    .input(
      z.object({
        id: z.string().uuid(),
        schema: contentTypeSchemaValidator,
      })
    )
    .mutation(async ({ input }) => {
      const db = getDatabase();

      // Validate field keys are unique
      const keys = input.schema.fields.map((f) => f.key);
      if (new Set(keys).size !== keys.length) {
        throw new Error("Field keys must be unique");
      }

      const [collection] = await db
        .update(contentType)
        .set({
          schema: input.schema,
          updatedAt: new Date(),
        })
        .where(eq(contentType.id, input.id))
        .returning();

      if (!collection) {
        throw new Error("Collection not found");
      }

      return collection;
    }),

  /**
   * Add a field to a collection's schema
   */
  addField: protectedProcedure
    .input(
      z.object({
        collectionId: z.string().uuid(),
        field: collectionFieldSchema.omit({ id: true }),
      })
    )
    .mutation(async ({ input }) => {
      const db = getDatabase();

      // Get current schema
      const [collection] = await db
        .select({ schema: contentType.schema })
        .from(contentType)
        .where(eq(contentType.id, input.collectionId))
        .limit(1);

      if (!collection) {
        throw new Error("Collection not found");
      }

      const currentSchema = collection.schema as ContentTypeSchema;

      // Check if key already exists
      if (currentSchema.fields.some((f) => f.key === input.field.key)) {
        throw new Error(`A field with key "${input.field.key}" already exists`);
      }

      // Add new field with generated ID
      const newField = {
        ...input.field,
        id: generateFieldId(),
      };

      const updatedSchema: ContentTypeSchema = {
        fields: [...currentSchema.fields, newField],
      };

      const [updated] = await db
        .update(contentType)
        .set({
          schema: updatedSchema,
          updatedAt: new Date(),
        })
        .where(eq(contentType.id, input.collectionId))
        .returning();

      return updated;
    }),

  /**
   * Update a field in a collection's schema
   */
  updateField: protectedProcedure
    .input(
      z.object({
        collectionId: z.string().uuid(),
        fieldId: z.string(),
        updates: collectionFieldSchema.partial().omit({ id: true }),
      })
    )
    .mutation(async ({ input }) => {
      const db = getDatabase();

      // Get current schema
      const [collection] = await db
        .select({ schema: contentType.schema })
        .from(contentType)
        .where(eq(contentType.id, input.collectionId))
        .limit(1);

      if (!collection) {
        throw new Error("Collection not found");
      }

      const currentSchema = collection.schema as ContentTypeSchema;

      // Find and update the field
      const fieldIndex = currentSchema.fields.findIndex(
        (f) => f.id === input.fieldId
      );

      if (fieldIndex === -1) {
        throw new Error("Field not found");
      }

      // If updating key, check for uniqueness
      if (
        input.updates.key &&
        currentSchema.fields.some(
          (f, i) => i !== fieldIndex && f.key === input.updates.key
        )
      ) {
        throw new Error(
          `A field with key "${input.updates.key}" already exists`
        );
      }

      const updatedFields = [...currentSchema.fields];
      updatedFields[fieldIndex] = {
        ...updatedFields[fieldIndex],
        ...input.updates,
      };

      const updatedSchema: ContentTypeSchema = {
        fields: updatedFields,
      };

      const [updated] = await db
        .update(contentType)
        .set({
          schema: updatedSchema,
          updatedAt: new Date(),
        })
        .where(eq(contentType.id, input.collectionId))
        .returning();

      return updated;
    }),

  /**
   * Remove a field from a collection's schema
   */
  removeField: protectedProcedure
    .input(
      z.object({
        collectionId: z.string().uuid(),
        fieldId: z.string(),
      })
    )
    .mutation(async ({ input }) => {
      const db = getDatabase();

      // Get current schema
      const [collection] = await db
        .select({ schema: contentType.schema })
        .from(contentType)
        .where(eq(contentType.id, input.collectionId))
        .limit(1);

      if (!collection) {
        throw new Error("Collection not found");
      }

      const currentSchema = collection.schema as ContentTypeSchema;

      const updatedSchema: ContentTypeSchema = {
        fields: currentSchema.fields.filter((f) => f.id !== input.fieldId),
      };

      const [updated] = await db
        .update(contentType)
        .set({
          schema: updatedSchema,
          updatedAt: new Date(),
        })
        .where(eq(contentType.id, input.collectionId))
        .returning();

      return updated;
    }),

  /**
   * Reorder fields in a collection's schema
   */
  reorderFields: protectedProcedure
    .input(
      z.object({
        collectionId: z.string().uuid(),
        fieldIds: z.array(z.string()),
      })
    )
    .mutation(async ({ input }) => {
      const db = getDatabase();

      // Get current schema
      const [collection] = await db
        .select({ schema: contentType.schema })
        .from(contentType)
        .where(eq(contentType.id, input.collectionId))
        .limit(1);

      if (!collection) {
        throw new Error("Collection not found");
      }

      const currentSchema = collection.schema as ContentTypeSchema;

      // Reorder fields according to the provided order
      const fieldMap = new Map(currentSchema.fields.map((f) => [f.id, f]));
      const reorderedFields = input.fieldIds
        .map((id) => fieldMap.get(id))
        .filter((f): f is NonNullable<typeof f> => f !== undefined);

      // Add any fields that weren't in the order list at the end
      for (const field of currentSchema.fields) {
        if (!input.fieldIds.includes(field.id)) {
          reorderedFields.push(field);
        }
      }

      const updatedSchema: ContentTypeSchema = {
        fields: reorderedFields,
      };

      const [updated] = await db
        .update(contentType)
        .set({
          schema: updatedSchema,
          updatedAt: new Date(),
        })
        .where(eq(contentType.id, input.collectionId))
        .returning();

      return updated;
    }),
});
