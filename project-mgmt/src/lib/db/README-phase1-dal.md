# Phase 1 DAL skeleton

這一層目前已進到 **types + runtime client + 第一批 read/write repositories**。

## 目的
- 讓 DB Phase 1 不停在 migration 檔案
- 先把 app 端會依賴的資料介面站穩
- 先接最小 PostgreSQL runtime，不打開 ORM 選型支線

## 檔案
- `phase1-types.ts`
- `phase1-inputs.ts`
- `phase1-client.ts`
- `phase1-sql.ts`
- `phase1-repositories.ts`

## 目前狀態
- 已對齊 migration tables 與主要欄位
- 已定義 insert / update input types
- 已接 `pg` runtime client
- 已實作第一批 read path：
  - `projects.findById`
  - `projects.list`
  - `vendors.findById`
  - `vendors.findByNormalizedName`
  - `vendors.list`
  - `executionItems.listByProject`
  - `designTasks.listByProject`
  - `designTasks.findById`
  - `procurementTasks.listByProject`
  - `procurementTasks.findById`
  - `vendorTasks.listByProject`
  - `vendorTasks.listByProjectAndVendor`
  - `vendorTasks.findById`
  - `taskConfirmations.listByTask`
- 已實作第一批 write path：
  - `projects.insert/update`
  - `vendors.insert/update`
  - `executionItems.insert/update`
  - `designTasks.insert/update`
  - `procurementTasks.insert/update`
  - `vendorTasks.insert/update`
- plans / confirmations / snapshot writes 仍維持 skeleton

## 下一步
1. 補 plans read/write path
2. 補 confirmations / snapshot writes
3. 補最小 service layer，封裝「任務發布 -> task 主表」流程
4. 最後才把 app 某些 mock data source 改為可切換 DB read path
