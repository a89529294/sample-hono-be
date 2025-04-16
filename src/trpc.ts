// import { initTRPC } from '@trpc/server';
// import { z } from 'zod';

// import type { Context } from 'hono';
// import { TRPCError } from '@trpc/server';
// import { getUserFromAccount } from './db/user.js';
// import { verifyPasswordHash } from './db/password.js';
// import {
//   createSession,
//   generateSessionToken,
//   getCurrentSession,
//   invalidateAllSessions,
//   invalidateSession,
// } from './db/session-api.js';
// import { getUserRoles, isAdmin } from './helpers/auth.js';

// const t = initTRPC.context<{ c: Context }>().create();

// const authMiddleware = t.middleware(async ({ ctx, next }) => {
//   const { c } = ctx;
//   const authHeader = c.req.header().authorization;
//   const sessionToken = authHeader?.split(' ')[1];

//   if (!sessionToken) {
//     throw new TRPCError({ code: 'UNAUTHORIZED' });
//   }

//   const { session, user } = await getCurrentSession(sessionToken);

//   if (!session || !user) {
//     throw new TRPCError({ code: 'UNAUTHORIZED' });
//   }

//   const isUserAdmin = await isAdmin(user.id);

//   c.set('user', {
//     ...user,
//     isAdmin: isUserAdmin,
//   });
//   c.set('session', session);

//   return next({ ctx });
// });

// export const publicProcedure = t.procedure;
// export const protectedProcedure = t.procedure.use(authMiddleware);

// export const appRouter = t.router({
//   login: publicProcedure
//     .input(
//       z.object({
//         account: z.string().min(1, { message: 'Account is required' }),
//         password: z.string().min(1, { message: 'Password is required' }),
//       }),
//     )
//     .mutation(async ({ input, ctx }) => {
//       // const {c} = ctx

//       const user = await getUserFromAccount(input.account);

//       // if user doesnt exist or user doesnt have a password
//       // i.e. not an app user, block
//       if (!user || !user.passwordHash) {
//         throw new TRPCError({
//           code: 'UNAUTHORIZED',
//           message: 'Invalid credentials',
//         });
//       }

//       const passwordMatch = await verifyPasswordHash(user.passwordHash, input.password);

//       if (!passwordMatch) {
//         throw new TRPCError({
//           code: 'UNAUTHORIZED',
//           message: 'Invalid credentials',
//         });
//       }

//       await invalidateAllSessions(user.id);

//       const sessionToken = generateSessionToken();

//       await createSession(sessionToken, user.id);

//       const roles = await getUserRoles(user.id);

//       const isAdminUser = await isAdmin(user.id);

//       return {
//         success: true,
//         message: 'Login successful',
//         sessionToken: sessionToken,
//         user: {
//           account: user.account,
//           id: user.id,
//           name: user.name,
//           isAdmin: isAdminUser,
//           roles: roles,
//         },
//       };
//     }),
//   logout: protectedProcedure.mutation(async ({ ctx }) => {
//     const session = ctx.c.get('session');

//     await invalidateSession(session.id);

//     return {
//       success: 'from trpc logout',
//     };
//   }),
//   me: protectedProcedure.mutation(async ({ ctx }) => {
//     const user = ctx.c.get('user');
//     const roles = await getUserRoles(user.id);
//     const isAdminUser = await isAdmin(user.id);

//     return {
//       account: user.account,
//       id: user.id,
//       name: user.name,
//       isAdmin: isAdminUser,
//       roles: roles,
//     };
//   }),
// });

// type AppRouter = typeof appRouter;

// export type TrpcTypes = {
//   Router: AppRouter;
//   User: AppRouter['login']['_def']['$types']['output']['user'];
// };
