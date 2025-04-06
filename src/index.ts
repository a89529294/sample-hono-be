import * as dotenv from "dotenv";
import { serve } from "@hono/node-server";
import { Hono } from "hono";
import { cors } from "hono/cors";
import { db } from "./db/index.js";
import { usersTable } from "./db/schema.js";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { getUserFromUsername } from "./db/user.js";
import { verifyPasswordHash } from "./db/password.js";
import {
  createSession,
  generateSessionToken,
  getCurrentSession,
  invalidateAllSessions,
  invalidateSession,
} from "./db/session-api.js";

const envPath = `.env.${process.env.NODE_ENV}`;
dotenv.config({ path: envPath });

const app = new Hono();
app.use("*", cors());

const s3Client = new S3Client({
  region: "ap-northeast-2",
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY!, // From IAM
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!, // From IAM
  },
});

app.get("/", (c) => {
  return c.json({ success: true });
});

app.get("/users", async (c) => {
  const users = await db.select().from(usersTable);

  return c.json({ users });
});

app.post("/login", async (c) => {
  const body = await c.req.json();

  if (!body.username || !body.password) {
    return c.json({ error: "Username and password are required" }, 400);
  }

  const user = await getUserFromUsername(body.username);

  if (!user) {
    return c.json({ error: "Invalid credentials" }, 401);
  }

  const passwordMatch = await verifyPasswordHash(
    user.passwordHash,
    body.password
  );

  if (!passwordMatch) return c.json({ error: "Invalid credentials" }, 401);

  await invalidateAllSessions(user.id);

  const sessionToken = generateSessionToken();

  await createSession(sessionToken, user.id);

  return c.json({
    success: true,
    message: "Login successful",
    token: sessionToken,
    userId: user.id,
    username: user.username,
  });
});

app.get("/logout", async (c) => {
  const headerRecord = c.req.header();
  const sessionToken = headerRecord.authorization?.split(" ")[1];

  if (!sessionToken)
    return c.json(
      {
        error: "Missing Authorization: Bearer <session_id>",
      },
      400
    );

  const { session } = await getCurrentSession(sessionToken);

  if (!session) return c.json({ error: "No active session" }, 400);

  await invalidateSession(session.id);

  return c.json({
    succes: true,
  });
});

// app.post("/upload", async (c) => {
//   const body = await c.req.parseBody();
//   const file = body["file"];

//   if (!file || !(file instanceof File)) {
//     return c.json({ error: "No file uploaded" }, 400);
//   }

//   const fileName = `${Date.now()}-${file.name}`;
//   const arrayBuffer = await file.arrayBuffer();

//   // S3 upload parameters
//   const params = {
//     Bucket: "sample-hono-be-bucket", // Your bucket name
//     Key: fileName,
//     Body: Buffer.from(arrayBuffer),
//     ContentType: file.type,
//   };

//   try {
//     await s3Client.send(new PutObjectCommand(params));
//     return c.json(
//       { message: "File uploaded successfully", key: fileName },
//       200
//     );
//   } catch (error) {
//     console.error(error);
//     return c.json({ error: "Upload failed" }, 500);
//   }
// });

serve(
  {
    fetch: app.fetch,
    port: 3000,
  },
  (info) => {
    console.log(`Server is running on http://localhost:${info.port}`);
  }
);
