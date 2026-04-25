begin;

-- deterministic cleanup for replay

delete from project_vendor_payment_records where project_id = '11111111-1111-4111-8111-111111111111';
delete from project_collection_records where project_id = '11111111-1111-4111-8111-111111111111';
delete from financial_reconciliation_groups where project_id = '11111111-1111-4111-8111-111111111111';
delete from financial_manual_costs where project_id = '11111111-1111-4111-8111-111111111111';
delete from financial_quotation_line_items where quotation_import_id = 'aaaaaaa1-aaaa-4aaa-8aaa-aaaaaaaaaaa1';
delete from financial_quotation_imports where project_id = '11111111-1111-4111-8111-111111111111';
delete from task_confirmation_plan_snapshots where task_confirmation_id in (
  '55555555-5555-4555-8555-555555555551',
  '55555555-5555-4555-8555-555555555552',
  '55555555-5555-4555-8555-555555555553'
);
delete from task_confirmations where id in (
  '55555555-5555-4555-8555-555555555551',
  '55555555-5555-4555-8555-555555555552',
  '55555555-5555-4555-8555-555555555553'
);
delete from design_task_plans where design_task_id = '33333333-3333-4333-8333-333333333333';
delete from procurement_task_plans where procurement_task_id = '33333333-3333-4333-8333-333333333334';
delete from vendor_task_plans where vendor_task_id = '88888888-8888-4888-8888-888888888888';
delete from design_tasks where id = '33333333-3333-4333-8333-333333333333';
delete from procurement_tasks where id = '33333333-3333-4333-8333-333333333334';
delete from vendor_tasks where id = '88888888-8888-4888-8888-888888888888';
delete from project_execution_items where project_id = '11111111-1111-4111-8111-111111111111';
delete from projects where id = '11111111-1111-4111-8111-111111111111';

insert into projects (
  id, code, name, client_name, event_date, location, load_in_time, status,
  event_type, contact_name, contact_phone, contact_email, contact_line
) values (
  '11111111-1111-4111-8111-111111111111',
  'PRJ-2026-024',
  '百貨檔期陳列與贈品備品整合',
  '青禾百貨',
  '2026-04-25',
  '台中新光三越',
  '09:00',
  '執行中',
  '百貨檔期',
  '葉思妤',
  '0933-222-111',
  'merch@greenmall.tw',
  'greenmall-vmd'
);

insert into project_execution_items (
  id, project_id, parent_id, seq_code, title, size, material, structure, quantity, note, sort_order
) values
(
  '22222222-2222-4222-8222-222222222221',
  '11111111-1111-4111-8111-111111111111',
  null,
  '1',
  'POP 與價卡完稿',
  'W120 x H180 cm / A6',
  'PVC 輸出 / 紙卡',
  '桌上立牌 + 吊卡',
  '1 式',
  '百貨檔期 POP、價卡與吊牌需套用統一檔期主視覺。',
  1
),
(
  '22222222-2222-4222-8222-222222222222',
  '11111111-1111-4111-8111-111111111111',
  null,
  '2',
  '展示架五金與配件',
  'W60 x D60 x H180 cm',
  '五金 / 配件包',
  '可拆裝結構',
  '1 式',
  '展示架須可重複使用並具拆裝結構，需搭配五金與運輸包材。',
  2
),
(
  '22222222-2222-4222-8222-222222222223',
  '11111111-1111-4111-8111-111111111111',
  null,
  '3',
  '展示架現場製作發包',
  null,
  null,
  null,
  '1 式',
  '單 vendor 正式發包任務，用於 assignments/package 驗收。',
  3
);

insert into design_tasks (
  id, project_id, source_execution_item_id, vendor_id, title, size, material, structure, quantity, requirement_text, reference_url, status
) values (
  '33333333-3333-4333-8333-333333333333',
  '11111111-1111-4111-8111-111111111111',
  '22222222-2222-4222-8222-222222222221',
  null,
  'POP 與價卡完稿',
  'W120 x H180 cm / A6',
  'PVC 輸出 / 紙卡',
  '桌上立牌 + 吊卡',
  '1 式',
  '需延續檔期主視覺，並輸出 POP / 價卡 / 吊牌完整套件。',
  'https://example.com/formal-acceptance/design',
  '待確認'
);

