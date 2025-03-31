import { serve } from "@hono/node-server";
import { Hono } from "hono";
import { cors } from "hono/cors";
import { db } from "./db/index.js";
import { usersTable } from "./db/schema.js";
const app = new Hono();
app.use("*", cors());
app.get("/", (c) => {
    return c.json({ success: true });
});
app.get("/users", async (c) => {
    const users = await db.select().from(usersTable);
    return c.json({ users });
});
serve({
    fetch: app.fetch,
    port: 3000,
}, (info) => {
    console.log(`Server is running on http://localhost:${info.port}`);
});
