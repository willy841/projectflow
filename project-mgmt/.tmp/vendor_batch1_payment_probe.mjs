import pg from 'pg';
const { Client } = pg;
const client = new Client({ connectionString: process.env.DATABASE_URL || 'postgresql://postgres.vkjabxekxnnczpulumod:9RnTuDvsNruISgaE@aws-1-ap-northeast-1.pooler.supabase.com:6543/postgres' });
await client.connect();
try {
  const rows = await client.query(`
    select
      coalesce(sum(amount), 0)::int as paid_total
    from project_vendor_payment_records
    where project_id = $1 and (vendor_id = $2 or vendor_name = $3)
  `, ['11111111-1111-4111-8111-111111111111', '77777777-7777-4777-8777-777777777777', '驗收廠商C']);
  console.log(JSON.stringify(rows.rows[0], null, 2));
} finally {
  await client.end();
}
