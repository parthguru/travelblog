// scripts/init-review-tables.js
import { initializeReviewTables } from '../app/lib/directoryDb.js';

async function runInitialization() {
  try {
    console.log('Initializing review tables...');
    await initializeReviewTables();
    console.log('Review tables initialized successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Error initializing review tables:', error);
    process.exit(1);
  }
}

runInitialization(); 