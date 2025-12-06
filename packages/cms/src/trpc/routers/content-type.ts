import { z } from "zod";
import { eq } from "drizzle-orm";
import { createTRPCRouter, publicProcedure, protectedProcedure } from "../init";
import { getDatabase } from "../../db";
import {
  contentType,
  contentTypeSchemaValidator,
  type ContentTypeSchema,
} from "../../db/schema";

export const contentTypeRouter = createTRPCRouter({
  /**
   * Get all content types (public - for content fetching)
   */
  list: publicProcedure.query(async () => {
    const db = getDatabase();
    const types = await db.select().from(contentType).orderBy(contentType.name);
    return types;
  }),

  /**
   * Get a single content type by slug (public)
   */
  getBySlug: publicProcedure
    .input(z.object({ slug: z.string() }))
    .query(async ({ input }) => {
      const db = getDatabase();
      const [type] = await db
        .select()
        .from(contentType)
        .where(eq(contentType.slug, input.slug))
        .limit(1);

      return type ?? null;
    }),

  /**
   * Create a new content type (protected)
   */
  create: protectedProcedure
    .input(
      z.object({
        name: z.string().min(1).max(100),
        slug: z
          .string()
          .min(1)
          .max(100)
          .regex(/^[a-z0-9-]+$/),
        description: z.string().optional(),
        schema: contentTypeSchemaValidator,
      })
    )
    .mutation(async ({ input, ctx }) => {
      const db = getDatabase();

      const [newType] = await db
        .insert(contentType)
        .values({
          name: input.name,
          slug: input.slug,
          description: input.description,
          schema: input.schema as ContentTypeSchema,
          createdById: ctx.user.id,
        })
        .returning();

      return newType;
    }),

  /**
   * Update a content type (protected)
   */
  update: protectedProcedure
    .input(
      z.object({
        id: z.string().uuid(),
        name: z.string().min(1).max(100).optional(),
        description: z.string().optional(),
        schema: contentTypeSchemaValidator.optional(),
      })
    )
    .mutation(async ({ input }) => {
      const db = getDatabase();

      const updateData: Partial<typeof contentType.$inferInsert> = {
        updatedAt: new Date(),
      };

      if (input.name) updateData.name = input.name;
      if (input.description !== undefined)
        updateData.description = input.description;
      if (input.schema) updateData.schema = input.schema as ContentTypeSchema;

      const [updated] = await db
        .update(contentType)
        .set(updateData)
        .where(eq(contentType.id, input.id))
        .returning();

      return updated;
    }),

  /**
   * Delete a content type (protected)
   */
  delete: protectedProcedure
    .input(z.object({ id: z.string().uuid() }))
    .mutation(async ({ input }) => {
      const db = getDatabase();

      await db.delete(contentType).where(eq(contentType.id, input.id));

      return { success: true };
    }),
});
