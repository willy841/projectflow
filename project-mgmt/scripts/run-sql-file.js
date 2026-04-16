const fs = require('node:fs');
const { Client } = require('pg');

async function main() {
  const file = process.argv[2];
  if (!file) {
    console.error('Usage: node scripts/run-sql-file.js <sql-file>');
    process.exit(1);
  }

  const sql = fs.readFileSync(file, 'utf8');
  const client = new Client({ connectionString: process.env.DATABASE_URL });
  await client.connect();
  await client.query(sql);
  await client.end();
  console.log(`Applied SQL: ${file}`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
