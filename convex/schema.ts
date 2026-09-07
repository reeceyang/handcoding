import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";
import { authTables } from "@convex-dev/auth/server";

// The schema is normally optional, but Convex Auth
// requires indexes defined on `authTables`.
// The schema provides more precise TypeScript types.
export default defineSchema({
  ...authTables,
  numbers: defineTable({
    value: v.number(),
  }),
  guests: defineTable({
    name: v.string(),
    pronouns: v.optional(v.string()),
    dietaryPrefs: v.optional(v.string()),
    userId: v.id("users"),
    rsvp: v.union(
      v.literal("going"),
      v.literal("maybe"),
      v.literal("not going"),
    ),
  }).index("by_userId", ["userId"]),
  memories: defineTable({
    guestId: v.optional(v.id("guests")),
    memory: v.string(),
  }).index("by_guestId", ["guestId"]),
  learnings: defineTable({
    guestId: v.optional(v.id("guests")),
    learning: v.string(),
  }).index("by_guestId", ["guestId"]),
});
