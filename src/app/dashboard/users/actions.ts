"use server";

import { revalidatePath, revalidateTag, unstable_cache } from "next/cache";
import { prisma } from "@/lib/db";
import { userSchema, type UserFormValues } from "./schema";

const USERS_TAG = "dashboard-users";

const getCachedUsers = unstable_cache(
  async (page: number, pageSize: number, query: string) => {
    const skip = (page - 1) * pageSize;
    const where = {
      isDelete: 0,
      OR: query
        ? [
            { username: { contains: query } },
            { email: { contains: query } },
            { nickname: { contains: query } },
          ]
        : undefined,
    };

    const [data, total] = await Promise.all([
      prisma.user.findMany({
        where,
        skip,
        take: pageSize,
        orderBy: { createdAt: "desc" },
        select: {
          id: true,
          username: true,
          email: true,
          nickname: true,
          role: true,
          isActive: true,
          createdAt: true,
          avatar: true,
          bio: true,
        },
      }),
      prisma.user.count({ where }),
    ]);

    return {
      data,
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize),
    };
  },
  [USERS_TAG],
  {
    revalidate: 300,
    tags: [USERS_TAG],
  }
);

export async function getUsers(page = 1, pageSize = 10, query = "") {
  return getCachedUsers(page, pageSize, query);
}

export async function createUser(data: UserFormValues) {
  const validated = userSchema.parse(data);

  const exist = await prisma.user.findFirst({
    where: {
      OR: [{ username: validated.username }, { email: validated.email }],
      isDelete: 0,
    },
  });

  if (exist) {
    throw new Error("Username or email already exists");
  }

  await prisma.user.create({
    data: {
      username: validated.username,
      email: validated.email,
      nickname: validated.nickname,
      role: validated.role,
      isActive: validated.isActive,
      bio: validated.bio,
    },
  });

  revalidateTag(USERS_TAG);
  revalidatePath("/dashboard/users");
  return { success: true };
}

export async function updateUser(id: string, data: UserFormValues) {
  const validated = userSchema.parse(data);

  const exist = await prisma.user.findFirst({
    where: {
      OR: [{ username: validated.username }, { email: validated.email }],
      NOT: { id },
      isDelete: 0,
    },
  });

  if (exist) {
    throw new Error("Username or email already exists");
  }

  await prisma.user.update({
    where: { id },
    data: {
      username: validated.username,
      email: validated.email,
      nickname: validated.nickname,
      role: validated.role,
      isActive: validated.isActive,
      bio: validated.bio,
    },
  });

  revalidateTag(USERS_TAG);
  revalidatePath("/dashboard/users");
  return { success: true };
}

export async function deleteUser(id: string) {
  await prisma.user.update({
    where: { id },
    data: {
      isDelete: 2,
      deletedAt: new Date(),
    },
  });

  revalidateTag(USERS_TAG);
  revalidatePath("/dashboard/users");
  return { success: true };
}

export async function toggleUserStatus(id: string, isActive: boolean) {
  await prisma.user.update({
    where: { id },
    data: { isActive },
  });

  revalidateTag(USERS_TAG);
  revalidatePath("/dashboard/users");
  return { success: true };
}
