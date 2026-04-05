# Phase 1 DAL skeleton

這一層目前已進到 **types + runtime client + repositories + 最小 service layer**。

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
- `phase1-services.ts`

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
  - `designTaskPlans.listByTask`
  - `procurementTaskPlans.listByTask`
  - `vendorTaskPlans.listByTask`
  - `taskConfirmations.listByTask`
- 已實作第一批 write path：
  - `projects.insert/update`
  - `vendors.insert/update`
  - `executionItems.insert/update`
  - `designTasks.insert/update`
  - `procurementTasks.insert/update`
  - `vendorTasks.insert/update`
  - `designTaskPlans.insert/update`
  - `procurementTaskPlans.insert/update`
  - `vendorTaskPlans.insert/update`
  - `taskConfirmations.insert`
  - `taskConfirmations.insertSnapshot`
- 已補最小 workflow service layer：
  - publish design/procurement/vendor task
  - save design/procurement/vendor plan
  - confirm design/procurement/vendor task plans

## 目前意義
這表示 Phase 1 已不只停在 task 主表 read/write，而是已具備：
- live plan 正式資料承接
- 全部確認 -> confirmation row
- snapshot rows 建立

## 下一步
1. 補最小 integration test / smoke script for repo + service layer
2. 先挑設計線，把前端從 mock source 切到正式 DB service
3. 再把設計文件頁改為讀 confirmation snapshot
4. 設計線驗通後，再複製模式到備品線
