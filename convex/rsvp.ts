import { getAuthUserId } from "@convex-dev/auth/server";
import { mutation, query } from "./_generated/server";
import { ConvexError, Infer, v } from "convex/values";
import { Id } from "./_generated/dataModel";
import schema from "./schema";

export const getRsvp = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      return null;
    }
    const guest = await ctx.db
      .query("guests")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .unique();
    if (!guest) {
      return null;
    }
    const learning = await ctx.db
      .query("learnings")
      .withIndex("by_guestId", (q) => q.eq("guestId", guest._id))
      .unique();
    const memory = await ctx.db
      .query("memories")
      .withIndex("by_guestId", (q) => q.eq("guestId", guest._id))
      .unique();
    const { name, pronouns, dietaryPrefs, rsvp } = guest;
    return {
      name,
      pronouns,
      dietaryPrefs,
      rsvp,
      learning: learning?.learning ?? "",
      memory: memory?.memory ?? "",
    };
  },
});

const rsvpValidator = v.object({
  name: v.string(),
  rsvp: schema.doc("guests").fields.rsvp,
  pronouns: v.optional(v.string()),
  dietaryPrefs: v.optional(v.string()),
  learning: v.optional(v.string()),
  memory: v.optional(v.string()),
});

export type Rsvp = Infer<typeof rsvpValidator>;

export const upsertRsvp = mutation({
  args: rsvpValidator,
  handler: async (
    ctx,
    { name, pronouns, dietaryPrefs, learning, memory, rsvp },
  ) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new ConvexError({ msg: "not signed in" });
    }
    if (!name.trim()) {
      throw new ConvexError({ msg: "missing name" });
    }
    const guest = await ctx.db
      .query("guests")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .unique();
    const guestInfo = { name, pronouns, dietaryPrefs, userId, rsvp };
    let guestId: Id<"guests">;
    if (!guest) {
      guestId = await ctx.db.insert("guests", guestInfo);
    } else {
      await ctx.db.replace("guests", guest._id, guestInfo);
      guestId = guest._id;
    }
    const existingLearning = await ctx.db
      .query("learnings")
      .withIndex("by_guestId", (q) => q.eq("guestId", guestId))
      .unique();
    if (!existingLearning) {
      if (learning) {
        await ctx.db.insert("learnings", { guestId, learning });
      }
    } else {
      if (learning) {
        await ctx.db.replace("learnings", existingLearning._id, {
          guestId,
          learning,
        });
      } else {
        await ctx.db.delete("learnings", existingLearning._id);
      }
    }
    const existingMemory = await ctx.db
      .query("memories")
      .withIndex("by_guestId", (q) => q.eq("guestId", guestId))
      .unique();
    if (!existingMemory) {
      if (memory) {
        await ctx.db.insert("memories", { guestId, memory });
      }
    } else {
      if (memory) {
        await ctx.db.replace("memories", existingMemory._id, {
          guestId,
          memory,
        });
      } else {
        await ctx.db.delete("memories", existingMemory._id);
      }
    }
  },
});

export const getGuests = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      return null;
    }
    return (await ctx.db.query("guests").collect()).map((doc) => ({
      name: doc.name,
      pronouns: doc.pronouns,
      rsvp: doc.rsvp,
    }));
  },
});
