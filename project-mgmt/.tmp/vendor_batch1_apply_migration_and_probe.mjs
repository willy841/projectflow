import fs from 'node:fs';
import pg from 'pg';

const { Client } = pg;
const connectionString = process.env.DATABASE_URL || 'postgresql://postgres.vkjabxekxnnczpulumod:9RnTuDvsNruISgaE@aws-1-ap-northeast-1.pooler.supabase.com:6543/postgres';
const sql = fs.readFileSync(new URL('../db/migrations/20260413_vendor_data_batch1_foundation.sql', import.meta.url), 'utf8');

const client = new Client({ connectionString });
await client.connect();
try {
  await client.query(sql);
  const vendors = await client.query(`select id, name, coalesce(trade_label,'' ) as trade_label, coalesce(contact_name,'' ) as contact_name, coalesce(phone,'' ) as phone, coalesce(email,'' ) as email from vendors order by created_at desc limit 5`);
  const paymentsCols = await client.query(`select column_name from information_schema.columns where table_schema='public' and table_name='project_vendor_payment_records' order by ordinal_position`);
  console.log(JSON.stringify({ ok: true, vendors: vendors.rows, paymentColumns: paymentsCols.rows.map((row) => row.column_name) }, null, 2));
} finally {
  await client.end();
}
