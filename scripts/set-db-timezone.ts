
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Current status:');
  const initial = await prisma.$queryRaw`SELECT @@global.time_zone, @@session.time_zone`;
  console.log(initial);

  console.log('Setting GLOBAL time_zone to +00:00 (UTC)...');
  try {
    // Try to set global timezone
    await prisma.$executeRaw`SET GLOBAL time_zone = '+00:00';`;
    console.log('Successfully set GLOBAL time_zone to +00:00.');
    
    // Check if it took effect for global
    const after = await prisma.$queryRaw`SELECT @@global.time_zone`;
    console.log('Global is now:', after);

  } catch (e) {
    console.error('Failed to set timezone:', e);
  } finally {
    await prisma.$disconnect();
  }
}

main();
