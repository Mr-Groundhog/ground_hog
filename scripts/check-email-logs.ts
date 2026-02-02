import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("检查邮件发送日志...\n");

  // 使用动态访问避免类型检查问题
  const prismaAny = prisma as any;

  const emailLogs = await prismaAny.emailLog.findMany({
    orderBy: { createdAt: "desc" },
    take: 10,
  });

  console.log(`找到 ${emailLogs.length} 条邮件记录:\n`);

  emailLogs.forEach((log: any, index: number) => {
    console.log(`${index + 1}. ${log.subject}`);
    console.log(`   收件人: ${log.toEmail}`);
    console.log(`   状态: ${log.status}`);
    console.log(`   IP: ${log.ip}`);
    console.log(`   发送次数: ${log.sendCount}`);
    if (log.errorMessage) {
      console.log(`   错误信息: ${log.errorMessage}`);
    }
    console.log(`   创建时间: ${log.createdAt.toISOString()}`);
    console.log("");
  });

  // 统计
  const sent = emailLogs.filter((l: any) => l.status === "SENT").length;
  const failed = emailLogs.filter((l: any) => l.status === "FAILED").length;
  const pending = emailLogs.filter((l: any) => l.status === "PENDING").length;

  console.log(`\n统计:`);
  console.log(`- 已发送: ${sent} 条`);
  console.log(`- 发送失败: ${failed} 条`);
  console.log(`- 待发送: ${pending} 条`);
}

main()
  .catch((e) => {
    console.error("错误:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });