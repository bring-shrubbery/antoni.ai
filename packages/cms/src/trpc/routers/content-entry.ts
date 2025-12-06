import { z } from "zod";
import { eq, desc, and } from "drizzle-orm";
import { createTRPCRouter, publicProcedure, protectedProcedure } from "../init";
import { getDatabase } from "../../db";
import { contentEntry, contentType } from "../../db/schema";

export const contentEntryRouter = createTRPCRouter({
  /**
   * Get all entries for a content type (public - for fetching content)
   */
  list: publicProcedure
    .input(
      z.object({
        contentTypeSlug: z.string(),
        status: z.enum(["draft", "published", "archived"]).optional(),
        limit: z.number().min(1).max(100).optional().default(50),
        offset: z.number().min(0).optional().default(0),
      })
    )
    .query(async ({ input }) => {
      const db = getDatabase();

      // Get content type by slug
      const [type] = await db
        .select()
        .from(contentType)
        .where(eq(contentType.slug, input.contentTypeSlug))
        .limit(1);

      if (!type) {
        return { entries: [], total: 0 };
      }

      const conditions = [eq(contentEntry.contentTypeId, type.id)];

      if (input.status) {
        conditions.push(eq(contentEntry.status, input.status));
      }

      const entries = await db
        .select()
        .from(contentEntry)
        .where(and(...conditions))
        .orderBy(desc(contentEntry.createdAt))
        .limit(input.limit)
        .offset(input.offset);

      return { entries, total: entries.length };
    }),

  /**
   * Get a single entry by ID (public)
   */
  getById: publicProcedure
    .input(z.object({ id: z.string().uuid() }))
    .query(async ({ input }) => {
      const db = getDatabase();

      const [entry] = await db
        .select()
        .from(contentEntry)
        .where(eq(contentEntry.id, input.id))
        .limit(1);

      return entry ?? null;
    }),

  /**
   * Create a new content entry (protected)
   */
  create: protectedProcedure
    .input(
      z.object({
        contentTypeId: z.string().uuid(),
        data: z.record(z.unknown()),
        status: z
          .enum(["draft", "published", "archived"])
          .optional()
          .default("draft"),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const db = getDatabase();

      const [newEntry] = await db
        .insert(contentEntry)
        .values({
          contentTypeId: input.contentTypeId,
          data: input.data,
          status: input.status,
          publishedAt: input.status === "published" ? new Date() : null,
          createdById: ctx.user.id,
          updatedById: ctx.user.id,
        })
        .returning();

      return newEntry;
    }),

  /**
   * Update a content entry (protected)
   */
  update: protectedProcedure
    .input(
      z.object({
        id: z.string().uuid(),
        data: z.record(z.unknown()).optional(),
        status: z.enum(["draft", "published", "archived"]).optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const db = getDatabase();

      const updateData: Partial<typeof contentEntry.$inferInsert> = {
        updatedAt: new Date(),
        updatedById: ctx.user.id,
      };

      if (input.data) updateData.data = input.data;
      if (input.status) {
        updateData.status = input.status;
        if (input.status === "published") {
          updateData.publishedAt = new Date();
        }
      }

      const [updated] = await db
        .update(contentEntry)
        .set(updateData)
        .where(eq(contentEntry.id, input.id))
        .returning();

      return updated;
    }),

  /**
   * Delete a content entry (protected)
   */
  delete: protectedProcedure
    .input(z.object({ id: z.string().uuid() }))
    .mutation(async ({ input }) => {
      const db = getDatabase();

      await db.delete(contentEntry).where(eq(contentEntry.id, input.id));

      return { success: true };
    }),

  /**
   * Publish an entry (protected)
   */
  publish: protectedProcedure
    .input(z.object({ id: z.string().uuid() }))
    .mutation(async ({ input, ctx }) => {
      const db = getDatabase();

      const [updated] = await db
        .update(contentEntry)
        .set({
          status: "published",
          publishedAt: new Date(),
          updatedAt: new Date(),
          updatedById: ctx.user.id,
        })
        .where(eq(contentEntry.id, input.id))
        .returning();

      return updated;
    }),

  /**
   * Unpublish an entry (protected)
   */
  unpublish: protectedProcedure
    .input(z.object({ id: z.string().uuid() }))
    .mutation(async ({ input, ctx }) => {
      const db = getDatabase();

      const [updated] = await db
        .update(contentEntry)
        .set({
          status: "draft",
          updatedAt: new Date(),
          updatedById: ctx.user.id,
        })
        .where(eq(contentEntry.id, input.id))
        .returning();

      return updated;
    }),
});
