import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("检查友链数据中的邮箱信息...\n");

  const friendLinks = await prisma.friendLink.findMany({
    orderBy: { createdAt: "desc" },
    take: 10,
  });

  console.log(`找到 ${friendLinks.length} 条友链记录:\n`);

  friendLinks.forEach((link, index) => {
    console.log(`${index + 1}. ${link.name}`);
    console.log(`   状态: ${link.status}`);
    console.log(`   邮箱: ${link.email || "未提供"}`);
    console.log(`   URL: ${link.url}`);
    console.log(`   创建时间: ${link.createdAt.toISOString()}`);
    console.log("");
  });

  // 统计
  const withEmail = friendLinks.filter((l) => l.email).length;
  const withoutEmail = friendLinks.filter((l) => !l.email).length;

  console.log(`\n统计:`);
  console.log(`- 有邮箱: ${withEmail} 条`);
  console.log(`- 无邮箱: ${withoutEmail} 条`);
}

main()
  .catch((e) => {
    console.error("错误:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });