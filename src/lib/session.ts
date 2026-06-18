import { getLogtoContext } from '@logto/next/server-actions';
import { logtoConfig } from '@/lib/logto';
import { prisma } from '@/lib/db';

export interface CurrentUser {
  id: string;
  username: string;
  email: string;
  role: string;
  nickname: string | null;
  avatar: string | null;
}

export async function getCurrentUser(): Promise<CurrentUser | null> {
  const context = await getLogtoContext(logtoConfig);

  if (!context.isAuthenticated || !context.claims?.sub) {
    return null;
  }

  const account = await prisma.account.findFirst({
    where: { provider: 'logto', providerAccountId: context.claims.sub },
    include: {
      user: {
        select: {
          id: true,
          username: true,
          email: true,
          role: true,
          nickname: true,
          avatar: true,
        },
      },
    },
  });

  return account?.user ?? null;
}