insert into procurement_tasks (
  id, project_id, source_execution_item_id, vendor_id, title, quantity, budget_note, requirement_text, reference_url, status
) values (
  '33333333-3333-4333-8333-333333333334',
  '11111111-1111-4111-8111-111111111111',
  '22222222-2222-4222-8222-222222222222',
  null,
  '展示架五金與配件採購',
  '1 式',
  'NT$ 11,000',
  '需含拆裝五金、包材與現場替換耗材。',
  'https://example.com/formal-acceptance/procurement',
  '待確認'
);

insert into vendor_tasks (
  id, project_id, source_execution_item_id, vendor_id, title, requirement_text, status
) values (
  '88888888-8888-4888-8888-888888888888',
  '11111111-1111-4111-8111-111111111111',
  '22222222-2222-4222-8222-222222222223',
  '77777777-7777-4777-8777-777777777777',
  '展示架現場製作發包',
  '正式 vendor 任務，用於群組確認與 package 驗收。',
  '待確認'
);

insert into design_task_plans (
  id, design_task_id, title, size, material, structure, quantity, amount, preview_url, vendor_id, vendor_name_text, sort_order
) values (
  '44444444-4444-4444-8444-444444444441',
  '33333333-3333-4333-8333-333333333333',
  'POP / 價卡正式輸出方案',
  'W120 x H180 cm / A6',
  'PVC 輸出 / 紙卡',
  '桌上立牌 + 吊卡',
  '1 式',
  12000,
  'https://example.com/formal-acceptance/design/preview',
  '77777777-7777-4777-8777-777777777777',
  '驗收廠商C',
  1
);

insert into procurement_task_plans (
  id, procurement_task_id, title, quantity, amount, preview_url, vendor_id, vendor_name_text, sort_order
) values (
  '44444444-4444-4444-8444-444444444442',
  '33333333-3333-4333-8333-333333333334',
  '展示架五金正式採購方案',
  '1 式',
  11000,
  'https://example.com/formal-acceptance/procurement/preview',
  '77777777-7777-4777-8777-777777777777',
  '驗收廠商C',
  1
);

insert into vendor_task_plans (
  id, vendor_task_id, title, requirement_text, amount, vendor_name_text, sort_order
) values (
  '99999999-9999-4999-8999-999999999999',
  '88888888-8888-4888-8888-888888888888',
  '展示架主體製作與進場',
  '含主體製作、現場安裝、拆除回收。',
  20210,
  '驗收廠商C',
  1
);

insert into task_confirmations (
  id, project_id, flow_type, task_id, confirmation_no, status, confirmed_at
) values
(
  '55555555-5555-4555-8555-555555555551',
  '11111111-1111-4111-8111-111111111111',
  'design',
  '33333333-3333-4333-8333-333333333333',
  1,
  'confirmed',
  '2026-04-16T10:00:00+08:00'
),
(
  '55555555-5555-4555-8555-555555555552',
  '11111111-1111-4111-8111-111111111111',
  'procurement',
  '33333333-3333-4333-8333-333333333334',
  1,
  'confirmed',
  '2026-04-16T10:05:00+08:00'
),
(
  '55555555-5555-4555-8555-555555555553',
  '11111111-1111-4111-8111-111111111111',
  'vendor',
  '88888888-8888-4888-8888-888888888888',
  1,
  'confirmed',
  '2026-04-16T10:10:00+08:00'
);

insert into task_confirmation_plan_snapshots (
  id, task_confirmation_id, source_plan_id, sort_order, payload_json
) values
(
  '66666666-6666-4666-8666-666666666661',
  '55555555-5555-4555-8555-555555555551',
  '44444444-4444-4444-8444-444444444441',
  1,
  jsonb_build_object(
    'title', 'POP / 價卡正式輸出方案',
    'size', 'W120 x H180 cm / A6',
    'material', 'PVC 輸出 / 紙卡',
    'structure', '桌上立牌 + 吊卡',
    'quantity', '1 式',
    'amount', '12000',
    'preview_url', 'https://example.com/formal-acceptance/design/preview',
    'vendor_id', '77777777-7777-4777-8777-777777777777',
    'vendor_name_text', '驗收廠商C'
  )
),
(
  '66666666-6666-4666-8666-666666666662',
  '55555555-5555-4555-8555-555555555552',
  '44444444-4444-4444-8444-444444444442',
  1,
  jsonb_build_object(
    'title', '展示架五金正式採購方案',
    'quantity', '1 式',
    'amount', '11000',
    'preview_url', 'https://example.com/formal-acceptance/procurement/preview',
    'vendor_id', '77777777-7777-4777-8777-777777777777',
    'vendor_name_text', '驗收廠商C'
  )
),
(
  '66666666-6666-4666-8666-666666666663',
  '55555555-5555-4555-8555-555555555553',
  '99999999-9999-4999-8999-999999999999',
  1,
  jsonb_build_object(
    'title', '展示架主體製作與進場',
    'requirement_text', '含主體製作、現場安裝、拆除回收。',
    'amount', '20210',
    'vendor_name_text', '驗收廠商C'
  )
);

