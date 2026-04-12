# MD112 — projectflow quote-cost reconciliation / payable / closeout ingress work package (2026-04-13)

> Status: ACTIVE  
> Batch: 2 / `MD108`  
> Note: 本文件作為 Batch 2 的正式施工單。依 `MD108`，本批先做 source-map audit，再進 DB / route / adapter / write-path closure；Vendor Data Batch 1 視為依賴邊界，不重做、不打散。

## 1. 目標

把 `quote-cost detail` 目前最關鍵的 financial spine 收成可正式驗收的 DB-first / same-source 主線，並補齊 `closeout ingress`。

本批固定目標：
1. quotation / receivable readback closure
2. collection write/read closure
3. design / procurement / vendor / manual cost buckets same-source closure
4. reconciliation groups item-level visibility closure
5. `已對帳` -> vendor unpaid source closure 再確認
6. closeout gating button / state / write path 補齊
7. 移除 `最終文件內容` 冗餘區塊

---

## 2. 本批範圍

### A. quote-cost list / detail
- `/quote-costs`
- `/quote-costs/[id]`
- 對應 component / presenter / adapter / API

### B. closeout ingress
- `quote-cost detail` 內的結案 gating 與寫入
- `quote-cost -> closeout` 的狀態切換與路由承接
- `closeout detail` 需正確承接該 ingress 寫入結果

### C. 直接依賴邊界
- Vendor Data Batch 1 已完成的 vendor profile / payment relation / unpaid foundation
- Vendor Data 只作 payable readback 邊界，不重做 Batch 1

---

## 3. 不做什麼

1. 不重做 Vendor Data Batch 1
2. 不把 Vendor Data 再拆成新一輪大改
3. 不重開 month close aggregation
4. 不重開 Accounting Center Phase A
5. 不重做 quotation schema/read-model 主線
6. 不先展開 Excel 欄位 mapping 定稿
7. 不處理 closeout retained read-model / performance closure（留給 Batch 3）
8. 不做 upstream / design / procurement / vendor lines 的大規模 write-path 補完（留給 Batch 4）

---

## 4. 現況盤點（source-map audit）

### 4.1 Route 現況

已存在：
- `src/app/quote-costs/page.tsx`
- `src/app/quote-costs/[id]/page.tsx`
- `src/app/closeout/page.tsx`
- `src/app/closeout/[id]/page.tsx`
- `src/app/closeouts/*` 目前主要作 redirect alias

判讀：
- `quote-cost` 與 `closeout` route 已存在
- `closeout ingress` 目前主要缺的是正式 write path，而不是 route 骨架

### 4.2 DB / adapter 現況

已存在：
- `financial-flow-adapter.ts`
- `quotation-read-model.ts`
- `closeout-detail-read-model.ts`
- `vendor-financial-adapter.ts`
- `financial-reconciliation-groups.ts`
- `project_collection_records`
- `financial_reconciliation_groups`
- `project_vendor_payment_records`
- `financial_quotation_imports`
- `financial_quotation_line_items`

判讀：
- quotation read-model schema 已存在
- collection table 已存在
- reconciliation groups table 已存在
- vendor payment relation foundation 已在 Batch 1 補上 `vendor_id`
- 本批不是從 0 到 1，而是從 partial same-source 收到正式可驗收

### 4.3 Quote-cost detail 現況

目前已看見的 gap：

#### A. quotation / receivable
- summary 卡已用 `state.quotationItems` 計算 `應收總金額`
- 但是否完全只吃 DB read-model，仍需 source-map 確認
- `quote-costs list` 的 `已上傳 / 未上傳` 雖存在，但 same-source 需再驗

#### B. collection
- create / delete 已走 API：
  - `POST /api/accounting/projects/[id]/collections`
  - `DELETE /api/accounting/collections/[id]`
- page server props 直接 query `project_collection_records`
- 目前 read / write 主線已存在，但需做正式驗收與 closeout 承接檢查

#### C. cost buckets
- `financial-flow-adapter.ts` 已組 design / procurement / vendor / manual buckets
- 但仍存在 fixture / seed fallback 邊界
- 需確認 detail / list / closeout 是否 truly same-source 承接同一份 bucket result

#### D. reconciliation groups
- 目前群組 UI 只有 group card，尚未把 item-level 明細真正展開給使用者核對
- `sync` API 目前採 delete-all + reinsert
- DB table 只存 `project_id + source_type + vendor_name + status`
- item-level visibility 目前主要還在 adapter 組裝層

#### E. vendor unpaid source
- `quote-cost detail` 的 vendor payment summary 目前用 `vendor_name` 聚合 paid rows，並用 `已對帳` groups 累加 payable
- `vendor-financial-adapter.ts` 目前仍以 `vendorName` 匹配 reconciliation groups
- Batch 1 已補 `project_vendor_payment_records.vendor_id`，但 quote-cost / vendor unpaid spine 仍需再確認 identity 邊界

#### F. closeout ingress
- UI 目前仍是 `手動結案`
- gating 條件目前只看：
  - `quotationImported`
  - `costItems.length > 0`
  - `derivedReconciliationStatus === 已完成`
- 尚未正式納入 `未收款 = 0`
- 目前只是 client state 切換為 `已結案`，沒有 DB write path

#### G. UI 冗餘
- header 仍顯示 `客戶`
- status 區仍有 `返回列表` CTA
- `最終文件內容` 區塊仍存在，與 `MD104` 衝突

---

## 5. 實作方案

