import { prisma } from "@/lib/db";
import { hashPassword } from "@/lib/auth";
import { Result, HttpCode, RequestHelper } from "@/lib/http";

interface RegisterBody {
  username: string;
  email: string;
  password: string;
}

export async function POST(req: Request) {
  try {
    const { data: body, error: parseError } = await RequestHelper.safeParse<RegisterBody>(req);

    if (parseError || !body) {
      return Result.error(HttpCode.BAD_REQUEST, parseError || "无效的注册请求");
    }

    const { username, email, password } = body;

    if (!username || !email || !password) {
      return Result.error(HttpCode.BAD_REQUEST, "缺少必填字段");
    }

    // Check if user exists (and not deleted)
    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [{ email }, { username }],
        isDelete: 0,
      },
    });

    if (existingUser) {
      return Result.error(HttpCode.INTERNAL_SERVER_ERROR, "用户已存在，请登录");
    }

    const hashedPassword = await hashPassword(password);

    const user = await prisma.user.create({
      data: {
        username,
        email,
        password: hashedPassword,
      },
    });

    return Result.success(
      { id: user.id, username: user.username, email: user.email },
      "用户注册成功",
      HttpCode.CREATED
    );

  } catch (error) {
    console.error("Register error:", error);
    return Result.error(HttpCode.INTERNAL_SERVER_ERROR, "内部服务器错误");
  }
}
