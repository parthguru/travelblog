// lib/db.js
const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

async function testConnection() {
  try {
    const client = await pool.connect();
    console.log('Successfully connected to PostgreSQL!');
    client.release(); // Release the client back to the pool
  } catch (error) {
    console.error('Error connecting to PostgreSQL:', error);
  }
}

testConnection();

module.exports = { pool, testConnection };
