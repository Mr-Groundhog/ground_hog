import 'dotenv/config';
import mariadb from 'mariadb';

async function diagnose() {
  console.log('--- Direct MariaDB Driver Test ---');
  
  const url = process.env.DATABASE_URL;
  if (!url) {
    console.error('DATABASE_URL missing');
    return;
  }
  
  const urlObj = new URL(url);
  const config = {
      host: urlObj.hostname,
      port: parseInt(urlObj.port) || 3306,
      user: 'root', // HARDCODED
      password: decodeURIComponent(urlObj.password),
      database: urlObj.pathname.slice(1),
  };
  
  console.log('Config used for createPool:', { ...config, password: '****' });

  try {
    const pool = mariadb.createPool(config);
    const conn = await pool.getConnection();
    console.log('✅ Connection successful!');
    console.log('Connected thread id:', conn.threadId);
    conn.release();
    await pool.end();
  } catch (e: any) {
    console.error('❌ Connection failed:', e);
  }
}

diagnose();
