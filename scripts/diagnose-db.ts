import 'dotenv/config';
import mariadb from 'mariadb';

async function diagnose() {
  console.log('--- Database Connection Diagnosis ---');
  
  const url = process.env.DATABASE_URL;
  if (!url) {
    console.error('❌ DATABASE_URL is not defined in environment variables.');
    return;
  }

  // Mask password for display
  const maskedUrl = url.replace(/:([^@]+)@/, ':****@');
  console.log(`Checking connection to: ${maskedUrl}`);

  // FIX: mariadb driver requires mariadb:// protocol or specific options
  const fixedUrl = url.replace(/^mysql:\/\//, 'mariadb://');
  console.log(`Using fixed URL for driver: ${fixedUrl.replace(/:([^@]+)@/, ':****@')}`);

  console.log('\n1. Testing raw mariadb driver connection (String Config)...');
  try {
    const pool1 = mariadb.createPool(fixedUrl);
    const conn = await pool1.getConnection();
    console.log('✅ Raw mariadb connection (String) successful!');
    conn.release();
    await pool1.end();
  } catch (e: any) {
    console.error('❌ String config failed:', e.message);
  }

  console.log('\n2. Testing raw mariadb driver connection (Object Config - like src/lib/db.ts)...');
  try {
    const urlObj = new URL(url);
    const config = {
        host: urlObj.hostname,
        port: parseInt(urlObj.port) || 3306,
        user: urlObj.username,
        password: decodeURIComponent(urlObj.password),
        database: urlObj.pathname.slice(1),
    };
    console.log('   Config:', { ...config, password: '****' });

    const pool2 = mariadb.createPool(config);
    const conn = await pool2.getConnection();
    console.log('✅ Raw mariadb connection (Object) successful!');
    const rows = await conn.query('SELECT 1 as val');
    console.log(`   Query result: ${rows[0].val}`);
    conn.release();
    await pool2.end();
  } catch (error: any) {
    console.error('❌ Object config failed:', error.message);
  }

  /*
  console.log('\n1. Testing raw mariadb driver connection...');
  let pool;
  try {
    pool = mariadb.createPool(fixedUrl);
    const conn = await pool.getConnection();
    console.log('✅ Raw mariadb connection successful!');
    
    const rows = await conn.query('SELECT 1 as val');
    console.log(`   Query result: ${rows[0].val}`);
    
    conn.release(); // release to pool
  } catch (error: any) {
    console.error('❌ Raw mariadb connection failed:', error.message);
    if (error.code) console.error('   Error Code:', error.code);
    return; // Stop if raw connection fails
  } finally {
    if (pool) await pool.end();
  }
  */

  console.log('\nDiagnosis complete.');
}

diagnose().catch(console.error);
