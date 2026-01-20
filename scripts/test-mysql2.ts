import 'dotenv/config';
import mysql from 'mysql2/promise';

async function diagnose() {
  console.log('--- Direct MySQL2 Driver Test ---');
  
  const url = process.env.DATABASE_URL;
  if (!url) {
    console.error('DATABASE_URL missing');
    return;
  }
  
  // mysql://root:root@localhost:3306/ground_hog
  console.log('Using URL:', url.replace(/:([^@]+)@/, ':****@'));

  try {
    const conn = await mysql.createConnection(url);
    console.log('✅ Connection successful!');
    console.log('Connected thread id:', conn.threadId);
    
    const [rows] = await conn.query('SELECT 1 as val');
    console.log('Query Result:', rows);
    
    await conn.end();
  } catch (e: any) {
    console.error('❌ Connection failed:', e.message);
  }
}

diagnose();
