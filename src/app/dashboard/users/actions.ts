"use server";

import { prisma } from "@/lib/db";
import { userSchema, UserFormValues } from "./schema";
import argon2 from "argon2";
import { revalidatePath } from "next/cache";

export async function getUsers(page = 1, pageSize = 10, query = "") {
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
}

export async function createUser(data: UserFormValues) {
  const validated = userSchema.parse(data);
  
  // 检查用户名或邮箱是否存在
  const exist = await prisma.user.findFirst({
    where: {
      OR: [{ username: validated.username }, { email: validated.email }],
      isDelete: 0,
    },
  });

  if (exist) {
    throw new Error("用户名或邮箱已存在");
  }

  const hashedPassword = validated.password 
    ? await argon2.hash(validated.password) 
    : await argon2.hash("123456"); // 默认密码

  await prisma.user.create({
    data: {
      username: validated.username,
      email: validated.email,
      password: hashedPassword,
      nickname: validated.nickname,
      role: validated.role,
      isActive: validated.isActive,
      bio: validated.bio,
    },
  });

  revalidatePath("/dashboard/users");
  return { success: true };
}

export async function updateUser(id: string, data: UserFormValues) {
  const validated = userSchema.parse(data);

  // 检查是否存在冲突 (排除自己)
  const exist = await prisma.user.findFirst({
    where: {
      OR: [{ username: validated.username }, { email: validated.email }],
      NOT: { id },
      isDelete: 0,
    },
  });

  if (exist) {
    throw new Error("用户名或邮箱已存在");
  }

  const updateData = {
    username: validated.username,
    email: validated.email,
    nickname: validated.nickname,
    role: validated.role,
    isActive: validated.isActive,
    bio: validated.bio,
  };

  if (validated.password) {
    updateData.password = await argon2.hash(validated.password);
  }

  await prisma.user.update({
    where: { id },
    data: updateData,
  });

  revalidatePath("/dashboard/users");
  return { success: true };
}

export async function deleteUser(id: string) {
  // 软删除
  await prisma.user.update({
    where: { id },
    data: { 
      isDelete: 2, // 2: 被删除
      deletedAt: new Date()
    }, 
  });

  revalidatePath("/dashboard/users");
  return { success: true };
}

export async function toggleUserStatus(id: string, isActive: boolean) {
  await prisma.user.update({
    where: { id },
    data: { isActive },
  });

  revalidatePath("/dashboard/users");
  return { success: true };
}
