import { prisma } from "@/lib/db";
import { sendVerificationCode } from "@/lib/mailer";
import { Result, HttpCode, RequestHelper } from "@/lib/http";
import { z } from "zod";

const sendCodeSchema = z.object({
  email: z.string().email("请输入正确的邮箱地址"),
});

const CODE_EXPIRE_MINUTES = 5;
const SEND_COOLDOWN_SECONDS = 60;

// 生成6位验证码
function generateCode(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

export async function POST(req: Request) {
  try {
    const { data: body, error: parseError } = await RequestHelper.safeParse<Record<string, unknown>>(req);

    if (parseError || !body) {
      return Result.error(HttpCode.BAD_REQUEST, parseError || "无效的请求");
    }

    const validation = sendCodeSchema.safeParse(body);
    if (!validation.success) {
      return Result.error(HttpCode.BAD_REQUEST, validation.error.errors[0].message);
    }

    const { email } = validation.data;

    // 检查60秒内是否已发送
    const recentCode = await prisma.verificationCode.findFirst({
      where: {
        email,
        createdAt: {
          gte: new Date(Date.now() - SEND_COOLDOWN_SECONDS * 1000),
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    if (recentCode) {
      return Result.error(HttpCode.BAD_REQUEST, "发送太频繁，请稍后再试");
    }

    // 生成新验证码
    const code = generateCode();
    const expiresAt = new Date(Date.now() + CODE_EXPIRE_MINUTES * 60 * 1000);

    // 存储验证码
    await prisma.verificationCode.create({
      data: {
        email,
        code,
        expiresAt,
      },
    });

    // 发送邮件
    await sendVerificationCode(email, code);

    return Result.success({ message: "验证码已发送" }, "发送成功");

  } catch (error) {
    console.error("Send code error:", error);
    return Result.error(HttpCode.INTERNAL_SERVER_ERROR, "发送失败，请稍后重试");
  }
}