import { query } from "./_generated/server";

export const getNostalgia = query({
  args: {},
  handler: async (ctx) =>
    (await ctx.db.query("memories").collect()).map((doc) => doc.memory),
});

export const getLearnings = query({
  args: {},
  handler: async (ctx) =>
    (await ctx.db.query("learnings").collect()).map((doc) => doc.learning),
});
