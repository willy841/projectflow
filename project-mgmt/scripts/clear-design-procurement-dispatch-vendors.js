/* eslint-disable @typescript-eslint/no-require-imports */
const { Client } = require('pg');

async function main() {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    throw new Error('DATABASE_URL is required');
  }

  const client = new Client({ connectionString, ssl: { rejectUnauthorized: false } });
  await client.connect();

  try {
    await client.query('begin');

    const summaryBefore = await client.query(`
      select
        (select count(*)::int from design_tasks where vendor_id is not null) as design_task_vendor_links,
        (select count(*)::int from procurement_tasks where vendor_id is not null) as procurement_task_vendor_links,
        (select count(*)::int from design_task_plans where vendor_name_text is not null and btrim(vendor_name_text) <> '') as design_plan_vendor_names,
        (select count(*)::int from procurement_task_plans where vendor_name_text is not null and btrim(vendor_name_text) <> '') as procurement_plan_vendor_names,
        (
          select count(*)::int
          from task_confirmation_plan_snapshots s
          inner join task_confirmations c on c.id = s.task_confirmation_id
          where c.flow_type = 'design'
            and jsonb_typeof(s.payload_json) = 'object'
            and s.payload_json ? 'vendor_name_text'
        ) as design_snapshot_vendor_keys,
        (
          select count(*)::int
          from task_confirmation_plan_snapshots s
          inner join task_confirmations c on c.id = s.task_confirmation_id
          where c.flow_type = 'procurement'
            and jsonb_typeof(s.payload_json) = 'object'
            and s.payload_json ? 'vendor_name_text'
        ) as procurement_snapshot_vendor_keys
    `);

    const designTasks = await client.query(`update design_tasks set vendor_id = null where vendor_id is not null`);
    const procurementTasks = await client.query(`update procurement_tasks set vendor_id = null where vendor_id is not null`);
    const designPlans = await client.query(`update design_task_plans set vendor_name_text = null where vendor_name_text is not null and btrim(vendor_name_text) <> ''`);
    const procurementPlans = await client.query(`update procurement_task_plans set vendor_name_text = null where vendor_name_text is not null and btrim(vendor_name_text) <> ''`);
    const designSnapshots = await client.query(`
      update task_confirmation_plan_snapshots s
      set payload_json = s.payload_json - 'vendor_name_text'
      from task_confirmations c
      where c.id = s.task_confirmation_id
        and c.flow_type = 'design'
        and jsonb_typeof(s.payload_json) = 'object'
        and s.payload_json ? 'vendor_name_text'
    `);
    const procurementSnapshots = await client.query(`
      update task_confirmation_plan_snapshots s
      set payload_json = s.payload_json - 'vendor_name_text'
      from task_confirmations c
      where c.id = s.task_confirmation_id
        and c.flow_type = 'procurement'
        and jsonb_typeof(s.payload_json) = 'object'
        and s.payload_json ? 'vendor_name_text'
    `);

    await client.query('commit');

    console.log(JSON.stringify({
      before: summaryBefore.rows[0],
      updated: {
        designTasks: designTasks.rowCount,
        procurementTasks: procurementTasks.rowCount,
        designPlans: designPlans.rowCount,
        procurementPlans: procurementPlans.rowCount,
        designSnapshots: designSnapshots.rowCount,
        procurementSnapshots: procurementSnapshots.rowCount,
      },
    }, null, 2));
  } catch (error) {
    await client.query('rollback');
    throw error;
  } finally {
    await client.end();
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
