import { prisma } from "@/lib/db";
import { hashPassword } from "@/lib/auth";
import { signToken } from "@/lib/token";
import { Result, HttpCode, RequestHelper } from "@/lib/http";
import { z } from "zod";

const emailLoginSchema = z.object({
  email: z.string().email("请输入正确的邮箱地址"),
  code: z.string().min(6, "验证码至少 6 位").max(6, "验证码最多 6 位"),
});

// 生成随机密码 (8位)
function generateRandomPassword(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789";
  let password = "";
  for (let i = 0; i < 8; i++) {
    password += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return password;
}

// 生成唯一用户名 (邮箱前缀 + 随机后缀)
async function generateUniqueUsername(email: string): Promise<string> {
  const prefix = email.split("@")[0];
  let username = prefix;
  let suffix = 0;

  while (true) {
    const existing = await prisma.user.findFirst({
      where: {
        username: username,
        isDelete: 0,
      },
    });

    if (!existing) break;
    suffix = Math.floor(Math.random() * 999);
    username = `${prefix}${suffix}`;
  }

  return username;
}

export async function POST(req: Request) {
  try {
    const { data: body, error: parseError } = await RequestHelper.safeParse<Record<string, unknown>>(req);

    if (parseError || !body) {
      return Result.error(HttpCode.BAD_REQUEST, parseError || "无效的请求");
    }

    const validation = emailLoginSchema.safeParse(body);
    if (!validation.success) {
      return Result.error(HttpCode.BAD_REQUEST, validation.error.errors[0].message);
    }

    const { email, code } = validation.data;

    // 查找有效的验证码
    const verificationCode = await prisma.verificationCode.findFirst({
      where: {
        email,
        code,
        used: false,
        expiresAt: {
          gt: new Date(),
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    if (!verificationCode) {
      return Result.error(HttpCode.BAD_REQUEST, "验证码错误或已过期");
    }

    // 标记验证码已使用
    await prisma.verificationCode.update({
      where: { id: verificationCode.id },
      data: { used: true },
    });

    // 查找用户
    let user = await prisma.user.findFirst({
      where: {
        email,
        isDelete: 0,
      },
    });

    let isNewUser = false;
    let tempPassword: string | null = null;

    // 用户不存在，创建新用户
    if (!user) {
      const password = generateRandomPassword();
      const hashedPassword = await hashPassword(password);
      const username = await generateUniqueUsername(email);

      user = await prisma.user.create({
        data: {
          username,
          email,
          password: hashedPassword,
          emailVerified: new Date(),
        },
      });

      isNewUser = true;
      tempPassword = password;
    }

    // 检查用户是否被禁用
    if (!user.isActive) {
      return Result.error(HttpCode.FORBIDDEN, "账号已被禁用，请联系管理员");
    }

    // 更新最后登录时间
    await prisma.user.update({
      where: { id: user.id },
      data: {
        lastLoginAt: new Date(),
      },
    });

    // 生成 token
    const token = signToken({ userId: user.id, role: user.role });

    // 返回用户信息和临时密码（如果是新用户）
    return Result.success(
      {
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
          role: user.role,
        },
        token,
        isNewUser,
        tempPassword: isNewUser ? tempPassword : null,
      },
      "登录成功"
    );

  } catch (error) {
    console.error("Email login error:", error);
    return Result.error(HttpCode.INTERNAL_SERVER_ERROR, "登录异常，请稍后重试");
  }
}