### 5.1 quotation / receivable readback closure

1. 盤 `quote-cost list` 與 `detail` 的 quotation imported / total 來源
2. 確認 `financial-flow-adapter` 與 `quotation-read-model` 的 source priority
3. 補齊 detail / list / closeout 同源承接
4. 若仍有 fixture fallback 直接滲進 active path，需收斂或明確降階

### 5.2 collection write/read closure

1. 保留既有 `project_collection_records` API 路徑
2. 驗證 create / delete / reload / summary card / closeout readback 全鏈一致
3. 補必要測試，固定 `已收款 / 未收款` 計算 readback

### 5.3 cost buckets same-source closure

1. 盤 design / procurement / vendor / manual 四桶在 list / detail / closeout 的實際來源
2. 降低 active path 中 seed / fixture 直接混用風險
3. 固定同一 project 在 active / closed 兩視角下使用同一份正式 financial bucket 主線

### 5.4 reconciliation groups item-level visibility closure

1. 在 `quote-cost detail` 補 item-level 展開能力
2. 每組至少可看到：
   - source type
   - item name
   - source summary
   - vendor
   - amount
3. 維持 group-level confirm，不把本批擴成逐 item 對帳寫入模型

### 5.5 `已對帳` -> vendor unpaid source closure 再確認

1. 盤 `quote-cost detail`、`vendor-financial-adapter`、`vendor-directory-adapter` 的 payable spine
2. 確認本批至少達成：
   - payable 由 `已對帳` groups 正式成立
   - payment readback 可承接 `vendor_id` foundation
3. 若本批無法把 reconciliation group identity 全升為 `vendor_id`，至少固定相容邊界與風險說明

### 5.6 closeout gating / state / write path closure

1. 補正式 closeout action API
2. gating 必須至少符合：
   - `未收款 = 0`
   - `全部對帳完畢`
3. DB write path 必須把 project 正式寫成 closed state
4. `quote-costs list` / `closeout list` / `closeout detail` 必須讀得到該狀態變更
5. 不再接受 client-only `手動結案` 假 closure

### 5.7 移除 `最終文件內容`

1. 從 `quote-cost detail` active path 移除整塊冗餘區
2. 若其內人工成本編輯仍有必要，需拆回成本管理正式區，不可掛在冗餘 archive 區名下
3. closeout retained semantics 若仍需 archive content，留待 Batch 3 正式化

---

## 6. 驗收方式

本批固定驗收標準：
> **實際 frontend 操作 + backend DB truth comparison**

### 最低驗收項
1. quotation readback
   - active detail / closeout detail / list 一致
2. collection create + delete
   - frontend card / table 更新
   - DB 真值一致
3. reconciliation confirm
   - group status 寫入 DB
   - vendor unpaid readback 承接一致
4. closeout gating
   - 條件未滿足前不得結案
   - 條件滿足後可結案
   - DB project status 改變
   - 案件自 active list 移出並進 closeout list

### 驗收方法建議
- Playwright + DB probe
- 必要時 direct SQL compare
- 不接受 code-only review 當完成

---

## 7. 風險

1. `vendorName` 仍是 reconciliation 與 payable spine 的重要相容鍵
2. `financial-flow-adapter` 仍有 fixture fallback 邊界，若 query fail 容易回退
3. `closeout` 與 `/closeouts` 目前仍有 alias / redirect 過渡層，續接時要注意實際入口
4. 人工成本目前與 `最終文件內容` 區塊糾纏，拆法若不小心，容易把 manual write path 弄壞

---

## 8. 影響檔案（預估）

### Routes / APIs
- `project-mgmt/src/app/quote-costs/[id]/page.tsx`
- `project-mgmt/src/app/api/accounting/projects/[id]/collections/route.ts`
- `project-mgmt/src/app/api/accounting/collections/[id]/route.ts`
- `project-mgmt/src/app/api/financial-projects/[id]/reconciliation-groups/sync/route.ts`
- `project-mgmt/src/app/api/financial-projects/[id]/closeout/route.ts`（預計新增）

### DB / adapters
- `project-mgmt/src/lib/db/financial-flow-adapter.ts`
- `project-mgmt/src/lib/db/quotation-read-model.ts`
- `project-mgmt/src/lib/db/closeout-detail-read-model.ts`
- `project-mgmt/src/lib/db/vendor-financial-adapter.ts`
- `project-mgmt/src/lib/db/vendor-directory-adapter.ts`

### Components
- `project-mgmt/src/components/quote-cost-detail-client.tsx`
- `project-mgmt/src/components/quote-cost-list-client.tsx`
- `project-mgmt/src/components/closeout-detail-client.tsx`
- `project-mgmt/src/components/closeout-list-client.tsx`
- `project-mgmt/src/components/quote-cost-detail-presenter.ts`

### Tests
- `project-mgmt/tests/*quote-cost*`
- `project-mgmt/tests/*closeout*`
- 必要時新增 batch2 專用驗收 spec

---

## 9. 一句話總結

> Batch 2 的正式任務不是重做 quote-cost，而是在既有 quotation / collection / reconciliation / vendor payable / closeout 基礎上，先完成 source-map audit，再把 active financial spine 收成可正式驗收的 same-source 主線：收齊 quotation / receivable、collection、四個 cost buckets、對帳群組明細可視、`已對帳 -> vendor unpaid` 承接，以及真正的 closeout gating 與 DB write path，並同時移除 `最終文件內容` 這塊已被產品定義判定為冗餘的區塊。