const { Pool } = require('pg');

let pool = null;
let isConnected = false;

const initPgPool = async () => {
  const connectionString = process.env.DATABASE_URL || 
    (process.env.PGHOST ? `postgresql://${process.env.PGUSER || 'postgres'}:${process.env.PGPASSWORD || ''}@${process.env.PGHOST}:${process.env.PGPORT || 5432}/${process.env.PGDATABASE || 'intellidesk'}` : null);

  if (!connectionString) {
    console.log('[PostgreSQL] No database credentials configured. Running in JSON-persistence mode.');
    return null;
  }

  try {
    pool = new Pool({
      connectionString,
      connectionTimeoutMillis: 3000,
      idleTimeoutMillis: 10000,
    });

    // Test the connection
    const client = await pool.connect();
    const res = await client.query('SELECT NOW() AS current_time, version()');
    client.release();
    isConnected = true;
    console.log(`[PostgreSQL] Successfully connected to database: ${res.rows[0].version}`);
    return pool;
  } catch (err) {
    console.warn(`[PostgreSQL] Connection failed (${err.message}). Gracefully falling back to local JSON persistence.`);
    isConnected = false;
    pool = null;
    return null;
  }
};

module.exports = {
  initPgPool,
  getPool: () => pool,
  isPgConnected: () => isConnected,
  query: async (text, params) => {
    if (!pool || !isConnected) {
      throw new Error('PostgreSQL pool not connected');
    }
    return pool.query(text, params);
  }
};

