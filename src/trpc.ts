import { initTRPC } from '@trpc/server';
import { z } from 'zod';

import type { Context } from 'hono';
import { TRPCError } from '@trpc/server';
import { getUserFromAccount } from './db/user.js';
import { verifyPasswordHash } from './db/password.js';
import { createSession, generateSessionToken, invalidateAllSessions } from './db/session-api.js';
import { getUserRoles } from './helpers/auth.js';

const t = initTRPC.context<{ c: Context }>().create();

export const appRouter = t.router({
  login: t.procedure
    .input(
      z.object({
        account: z.string().min(1, { message: 'Account is required' }),
        password: z.string().min(1, { message: 'Password is required' }),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      // const {c} = ctx

      const user = await getUserFromAccount(input.account);

      // if user doesnt exist or user doesnt have a password
      // i.e. not an app user, block
      if (!user || !user.passwordHash) {
        throw new TRPCError({
          code: 'UNAUTHORIZED',
          message: 'Invalid credentials',
        });
      }

      const passwordMatch = await verifyPasswordHash(user.passwordHash, input.password);

      if (!passwordMatch) {
        throw new TRPCError({
          code: 'UNAUTHORIZED',
          message: 'Invalid credentials',
        });
      }

      await invalidateAllSessions(user.id);

      const sessionToken = generateSessionToken();

      await createSession(sessionToken, user.id);

      const roles = await getUserRoles(user.id);

      return {
        success: true,
        message: 'Login successful',
        sessionToken: sessionToken,
        user: {
          account: user.account,
          id: user.id,
          name: user.name,
          roles: roles,
        },
      };
    }),
});

type AppRouter = typeof appRouter;

export declare namespace TrpcTypes {
  export type Router = AppRouter;
  export type User = AppRouter['login']['_def']['$types']['output']['user'];
}
