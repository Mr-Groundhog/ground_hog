import { PrismaClient } from '@prisma/client';

const globalForPrisma = global as unknown as { prisma: PrismaClient };

export const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
    datasources: {
      db: {
        url: process.env.DATABASE_URL + '&connection_limit=5',
      },
    },
  });

prisma.$connect().then(async () => {
  await prisma.$executeRaw`SET TIME ZONE 'Asia/Shanghai'`;
});

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;
