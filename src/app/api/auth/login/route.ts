import { prisma } from "@/lib/db";
import { verifyPassword } from "@/lib/auth";
import { signToken } from "@/lib/token";
import { Result, HttpCode, RequestHelper } from "@/lib/http";
import { z } from "zod";

const loginSchema = z.object({
  username: z.string().min(1, "用户名或邮箱不能为空"),
  password: z.string().min(6, "密码长度不能少于6位"),
});

export async function POST(req: Request) {
  try {
    const { data: body, error: parseError } = await RequestHelper.safeParse<Record<string, unknown>>(req);

    if (parseError || !body) {
      return Result.error(HttpCode.BAD_REQUEST, parseError || "无效的登录请求");
    }

    const validation = loginSchema.safeParse(body);
    
    if (!validation.success) {
      return Result.error(HttpCode.BAD_REQUEST, validation.error.errors[0].message);
    }
    
    const { username, password } = validation.data;
    const isAdminLogin = body.adminLogin === true;

    const user = await prisma.user.findFirst({
      where: {
        OR: [{ username: username }, { email: username }],
        isDelete: 0,
      },
    });

    if (!user || !user.password) {
      return Result.error(HttpCode.UNAUTHORIZED, "无效的用户名或密码");
    }

    if (!user.isActive) {
      return Result.error(HttpCode.FORBIDDEN, "账号已被禁用，请联系管理员");
    }

    const isValid = await verifyPassword(user.password, password);

    if (!isValid) {
      return Result.error(HttpCode.UNAUTHORIZED, "无效的用户名或密码");
    }

    if (isAdminLogin && user.role !== "ADMIN") {
      return Result.error(HttpCode.FORBIDDEN, "当前账号为普通用户，没有权限进入后台管理系统");
    }

    // Update last login info
    await prisma.user.update({
      where: { id: user.id },
      data: {
        lastLoginAt: new Date(),
        // lastLoginIp: req.headers.get("x-forwarded-for") || "unknown", // Optional
      },
    });

    const token = signToken({ userId: user.id, role: user.role });

    return Result.success(
      {
        token,
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
          role: user.role,
        },
      },
      "登录成功"
    );

  } catch (error) {
    console.error("Login error:", error);
    return Result.error(HttpCode.INTERNAL_SERVER_ERROR, "登录异常，请稍后重试");
  }
}
