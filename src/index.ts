import * as dotenv from 'dotenv';
import { serve } from '@hono/node-server';
import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { getUserFromAccount } from './db/user.js';
import { verifyPasswordHash } from './db/password.js';
import { createSession, generateSessionToken, invalidateAllSessions, invalidateSession } from './db/session-api.js';
// import { authenticate } from './helpers/auth.js';
import { getUserRoles } from './helpers/auth.js';

import production from './production.js';
import personnelPermission from './personnel-permission.js';
import basicInfo from './basic-info.js';
import storage from './storage.js';
import { trpcServer } from '@hono/trpc-server';
import { appRouter } from 'trpc/router.js';

const envPath = `.env.${process.env.NODE_ENV}`;
dotenv.config({ path: envPath });

const app = new Hono();
app.use('*', cors());

// Apply authentication middleware to all routes
// app.use('*', authenticate);

app.get('/', (c) => {
  return c.json({ success: true });
});

// app.post('/login', async (c) => {
//   const body = await c.req.json();

//   if (!body.account || !body.password) {
//     return c.json({ error: 'Account and password are required' }, 400);
//   }

//   const user = await getUserFromAccount(body.account);

//   if (!user) {
//     return c.json({ error: 'Invalid credentials' }, 401);
//   }

//   const passwordMatch = await verifyPasswordHash(user.passwordHash, body.password);

//   if (!passwordMatch) return c.json({ error: 'Invalid credentials' }, 401);

//   await invalidateAllSessions(user.id);

//   const sessionToken = generateSessionToken();

//   await createSession(sessionToken, user.id);

//   const roles = await getUserRoles(user.id);

//   return c.json({
//     success: true,
//     message: 'Login successful',
//     sessionToken: sessionToken,
//     user: {
//       ...user,
//       roles,
//     },
//   });
// });

// app.get('/logout', async (c) => {
//   // User and session are already attached to context by the middleware
//   const session = c.get('session');

//   await invalidateSession(session.id);

//   return c.json({
//     success: true,
//   });
// });

// app.get('/me', async (c) => {
//   // User is already attached to context by the middleware
//   const user = c.get('user');

//   // Get user roles
//   const roles = await getUserRoles(user.id);

//   return c.json({
//     success: true,
//     user: {
//       ...user,
//       roles: roles,
//     },
//   });
// });

app.route('/production', production);
app.route('/personnel-permission', personnelPermission);
app.route('/basic-info', basicInfo);
app.route('/storage', storage);

app.use(
  '/trpc/*',
  trpcServer({
    router: appRouter,
    createContext: (_opts, c) => ({ c }), // Pass Hono context to tRPC
  }),
);

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
