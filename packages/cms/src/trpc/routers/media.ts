import { z } from "zod";
import { eq, desc } from "drizzle-orm";
import { createTRPCRouter, publicProcedure, protectedProcedure } from "../init";
import { getDatabase } from "../../db";
import { media } from "../../db/schema";
import { getStorage } from "../../storage";

export const mediaRouter = createTRPCRouter({
  /**
   * List all media files (public for fetching, but could be protected)
   */
  list: publicProcedure
    .input(
      z.object({
        limit: z.number().min(1).max(100).optional().default(50),
        offset: z.number().min(0).optional().default(0),
        mimeType: z.string().optional(),
      })
    )
    .query(async ({ input }) => {
      const db = getDatabase();

      let query = db
        .select()
        .from(media)
        .orderBy(desc(media.createdAt))
        .limit(input.limit)
        .offset(input.offset);

      if (input.mimeType) {
        query = query.where(eq(media.mimeType, input.mimeType)) as typeof query;
      }

      const files = await query;

      return { files, total: files.length };
    }),

  /**
   * Get a single media file by ID (public)
   */
  getById: publicProcedure
    .input(z.object({ id: z.string().uuid() }))
    .query(async ({ input }) => {
      const db = getDatabase();

      const [file] = await db
        .select()
        .from(media)
        .where(eq(media.id, input.id))
        .limit(1);

      return file ?? null;
    }),

  /**
   * Upload a new media file (protected)
   * Note: The actual file upload happens via a separate endpoint
   * This creates the database record after successful upload
   */
  create: protectedProcedure
    .input(
      z.object({
        filename: z.string(),
        originalFilename: z.string(),
        mimeType: z.string(),
        size: z.number(),
        url: z.string().url(),
        bucketPath: z.string(),
        alt: z.string().optional(),
        caption: z.string().optional(),
        metadata: z.record(z.string(), z.unknown()).optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const db = getDatabase();

      const [newMedia] = await db
        .insert(media)
        .values({
          filename: input.filename,
          originalFilename: input.originalFilename,
          mimeType: input.mimeType,
          size: input.size,
          url: input.url,
          bucketPath: input.bucketPath,
          alt: input.alt,
          caption: input.caption,
          metadata: input.metadata,
          uploadedById: ctx.user.id,
        })
        .returning();

      return newMedia;
    }),

  /**
   * Update media metadata (protected)
   */
  update: protectedProcedure
    .input(
      z.object({
        id: z.string().uuid(),
        alt: z.string().optional(),
        caption: z.string().optional(),
        metadata: z.record(z.string(), z.unknown()).optional(),
      })
    )
    .mutation(async ({ input }) => {
      const db = getDatabase();

      const updateData: Partial<typeof media.$inferInsert> = {
        updatedAt: new Date(),
      };

      if (input.alt !== undefined) updateData.alt = input.alt;
      if (input.caption !== undefined) updateData.caption = input.caption;
      if (input.metadata) updateData.metadata = input.metadata;

      const [updated] = await db
        .update(media)
        .set(updateData)
        .where(eq(media.id, input.id))
        .returning();

      return updated;
    }),

  /**
   * Delete a media file (protected)
   */
  delete: protectedProcedure
    .input(z.object({ id: z.string().uuid() }))
    .mutation(async ({ input }) => {
      const db = getDatabase();

      // Get the media record first to get the bucket path
      const [mediaRecord] = await db
        .select()
        .from(media)
        .where(eq(media.id, input.id))
        .limit(1);

      if (!mediaRecord) {
        return { success: false, error: "Media not found" };
      }

      // Delete from storage
      try {
        const storage = getStorage();
        await storage.delete(mediaRecord.bucketPath);
      } catch (error) {
        console.error("Failed to delete file from storage:", error);
        // Continue with database deletion even if storage deletion fails
      }

      // Delete from database
      await db.delete(media).where(eq(media.id, input.id));

      return { success: true };
    }),

  /**
   * Get a signed URL for a media file (protected)
   */
  getSignedUrl: protectedProcedure
    .input(
      z.object({
        id: z.string().uuid(),
        expiresIn: z.number().optional().default(3600),
      })
    )
    .query(async ({ input }) => {
      const db = getDatabase();

      const [mediaRecord] = await db
        .select()
        .from(media)
        .where(eq(media.id, input.id))
        .limit(1);

      if (!mediaRecord) {
        return null;
      }

      const storage = getStorage();
      const signedUrl = await storage.getSignedUrl(
        mediaRecord.bucketPath,
        input.expiresIn
      );

      return { url: signedUrl };
    }),
});
