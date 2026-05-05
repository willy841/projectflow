const fs = require('node:fs');
const { Client } = require('pg');

function getDatabaseUrl() {
  const content = fs.readFileSync('.env.local', 'utf8');
  const line = content.split('\n').find((entry) => entry.startsWith('DATABASE_URL='));
  if (!line) throw new Error('DATABASE_URL not found in .env.local');
  return line.slice('DATABASE_URL='.length).trim().replace(/^['"]|['"]$/g, '');
}

const CANONICAL_CONFIRMATIONS_CTE = `
  with canonical_task_confirmations as (
    select
      tc.id,
      tc.flow_type,
      coalesce(dt.project_id, pt.project_id, vt.project_id, tc.project_id) as project_id,
      tc.task_id,
      coalesce(
        tc.task_id::text,
        concat('__project__:', coalesce(dt.project_id, pt.project_id, vt.project_id, tc.project_id)::text)
      ) as confirmation_partition_key,
      tc.confirmation_no,
      tc.confirmed_at,
      tc.created_at
    from task_confirmations tc
    left join design_tasks dt
      on tc.flow_type = 'design'
     and dt.id = tc.task_id
    left join procurement_tasks pt
      on tc.flow_type = 'procurement'
     and pt.id = tc.task_id
    left join vendor_tasks vt
      on tc.flow_type = 'vendor'
     and vt.id = tc.task_id
    where tc.flow_type in ('design', 'procurement', 'vendor')
  ),
  latest_task_confirmations as (
    select distinct on (tc.flow_type, tc.confirmation_partition_key)
      tc.id,
      tc.flow_type,
      tc.project_id,
      tc.task_id,
      tc.confirmation_no,
      tc.confirmed_at,
      tc.created_at
    from canonical_task_confirmations tc
    order by tc.flow_type, tc.confirmation_partition_key, tc.confirmation_no desc, tc.confirmed_at desc, tc.created_at desc, tc.id desc
  )
`;

async function main() {
  const client = new Client({ connectionString: getDatabaseUrl() });
  await client.connect();

  const expected = await client.query(`
    ${CANONICAL_CONFIRMATIONS_CTE}
    select
      tc.project_id as "projectId",
      case tc.flow_type when 'design' then '設計' when 'procurement' then '備品' when 'vendor' then '廠商' end as "sourceType",
      coalesce(
        case
          when tc.flow_type = 'vendor' then vt.vendor_id
          else nullif(ts.payload_json->>'vendor_id', '')::uuid
        end,
        null
      ) as "vendorId",
      coalesce(
        case
          when tc.flow_type = 'vendor' then v_vendor.name
          else v_payload.name
        end,
        nullif(ts.payload_json->>'vendor_name_text', ''),
        '未指定廠商'
      ) as "vendorName",
      sum(coalesce(nullif(ts.payload_json->>'amount', '')::numeric, 0))::float8 as "amountTotal",
      count(*)::int as "itemCount"
    from latest_task_confirmations tc
    inner join task_confirmation_plan_snapshots ts on ts.task_confirmation_id = tc.id
    left join vendors v_payload on v_payload.id = nullif(ts.payload_json->>'vendor_id', '')::uuid
    left join vendor_tasks vt on vt.id = tc.task_id and tc.flow_type = 'vendor'
    left join vendors v_vendor on v_vendor.id = vt.vendor_id
    group by 1,2,3,4
  `);

  const expectedMap = new Map();
  for (const row of expected.rows) {
    const key = [row.projectId, row.sourceType, row.vendorId ?? '', String(row.vendorName).trim().toLowerCase()].join('::');
    expectedMap.set(key, row);
  }

  const broken = await client.query(`
    select id, project_id as "projectId", source_type as "sourceType", vendor_id as "vendorId", vendor_name as "vendorName", amount_total::float8 as "amountTotal", item_count as "itemCount"
    from financial_reconciliation_groups
    where reconciliation_status = '已對帳' and coalesce(amount_total, 0) = 0
    order by updated_at desc nulls last, project_id asc, source_type asc, vendor_name asc
  `);

  const updates = [];
  for (const row of broken.rows) {
    const key = [row.projectId, row.sourceType, row.vendorId ?? '', String(row.vendorName).trim().toLowerCase()].join('::');
    const match = expectedMap.get(key);
    if (!match) continue;
    if (Number(match.amountTotal ?? 0) <= 0 || Number(match.itemCount ?? 0) <= 0) continue;
    updates.push({ id: row.id, ...match });
  }

  console.log(JSON.stringify({ brokenCount: broken.rows.length, repairableCount: updates.length, updates }, null, 2));

  for (const update of updates) {
    await client.query(
      `update financial_reconciliation_groups set amount_total = $2, item_count = $3, updated_at = now() where id = $1`,
      [update.id, update.amountTotal, update.itemCount],
    );
  }

  console.log(JSON.stringify({ ok: true, updatedCount: updates.length }, null, 2));
  await client.end();
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
