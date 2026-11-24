const { initDb } = require('./db');

async function runMigration() {
  console.log('Starting Wealy Database Migration...');
  try {
    await initDb();
    console.log('Database migration finished.');
    process.exit(0);
  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  }
}

if (require.main === module) {
  runMigration();
}

module.exports = runMigration;
