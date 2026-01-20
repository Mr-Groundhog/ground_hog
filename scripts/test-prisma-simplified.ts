import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import { PrismaMariaDb } from '@prisma/adapter-mariadb';
import mariadb from 'mariadb';

async function main() {
  console.log('--- Simplified Prisma Test ---');
  
  const url = process.env.DATABASE_URL;
  if (!url) {
    throw new Error('DATABASE_URL is not defined');
  }

  // 1. Manually parse the URL to create a config object
  // This avoids any potential string parsing issues in the driver or adapter
  const urlObj = new URL(url);
  const config = {
      host: urlObj.hostname,
      port: parseInt(urlObj.port) || 3306,
      user: 'root', // Explicitly force root user
      password: decodeURIComponent(urlObj.password),
      database: urlObj.pathname.slice(1),
      allowPublicKeyRetrieval: true,
  };
  
  console.log('1. Connection Config:', { ...config, password: '****' });

  // 2. Create pool
  const pool = mariadb.createPool(config);
  
  // 3. Create adapter
  const adapter = new PrismaMariaDb(pool);
  
  // 4. Create client
  const prisma = new PrismaClient({ adapter, log: ['info', 'warn', 'error'] });

  try {
    console.log('2. Attempting Prisma query...');
    const count = await prisma.user.count();
    console.log('✅ Success! User count:', count);
  } catch (e: any) {
    console.error('❌ Prisma query failed:', e);
  } finally {
    await prisma.$disconnect();
    await pool.end();
  }
}

main();
