# MD116 — projectflow upstream + execution lines write/read closure work package (2026-04-13)

> Status: ACTIVE  
> Batch: 4 / `MD108`  
> Note: 本文件作為 Batch 4 的正式施工單。依 `MD108`，本批主焦點是上游 + 三條執行線的 write/read closure，不回頭重開 Batch 1–3 已收口主線。

## 1. 目標

把上游到三條執行線的 write path / read path / confirm path / document path 收成 DB-first / same-source 主線：
1. project detail activity / customer / requirement communication writeback closure
2. execution tree / release / dispatch write path closure
3. design line confirm-all / overwrite semantics DB closure
4. procurement line confirm-all / overwrite semantics DB closure
5. vendor line project → vendor → tasks / document-layer closure
6. document-layer table / export same-source closure

---

## 2. 本批範圍

### A. upstream / project detail
- `/projects`
- `/projects/[id]`
- project master
- requirement communication
- execution tree / dispatch

### B. design line
- `/design-tasks`
- `/design-tasks/[id]`
- `/design-tasks/[id]/document`

### C. procurement line
- `/procurement-tasks`
- `/procurement-tasks/[id]`
- `/procurement-tasks/[id]/document`

### D. vendor line
- `/vendor-assignments`
- `/vendor-assignments/[id]`
- `/vendor-assignments/[id]/document`

---

## 3. 不做什麼

1. 不重做 Batch 1 vendor data
2. 不重做 Batch 2 quote-cost active financial spine
3. 不重做 Batch 3 closeout retained read-model
4. 不展開 Accounting Center
5. 不重做 quotation / collection / payable / closeout
6. 不大改已鎖定 UI 骨架

---

## 4. 現況盤點（source-map audit）

### 4.1 上游現況
- `projects` route / API 已存在
- `project-flow-adapter.ts` 已存在
- `execution-tree-section.tsx` / `project-detail-shell.tsx` 已存在

主要待驗：
1. project detail 上半區是否 truly DB-first
2. requirement communication 是否已有正式 DB read/write / timestamp / 排序 closure
3. execution dispatch write path 是否與下游三條線 truly same-source

### 4.2 設計線現況
- route / page / adapter / confirm API 已存在
- design line 已有「全部確認」主線

主要待驗：
1. `儲存` vs `全部確認` 是否真的分層
2. `全部確認` 是否為覆蓋式重送
3. 文件層與匯出是否 truly same-source
4. list → detail → document 欄位 readback 是否一致

### 4.3 備品線現況
- route / page / adapter / confirm API 已存在
- 邏輯應與設計線一致

主要待驗：
1. `儲存` vs `全部確認` 是否真的分層
2. 覆蓋式重送是否成立
3. 文件層與匯出是否 truly same-source
4. list → detail → document 欄位 readback 是否一致

### 4.4 廠商線現況
- route / page / adapter / confirm API 已存在
- `project → vendor → tasks` 主體切法已拍板

主要待驗：
1. project × vendor grouping 是否 truly same-source
2. detail 是否已不再重填 vendor
3. `全部確認` 是否承接 document layer / package / financial truth
4. 文件層背景資訊與內容是否 truly same-source
5. 主按鈕命名是否仍殘留 `全部確認並前往最終文件頁`

---

## 5. 實作方案

### 5.1 upstream project detail write/read closure
1. 盤 `project detail` 上半區欄位的 DB read/write path
2. 若 requirement communication 尚未正式 DB 化，先補 API / readback / timestamp / sort
3. 確認 `/projects` 與 `/quote-costs` 對同一 project source 的承接一致

### 5.2 execution dispatch write path closure
1. 盤 execution dispatch API 與三條線 adapter 的來源銜接
2. 確保從 execution tree 發出的任務在 design / procurement / vendor 三條線可 same-source 承接

### 5.3 design line confirm-all / overwrite semantics closure
1. 確認 `儲存` 不會提前污染正式層
2. 確認 `全部確認` 才是正式成立點
3. 確認重新 `全部確認` 會覆蓋舊金額 / 廠商 / 文件
4. 文件表格與匯出需承接同一份正式資料

### 5.4 procurement line confirm-all / overwrite semantics closure
- 與 design line 同規格收口

### 5.5 vendor line project → vendor → tasks / document-layer closure
1. 確認 project × vendor grouping 真正成立
2. detail 不再重新定義 vendor
3. 主按鈕語意改回 `全部確認`
4. 文件層只允許修改項目名稱 / 需求內容，不可改金額
5. project context background info same-source 承接

### 5.6 document-layer table / export same-source closure
1. design / procurement document table 與 export 同源
2. vendor document-layer / copy content 同源
3. 不接受 view-only fallback 組裝結果當正式匯出資料

---

## 6. 驗收方式

本批固定驗收標準：
> **實際 frontend 操作 + backend DB truth comparison**

### 最低驗收項
1. project detail 上半區 writeback / reload PASS
2. requirement communication create / update / sort / timestamp PASS
3. execution dispatch -> design/procurement/vendor readback PASS
4. design 全部確認覆蓋式重送 PASS
5. procurement 全部確認覆蓋式重送 PASS
6. vendor line grouping / confirm / document-layer PASS
7. document table / export same-source PASS

---

## 7. 風險

1. `project detail` / `execution-tree-section` 為歷史高風險區，必須遵守既有工程禁則
2. 三條線確認語意相似，但中間主體不同，若抽象錯誤容易混線
3. document-layer / export 很容易表面上可看、實際仍吃 fallback
4. 若同時動 upstream 與三條線太多點，容易 context 爆掉；本批需分段收口

---

## 8. 影響檔案（預估）

### Routes / APIs
- `project-mgmt/src/app/api/projects/*`
- `project-mgmt/src/app/api/design-tasks/*`
- `project-mgmt/src/app/api/procurement-tasks/*`
- `project-mgmt/src/app/api/vendor-tasks/*`

### DB / adapters
- `project-mgmt/src/lib/db/project-flow-adapter.ts`
- `project-mgmt/src/lib/db/design-flow-adapter.ts`
- `project-mgmt/src/lib/db/procurement-flow-adapter.ts`
- `project-mgmt/src/lib/db/vendor-flow-adapter.ts`
- `project-mgmt/src/lib/db/phase1-repositories.ts`

### Components
- `project-mgmt/src/components/project-detail-shell.tsx`
- `project-mgmt/src/components/execution-tree-section.tsx`
- `project-mgmt/src/components/design-plan-editor-client.tsx`
- `project-mgmt/src/components/procurement-plan-editor-client.tsx`
- `project-mgmt/src/components/vendor-assignment-detail.tsx`

---

## 9. 一句話總結

> Batch 4 的正式任務，是把上游 project detail 與 design / procurement / vendor 三條執行線收成真正的 DB-first / same-source 主線：先固定 project 主檔與需求溝通的 write/read closure，再確認 execution dispatch 能同源承接到三條線，接著把 design / procurement 的 `儲存 vs 全部確認`、覆蓋式重送、文件層 / 匯出同源，以及 vendor line 的 `project × vendor grouping`、`全部確認`、文件層背景資訊與內容同源，一次收進正式驗收軌道。