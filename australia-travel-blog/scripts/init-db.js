// scripts/init-db.js
require('dotenv').config();
const { initializeDatabase } = require('../app/lib/directoryDb');

async function main() {
  try {
    console.log('Starting database initialization...');
    await initializeDatabase();
    console.log('Database initialization completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Error initializing database:', error);
    process.exit(1);
  }
}

main(); 