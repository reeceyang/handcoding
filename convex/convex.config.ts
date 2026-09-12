import { defineApp } from "convex/server";
import { v } from "convex/values";

const app = defineApp({ env: { AUTH_RESEND_KEY: v.string() } });
export default app;
