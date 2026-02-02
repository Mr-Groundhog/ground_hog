import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("测试友链审核邮件发送...\n");

  // 获取一个待审核的友链
  const friendLink = await prisma.friendLink.findFirst({
    where: {
      status: "APPROVED",
      email: { not: null }
    }
  });

  if (!friendLink) {
    console.log("没有找到合适的友链记录");
    return;
  }

  console.log(`测试友链: ${friendLink.name}`);
  console.log(`邮箱: ${friendLink.email}`);
  console.log(`状态: ${friendLink.status}`);
  console.log(`ID: ${friendLink.id}\n`);

  try {
    // 导入发送邮件函数
    const { sendFriendApproveEmail } = await import("../src/lib/email-service");

    console.log("开始发送邮件...");
    const result = await sendFriendApproveEmail(
      friendLink.email!,
      friendLink.name,
      "127.0.0.1"
    );

    console.log("\n邮件发送成功！");
    console.log("Message ID:", result.messageId);
    console.log("Log ID:", result.logId);
  } catch (error: any) {
    console.error("\n邮件发送失败:", error.message);
    console.error("错误详情:", error);
  }
}

main()
  .catch((e) => {
    console.error("错误:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });