import { cache } from 'react';
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

// 用 React cache() 做请求级去重：同一次请求里 layout / page / actions
// 多次调用 getCurrentUser 只会触发一次 Logto 校验 + 一次数据库查询。
export const getCurrentUser = cache(async (): Promise<CurrentUser | null> => {
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
});
