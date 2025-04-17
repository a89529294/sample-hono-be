import { serve } from '@hono/node-server';
import * as dotenv from 'dotenv';
import { Hono } from 'hono';
import { cors } from 'hono/cors';
// import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';

import { trpcServer } from '@hono/trpc-server';
import appRoutes from './app';
import { appRouter } from 'trpc/router';

const envPath = `.env.${process.env.NODE_ENV}`;
dotenv.config({ path: envPath });

const app = new Hono();
app.use('*', cors());

app.get('/', (c) => {
  return c.json({ success: true });
});

// Mount /app routes
app.route('/app', appRoutes);

// Mount tRPC
app.use('/trpc/*', trpcServer({ router: appRouter, createContext: (_opts, c) => ({ c }) }));

// const s3Client = new S3Client({
//   region: "ap-northeast-2",
//   credentials: {
//     accessKeyId: process.env.AWS_ACCESS_KEY!, // From IAM
//     secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!, // From IAM
//   },
// });

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
  },
);
