#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
const { Client } = require('pg');

function readDatabaseUrl() {
  const fromEnv = process.env.DATABASE_URL || process.env.POSTGRES_URL || process.env.POSTGRES_PRISMA_URL || process.env.POSTGRES_URL_NON_POOLING;
  if (fromEnv) return fromEnv;

  const envLocalPath = path.resolve(process.cwd(), '.env.local');
  if (!fs.existsSync(envLocalPath)) {
    throw new Error('Missing DATABASE_URL and .env.local');
  }

  const content = fs.readFileSync(envLocalPath, 'utf8');
  const line = content.split('\n').find((entry) => entry.startsWith('DATABASE_URL='));
  if (!line) {
    throw new Error('DATABASE_URL not found in .env.local');
  }
  return line.slice('DATABASE_URL='.length).trim().replace(/^['\"]|['\"]$/g, '');
}

async function main() {
  const sqlPath = path.resolve(process.cwd(), 'db/seeds/projectflow-formal-acceptance-sample.sql');
  const sql = fs.readFileSync(sqlPath, 'utf8');
  const client = new Client({ connectionString: readDatabaseUrl() });
  await client.connect();
  try {
    await client.query(sql);
    const summary = await client.query(`
      select
        (select count(*)::int from projects where id = '11111111-1111-4111-8111-111111111111') as project_count,
        (select count(*)::int from task_confirmations where project_id = '11111111-1111-4111-8111-111111111111') as confirmation_count,
        (select count(*)::int from financial_reconciliation_groups where project_id = '11111111-1111-4111-8111-111111111111') as reconciliation_group_count,
        (select coalesce(sum(total_amount), 0)::float8 from financial_quotation_imports where project_id = '11111111-1111-4111-8111-111111111111' and is_active = true) as quotation_total
    `);
    console.log(JSON.stringify({ ok: true, sampleProjectId: '11111111-1111-4111-8111-111111111111', summary: summary.rows[0] }, null, 2));
  } finally {
    await client.end();
  }
}

main().catch((error) => {
  console.error(JSON.stringify({ ok: false, error: error.message }, null, 2));
  process.exit(1);
});
