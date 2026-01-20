import 'dotenv/config';
import { prisma } from './src/lib/db';

async function main() {
  try {
    console.log('Connecting to database...');
    const users = await prisma.user.findMany();
    console.log('Successfully connected. Users count:', users.length);
  } catch (e) {
    console.error('Error connecting to database:', e);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();
