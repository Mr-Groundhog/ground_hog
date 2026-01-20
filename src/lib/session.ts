import { cookies } from "next/headers";
import { prisma } from "@/lib/db";
import { verifyToken } from "@/lib/token";

interface TokenPayload {
  userId?: string;
  role?: string;
  [key: string]: unknown;
}

export interface CurrentUser {
  id: string;
  username: string;
  email: string;
  role: string;
  nickname: string | null;
  avatar: string | null;
}

const AUTH_COOKIE_NAME = "admin-token";

export async function getCurrentUser(): Promise<CurrentUser | null> {
  const cookieStore = cookies();
  const token = cookieStore.get(AUTH_COOKIE_NAME)?.value;

  if (!token) {
    return null;
  }

  const decoded = verifyToken(token) as TokenPayload | null;

  if (!decoded?.userId) {
    return null;
  }

  const user = await prisma.user.findUnique({
    where: { id: decoded.userId },
    select: {
      id: true,
      username: true,
      email: true,
      role: true,
      nickname: true,
      avatar: true,
    },
  });

  if (!user) {
    return null;
  }

  return user;
}

