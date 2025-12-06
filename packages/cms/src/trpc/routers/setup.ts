import { z } from "zod";
import { eq } from "drizzle-orm";
import { createTRPCRouter, publicProcedure, protectedProcedure } from "../init";
import { getDatabase } from "../../db";
import { user } from "../../db/schema";
import { getAuth } from "../../auth";

export const setupRouter = createTRPCRouter({
  /**
   * Check if the CMS has been set up (has a superadmin)
   * This is a public endpoint so the client can show the right page
   */
  getStatus: publicProcedure.query(async () => {
    try {
      const db = getDatabase();

      // Check if any superadmin exists
      const [superadmin] = await db
        .select({ id: user.id })
        .from(user)
        .where(eq(user.role, "superadmin"))
        .limit(1);

      return {
        isSetupComplete: !!superadmin,
        hasSuperadmin: !!superadmin,
      };
    } catch (error) {
      // Database might not be configured yet
      console.error("Setup status check failed:", error);
      return {
        isSetupComplete: false,
        hasSuperadmin: false,
        error: "Database not configured",
      };
    }
  }),

  /**
   * Create the first superadmin user
   * This can only be called once - when no superadmin exists
   * Database enforces this with a partial unique index
   */
  createSuperadmin: publicProcedure
    .input(
      z.object({
        name: z.string().min(1).max(100),
        email: z.string().email(),
        password: z.string().min(8).max(100),
      })
    )
    .mutation(async ({ input }) => {
      const db = getDatabase();

      // Check if superadmin already exists
      const [existingSuperadmin] = await db
        .select({ id: user.id })
        .from(user)
        .where(eq(user.role, "superadmin"))
        .limit(1);

      if (existingSuperadmin) {
        throw new Error("Setup already complete. A superadmin already exists.");
      }

      // Use better-auth to create the user with email/password
      const auth = getAuth();

      // Sign up the user through better-auth
      const signUpResult = await auth.api.signUpEmail({
        body: {
          name: input.name,
          email: input.email,
          password: input.password,
        },
      });

      if (!signUpResult || !signUpResult.user) {
        throw new Error("Failed to create user account");
      }

      // Update the user to be a superadmin
      // The database has a partial unique index that ensures only one superadmin exists
      try {
        await db
          .update(user)
          .set({
            role: "superadmin",
            updatedAt: new Date(),
          })
          .where(eq(user.id, signUpResult.user.id));
      } catch (error) {
        // If the unique constraint fails, another superadmin was created in a race condition
        // Delete the user we just created since they can't be superadmin
        await db.delete(user).where(eq(user.id, signUpResult.user.id));
        throw new Error("Setup already complete. A superadmin already exists.");
      }

      return {
        success: true,
        message: "Superadmin created successfully",
        user: {
          id: signUpResult.user.id,
          name: signUpResult.user.name,
          email: signUpResult.user.email,
        },
      };
    }),

  /**
   * Get current user's role (protected)
   */
  getMyRole: protectedProcedure.query(async ({ ctx }) => {
    const db = getDatabase();

    const [userData] = await db
      .select({ role: user.role })
      .from(user)
      .where(eq(user.id, ctx.user.id))
      .limit(1);

    return {
      role: userData?.role ?? "editor",
      isSuperadmin: userData?.role === "superadmin",
      isAdmin: userData?.role === "admin" || userData?.role === "superadmin",
    };
  }),

  /**
   * Invite a new admin (superadmin only)
   */
  inviteAdmin: protectedProcedure
    .input(
      z.object({
        name: z.string().min(1).max(100),
        email: z.string().email(),
        password: z.string().min(8).max(100),
        role: z.enum(["admin", "editor"]),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const db = getDatabase();

      // Check if current user is superadmin
      const [currentUser] = await db
        .select({ role: user.role })
        .from(user)
        .where(eq(user.id, ctx.user.id))
        .limit(1);

      if (currentUser?.role !== "superadmin") {
        throw new Error("Only superadmins can invite new admins");
      }

      // Check if email already exists
      const [existingUser] = await db
        .select({ id: user.id })
        .from(user)
        .where(eq(user.email, input.email))
        .limit(1);

      if (existingUser) {
        throw new Error("A user with this email already exists");
      }

      // Create the user through better-auth
      const auth = getAuth();

      const signUpResult = await auth.api.signUpEmail({
        body: {
          name: input.name,
          email: input.email,
          password: input.password,
        },
      });

      if (!signUpResult || !signUpResult.user) {
        throw new Error("Failed to create user account");
      }

      // Update the user role
      await db
        .update(user)
        .set({
          role: input.role,
          updatedAt: new Date(),
        })
        .where(eq(user.id, signUpResult.user.id));

      return {
        success: true,
        user: {
          id: signUpResult.user.id,
          name: signUpResult.user.name,
          email: signUpResult.user.email,
          role: input.role,
        },
      };
    }),

  /**
   * List all admins (superadmin only)
   */
  listAdmins: protectedProcedure.query(async ({ ctx }) => {
    const db = getDatabase();

    // Check if current user is superadmin
    const [currentUser] = await db
      .select({ role: user.role })
      .from(user)
      .where(eq(user.id, ctx.user.id))
      .limit(1);

    if (currentUser?.role !== "superadmin") {
      throw new Error("Only superadmins can view admin list");
    }

    const admins = await db
      .select({
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        createdAt: user.createdAt,
      })
      .from(user)
      .orderBy(user.createdAt);

    return { admins };
  }),
});
