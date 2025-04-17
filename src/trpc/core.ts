import { initTRPC } from '@trpc/server';
import { TRPCError } from '@trpc/server';
import type { Context } from 'hono';
import { getCurrentSession } from 'db/session-api';
import { isAdmin } from 'helpers/auth';

const ARTIFICIAL_DELAY_MS = process.env.NODE_ENV === 'dev' ? 1000 : 0;

const delay = () => new Promise((res) => setTimeout(res, ARTIFICIAL_DELAY_MS));

export const t = initTRPC.context<{ c: Context }>().create();

export const delayMiddleware = t.middleware(async ({ ctx, next }) => {
  await delay();
  return next({ ctx });
});

export const authMiddleware = t.middleware(async ({ ctx, next }) => {
  const { c } = ctx;
  const authHeader = c.req.header().authorization;
  const sessionToken = authHeader?.split(' ')[1];

  if (!sessionToken) {
    throw new TRPCError({ code: 'UNAUTHORIZED' });
  }

  const { session, user } = await getCurrentSession(sessionToken);

  if (!session || !user) {
    throw new TRPCError({ code: 'UNAUTHORIZED' });
  }

  const isUserAdmin = await isAdmin(user.id);

  c.set('user', {
    ...user,
    isAdmin: isUserAdmin,
  });
  c.set('session', session);

  return next({ ctx });
});

export const publicProcedure = t.procedure.use(delayMiddleware);
export const protectedProcedure = t.procedure.use(delayMiddleware).use(authMiddleware);