insert into financial_reconciliation_groups (
  id, project_id, source_type, vendor_name, reconciliation_status, vendor_id
) values
(
  'bbbbbbb1-bbbb-4bbb-8bbb-bbbbbbbbbbb1',
  '11111111-1111-4111-8111-111111111111',
  '設計',
  '驗收廠商C',
  '已對帳',
  '77777777-7777-4777-8777-777777777777'
),
(
  'bbbbbbb1-bbbb-4bbb-8bbb-bbbbbbbbbbb2',
  '11111111-1111-4111-8111-111111111111',
  '備品',
  '驗收廠商C',
  '已對帳',
  '77777777-7777-4777-8777-777777777777'
),
(
  'bbbbbbb1-bbbb-4bbb-8bbb-bbbbbbbbbbb3',
  '11111111-1111-4111-8111-111111111111',
  '廠商',
  '驗收廠商C',
  '已對帳',
  '77777777-7777-4777-8777-777777777777'
)
on conflict (id) do update set
  project_id = excluded.project_id,
  source_type = excluded.source_type,
  vendor_name = excluded.vendor_name,
  reconciliation_status = excluded.reconciliation_status,
  vendor_id = excluded.vendor_id,
  updated_at = now();

insert into financial_quotation_imports (
  id, project_id, file_name, imported_at, note, is_active, total_amount
) values (
  'aaaaaaa1-aaaa-4aaa-8aaa-aaaaaaaaaaa1',
  '11111111-1111-4111-8111-111111111111',
  'formal-acceptance-sample.xlsx',
  '2026-04-16T10:30:00+08:00',
  'formal acceptance sample quotation import',
  true,
  43210
)
on conflict (id) do update set
  project_id = excluded.project_id,
  file_name = excluded.file_name,
  imported_at = excluded.imported_at,
  note = excluded.note,
  is_active = excluded.is_active,
  total_amount = excluded.total_amount,
  updated_at = now();

insert into financial_quotation_line_items (
  id, quotation_import_id, sort_order, category, item_name, description, quantity, unit, unit_price, line_amount, remark
) values
(
  'ccccccc1-cccc-4ccc-8ccc-ccccccccccc1',
  'aaaaaaa1-aaaa-4aaa-8aaa-aaaaaaaaaaa1',
  1,
  '設計',
  'POP / 價卡正式輸出方案',
  '正式驗收設計項',
  1,
  '式',
  12000,
  12000,
  'design confirmation sample'
),
(
  'ccccccc1-cccc-4ccc-8ccc-ccccccccccc2',
  'aaaaaaa1-aaaa-4aaa-8aaa-aaaaaaaaaaa1',
  2,
  '備品',
  '展示架五金正式採購方案',
  '正式驗收備品項',
  1,
  '式',
  11000,
  11000,
  'procurement confirmation sample'
),
(
  'ccccccc1-cccc-4ccc-8ccc-ccccccccccc3',
  'aaaaaaa1-aaaa-4aaa-8aaa-aaaaaaaaaaa1',
  3,
  '廠商',
  '展示架主體製作與進場',
  '正式驗收廠商項',
  1,
  '式',
  20210,
  20210,
  'vendor confirmation sample'
)
on conflict (id) do update set
  quotation_import_id = excluded.quotation_import_id,
  sort_order = excluded.sort_order,
  category = excluded.category,
  item_name = excluded.item_name,
  description = excluded.description,
  quantity = excluded.quantity,
  unit = excluded.unit,
  unit_price = excluded.unit_price,
  line_amount = excluded.line_amount,
  remark = excluded.remark,
  updated_at = now();

commit;
