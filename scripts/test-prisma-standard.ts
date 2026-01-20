import 'dotenv/config';
import { PrismaClient } from '@prisma/client';

async function main() {
  console.log('--- Standard Prisma 6 Test (No Adapter) ---');
  
  const prisma = new PrismaClient({ log: ['info', 'warn', 'error'] });

  try {
    console.log('Attempting Prisma query...');
    const count = await prisma.user.count();
    console.log('✅ Success! User count:', count);
  } catch (e: any) {
    console.error('❌ Prisma query failed:', e);
  } finally {
    await prisma.$disconnect();
  }
}

main();
