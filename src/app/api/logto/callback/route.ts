import { NextResponse } from 'next/server';
import { handleSignIn, getLogtoContext } from '@logto/next/server-actions';
import { logtoConfig } from '@/lib/logto';
import { prisma } from '@/lib/db';

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const { origin } = requestUrl;

  await handleSignIn(logtoConfig, requestUrl);

  const context = await getLogtoContext(logtoConfig);

  if (!context.isAuthenticated || !context.claims) {
    return NextResponse.redirect(`${origin}/`);
  }

 
  const { sub, username, email, name, picture } = context.claims;

  let account = await prisma.account.findFirst({
    where: { provider: 'logto', providerAccountId: sub },
    include: { user: true },
  });

  if (!account) {
    const baseUsername = username || email?.split('@')[0] || `user_${sub.slice(0, 8)}`;
    let uniqueUsername = baseUsername;
    let counter = 1;
    while (await prisma.user.findUnique({ where: { username: uniqueUsername } })) {
      uniqueUsername = `${baseUsername}_${counter++}`;
    }

    const user = await prisma.user.create({
      data: {
        username: uniqueUsername,
        email: email || `${sub}@logto.local`,
        nickname: name || uniqueUsername,
        avatar: picture || null,
        role: 'USER',
        emailVerified: email ? new Date() : null,
        lastLoginAt: new Date(),
      },
    });

    await prisma.account.create({
      data: {
        userId: user.id,
        type: 'oidc',
        provider: 'logto',
        providerAccountId: sub,
      },
    });
  } else {
    await prisma.user.update({
      where: { id: account.user.id },
      data: {
        lastLoginAt: new Date(),
        ...(picture && !account.user.avatar ? { avatar: picture } : {}),
      },
    });
  }

  return NextResponse.redirect(`${origin}/`);
}
