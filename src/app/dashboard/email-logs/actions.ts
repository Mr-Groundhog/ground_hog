"use server";

import { revalidatePath, revalidateTag } from "next/cache";
import { prisma } from "@/lib/db";
import { sendMail } from "@/lib/mailer";

const EMAIL_LOGS_TAG = "dashboard-email-logs";

export async function retryFailedEmailAction(logId: string) {
  try {
    const emailLog = await prisma.emailLog.findUnique({
      where: { id: logId },
    });

    if (!emailLog) {
      throw new Error("Email log not found");
    }

    if (emailLog.status !== "FAILED") {
      throw new Error("Only failed emails can be retried");
    }

    await prisma.emailLog.update({
      where: { id: logId },
      data: {
        sendCount: {
          increment: 1,
        },
        status: "PENDING",
      },
    });

    const result = await sendMail({
      to: emailLog.toEmail,
      subject: emailLog.subject,
      html: emailLog.content || "",
    });

    await prisma.emailLog.update({
      where: { id: logId },
      data: {
        status: result.success ? "SENT" : "FAILED",
        sentAt: result.success ? new Date() : undefined,
        errorMessage: result.success ? undefined : "Retry failed",
      },
    });

    revalidateTag(EMAIL_LOGS_TAG);
    revalidatePath("/dashboard/email-logs");
    return { success: true, message: "Email retried successfully" };
  } catch (error: unknown) {
    await prisma.emailLog.update({
      where: { id: logId },
      data: {
        status: "FAILED",
      },
    });

    revalidateTag(EMAIL_LOGS_TAG);
    revalidatePath("/dashboard/email-logs");
    throw new Error(error instanceof Error ? error.message : "Email retry failed");
  }
}
