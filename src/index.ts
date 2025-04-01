import "dotenv/config";
import { serve } from "@hono/node-server";
import { Hono } from "hono";
import { cors } from "hono/cors";
import { db } from "./db/index.js";
import { usersTable } from "./db/schema.js";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";

const app = new Hono();
app.use("*", cors());

const s3Client = new S3Client({
  region: "ap-northeast-2", // Replace with your bucket's region
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

app.post("/upload", async (c) => {
  const body = await c.req.parseBody();
  const file = body["file"];

  if (!file || !(file instanceof File)) {
    return c.json({ error: "No file uploaded" }, 400);
  }

  const fileName = `${Date.now()}-${file.name}`;
  const arrayBuffer = await file.arrayBuffer();

  // S3 upload parameters
  const params = {
    Bucket: "sample-hono-be-bucket", // Your bucket name
    Key: fileName,
    Body: Buffer.from(arrayBuffer),
    ContentType: file.type,
  };

  try {
    await s3Client.send(new PutObjectCommand(params));
    return c.json(
      { message: "File uploaded successfully", key: fileName },
      200
    );
  } catch (error) {
    console.error(error);
    return c.json({ error: "Upload failed" }, 500);
  }
});

serve(
  {
    fetch: app.fetch,
    port: 3000,
  },
  (info) => {
    console.log(`Server is running on http://localhost:${info.port}`);
  }
);
