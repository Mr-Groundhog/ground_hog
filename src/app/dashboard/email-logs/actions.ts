"use server";

import { PrismaClient } from "@prisma/client";
import { sendMail } from "@/lib/mailer";

const prisma = new PrismaClient();

// 使用动态访问避免类型检查问题
const prismaAny = prisma as any;

export async function retryFailedEmailAction(logId: string) {
  try {
    // 获取邮件日志
    const emailLog = await prismaAny.emailLog.findUnique({
      where: { id: logId }
    });

    if (!emailLog) {
      throw new Error("邮件记录不存在");
    }

    if (emailLog.status !== "FAILED") {
      throw new Error("只有失败的邮件才能重试");
    }

    // 更新发送次数
    const updatedLog = await prismaAny.emailLog.update({
      where: { id: logId },
      data: {
        sendCount: {
          increment: 1
        },
        status: "PENDING"
      }
    });

    // 重新发送邮件
    const result = await sendMail({
      to: emailLog.toEmail,
      subject: emailLog.subject,
      html: emailLog.content || ""
    });

    // 更新邮件状态
    await prismaAny.emailLog.update({
      where: { id: logId },
      data: {
        status: result.success ? "SENT" : "FAILED",
        sentAt: result.success ? new Date() : undefined,
        errorMessage: result.success ? undefined : "重试发送失败"
      }
    });

    return { success: true, message: "邮件重试成功" };
  } catch (error: any) {
    // 如果重试失败，恢复原始状态
    await prismaAny.emailLog.update({
      where: { id: logId },
      data: {
        status: "FAILED"
      }
    });
    
    throw new Error(error.message || "邮件重试失败");
  }
}