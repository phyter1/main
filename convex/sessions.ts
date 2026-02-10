/**
 * Convex Session Management Functions
 * Provides persistent session storage for admin authentication
 */

import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

/**
 * Store a new session token
 */
export const storeSession = mutation({
  args: {
    token: v.string(),
    expiresAt: v.number(),
  },
  handler: async (ctx, { token, expiresAt }) => {
    await ctx.db.insert("sessions", { token, expiresAt });
  },
});

/**
 * Verify a session token exists and is not expired
 */
export const verifySession = query({
  args: {
    token: v.string(),
  },
  handler: async (ctx, { token }) => {
    const session = await ctx.db
      .query("sessions")
      .withIndex("by_token", (q) => q.eq("token", token))
      .first();

    if (!session) {
      return { valid: false };
    }

    // Check if expired (deletion happens in cleanup mutation)
    if (session.expiresAt < Date.now()) {
      return { valid: false };
    }

    return { valid: true };
  },
});

/**
 * Invalidate a session token (logout)
 */
export const invalidateSession = mutation({
  args: {
    token: v.string(),
  },
  handler: async (ctx, { token }) => {
    const session = await ctx.db
      .query("sessions")
      .withIndex("by_token", (q) => q.eq("token", token))
      .first();

    if (session) {
      await ctx.db.delete(session._id);
    }
  },
});

/**
 * Clean up expired sessions
 */
export const cleanupExpiredSessions = mutation({
  args: {},
  handler: async (ctx) => {
    const now = Date.now();
    const allSessions = await ctx.db.query("sessions").collect();

    for (const session of allSessions) {
      if (session.expiresAt < now) {
        await ctx.db.delete(session._id);
      }
    }
  },
});
