import pg from 'pg';
const { Client } = pg;
const client = new Client({ connectionString: process.env.DATABASE_URL || 'postgresql://postgres.vkjabxekxnnczpulumod:9RnTuDvsNruISgaE@aws-1-ap-northeast-1.pooler.supabase.com:6543/postgres' });
await client.connect();
try {
  const result = await client.query(`select id,name,trade_label,contact_name,phone,email,line_id,address,bank_name,account_name,account_number,labor_name,labor_id_no,labor_birthday_roc,labor_union_membership from vendors where id = $1`, ['77777777-7777-4777-8777-777777777777']);
  console.log(JSON.stringify(result.rows[0] ?? null, null, 2));
} finally {
  await client.end();
}
