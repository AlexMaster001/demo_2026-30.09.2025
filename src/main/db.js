// main/db.js
import { Pool } from 'pg';

async function connectDB() {
  const pool = new Pool({
    user: 'postgres',
    host: 'localhost',
    database: 'demo_2026',
    password: '1234', // ← ТВОЙ ПАРОЛЬ!
    port: 5432,
  });

  try {
    await pool.query('SELECT NOW()');
    console.log('✅ PostgreSQL подключена');
  } catch (err) {
    console.error('❌ Ошибка подключения к БД:', err.message);
  }

  return pool;
}

export default connectDB;
