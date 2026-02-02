import { prisma } from "@/lib/db";
import { sendMail } from "@/lib/mailer";
import { render } from '@react-email/render';
import { FriendApproveTemplate } from "@/app/dashboard/friend-links/components/contact-template";

// 确保 React Email 组件可以在服务器端渲染
import { createElement } from 'react';

// IP限制检查
export async function checkIPLimit(ip: string): Promise<{ allowed: boolean; message?: string }> {
  const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000); // 1小时前
  const twoHoursAgo = new Date(Date.now() - 2 * 60 * 60 * 1000); // 2小时前
  
  // 检查最近1小时内的发送次数
  const recentEmails = await prisma.emailLog.count({
    where: {
      ip,
      createdAt: {
        gte: oneHourAgo,
      },
      status: {
        not: "FAILED" // 不计算失败的邮件
      }
    },
  });

  if (recentEmails >= 3) {
    // 检查是否有2小时内可以重试的记录
    const retryableEmails = await prisma.emailLog.count({
      where: {
        ip,
        createdAt: {
          gte: twoHoursAgo,
          lt: oneHourAgo,
        },
        status: "FAILED",
      },
    });

    if (retryableEmails > 0) {
      return { 
        allowed: true, 
        message: `检测到${retryableEmails}封失败邮件，允许重试` 
      };
    }
    
    return { 
      allowed: false, 
      message: "同一IP地址每小时最多只能发送3封邮件，请2小时后再试" 
    };
  }

  return { allowed: true };
}

// 发送友链审核通过邮件
export async function sendFriendApproveEmail(
  toEmail: string, 
  siteName: string, 
  ip: string
) {
  // 检查IP限制
  const ipCheck = await checkIPLimit(ip);
  if (!ipCheck.allowed) {
    throw new Error(ipCheck.message);
  }

  // 渲染邮件模板
  const emailHtml = await render(createElement(FriendApproveTemplate, { siteName }));

  let emailLog: any;

  try {
    // 记录邮件发送尝试
    emailLog = await prisma.emailLog.create({
      data: {
        fromEmail: process.env.GMAIL_USER || "",
        toEmail: toEmail,
        subject: "🎉 友链申请已通过",
        content: emailHtml,
        ip,
        status: "PENDING",
      },
    });

    // 发送邮件
    const result = await sendMail({
      to: toEmail,
      subject: "🎉 友链申请已通过",
      html: emailHtml,
    });

    // 更新邮件记录为成功
    await prisma.emailLog.update({
      where: { id: emailLog.id },
      data: {
        status: "SENT",
        sentAt: new Date(),
      },
    });

    return {
      success: true,
      messageId: result.messageId,
      logId: emailLog.id,
    };

  } catch (error) {
    // 记录发送失败
    if (emailLog) {
      await prisma.emailLog.update({
        where: { id: emailLog.id },
        data: {
          status: "FAILED",
          errorMessage: error instanceof Error ? error.message : "未知错误",
        },
      });
    }

    throw error;
  }
}

// 获取邮件发送记录
export async function getEmailLogs(page = 1, limit = 10) {
  const skip = (page - 1) * limit;
  
  const [data, total] = await Promise.all([
    prisma.emailLog.findMany({
      skip,
      take: limit,
      orderBy: { createdAt: "desc" },
    }),
    prisma.emailLog.count(),
  ]);

  return {
    data,
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
  };
}

// 重试失败的邮件
export async function retryFailedEmail(logId: string, ip: string) {
  const emailLog = await prisma.emailLog.findUnique({
    where: { id: logId },
  });

  if (!emailLog) {
    throw new Error("邮件记录不存在");
  }

  if (emailLog.status !== "FAILED") {
    throw new Error("只有失败的邮件才能重试");
  }

  // 检查IP限制
  const ipCheck = await checkIPLimit(ip);
  if (!ipCheck.allowed) {
    throw new Error(ipCheck.message);
  }

  try {
    // 发送邮件
    const result = await sendMail({
      to: emailLog.toEmail,
      subject: emailLog.subject,
      html: emailLog.content || "",
    });

    // 更新邮件记录
    await prisma.emailLog.update({
      where: { id: logId },
      data: {
        status: "SENT",
        sentAt: new Date(),
        sendCount: emailLog.sendCount + 1,
        errorMessage: null,
      },
    });

    return {
      success: true,
      messageId: result.messageId,
    };

  } catch (error) {
    // 更新失败次数
    await prisma.emailLog.update({
      where: { id: logId },
      data: {
        sendCount: emailLog.sendCount + 1,
        errorMessage: error instanceof Error ? error.message : "未知错误",
      },
    });
    
    throw error;
  }
}