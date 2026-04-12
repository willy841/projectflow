# MD114 — projectflow closeout retained read-model / performance work package (2026-04-13)

> Status: ACTIVE  
> Batch: 3 / `MD108`  
> Note: 本文件作為 Batch 3 的正式施工單。依 `MD108`，本批主焦點是 closeout retained read-model / performance closure，不回頭重開 Batch 2，也不混進上游與執行線大改。

## 1. 目標

把 `closeout` 收成真正的 retained archive：
1. closeout list read-model 專用化
2. 年份 / 搜尋 / 排序 closure
3. list 欄位 retained summary closure
4. 移除冗餘 badge / note / active-operation 殘留
5. detail retained context + retained financial summary closure
6. retained cost tabs 讀 final document-layer / final cost layer
7. 降低 closeout list 慢 / timeout 風險

---

## 2. 本批範圍

### A. closeout list
- `/closeout`
- `/closeouts` redirect / alias 邊界
- closeout archive list 的 server read-model / list UI

### B. closeout detail
- `/closeout/[id]`
- closeout retained detail read-model
- retained presenter / retained-only UI 收斂

### C. 直接依賴
- Batch 2 已完成 closeout ingress write path
- `已結案` project 現在可由正式 DB write path 寫入

---

## 3. 不做什麼

1. 不重做 Batch 2 的 quote-cost active financial spine
2. 不重做 Vendor Data Batch 1 / Batch 2 payable 邏輯
3. 不做 Accounting Center 主線
4. 不重開 quotation import schema / mapping
5. 不重做上游 / design / procurement / vendor line write path
6. 不把本批擴成 closeout 與 Accounting Center 聯合聚合工程

---

## 4. 現況盤點（source-map audit）

### 4.1 closeout list 現況

目前：
- `getCloseoutArchiveProjects()` 直接呼叫 `getQuoteCostProjectsWithDbFinancials()`
- 再於 adapter 結果上用 `projectStatus === 已結案` 過濾
- `CloseoutListClient` 前端再做年份 / 搜尋 / 排序 / 分頁

判讀：
- list 現在不是專用 retained read-model
- 它先吃整份 active financial project payload，再做 archive 篩選
- 這很可能就是慢 / timeout 的主要原因之一

### 4.2 closeout detail 現況

目前：
- `CloseoutDetailClient` 直接包 `QuoteCostDetailClient`
- `closeout-detail-read-model.ts` 仍回傳：
  - `archiveProject`
  - `archiveCollections`
  - `archiveVendorPayments`
- presenter 雖改成 retained mode，但 UI 主骨架仍高度沿用 active quote-cost detail

判讀：
- retained mode 雖存在，但 active-operation skeleton 殘留仍重
- `收款留存` / `廠商付款狀態` / `對外報價單明細` 等 active financial detail 元件仍被帶入
- 與 `MD106` 要求不完全吻合

### 4.3 與 `MD106` 的主要差距

依 `MD106`，closeout：
- list 應只顯示 retained summary
- detail 應保留 project context + final financial summary + 四個 read-only tabs
- 不應再保留：
  - 收款管理
  - 對外報價單整體明細
  - 流程狀態
  - 冗餘 badge / note

目前 gap：
1. list 還有 `對帳狀態 / 結案狀態 / 留存備註`
2. detail 仍保留收款 / vendor payment / quotation 明細主區
3. read-model 還不是 closeout 專用的 retained payload

---

## 5. 實作方案

### 5.1 closeout list 專用 read-model

新增 closeout archive list read-model，原則：
- query closed projects only
- 只回傳 list 真正需要的欄位
- 直接在 server 層做：
  - 年份欄位支援
  - 基本 financial summary
- 避免整份 active costItems / quotationItems payload 先拉回再前端重算

### 5.2 closeout list retained summary closure

list UI 收斂為：
- 活動標題
- 活動日期
- 客戶名稱
- 對外報價總額
- 專案成本
- 毛利

移除：
- `已完成` / `已結案` badge
- `留存備註`
- 不必要 active financial badges

### 5.3 closeout detail retained read-model

新增 / 收斂 detail read-model，只保留：
- project context
- final financial summary
- retained cost tabs data

移除 active-only payload：
- collection table 主區
- vendor payment active summary 主區
- quotation detail table 主區
- active reconciliation / closeout control 區

### 5.4 retained presenter / retained-only rendering

做法以最小破壞優先：
- 若能在既有 `QuoteCostDetailClient` 內以 retained mode 強力裁切，就先裁切
- 若骨架耦合過高，再拆 retained-only closeout detail component

### 5.5 performance closure

至少達成：
1. closeout list 不再拉整份 active financial payload
2. server query 降成 closeout list summary 級別
3. closeout detail query 只取 retained 必要欄位

---

## 6. 驗收方式

本批固定驗收標準：
> **實際 frontend 操作 + backend DB truth comparison**

### 最低驗收項
1. closeout list 可正常讀取，不再 timeout
2. 年份 / 搜尋 / 排序正常
3. list 僅顯示 retained summary 欄位
4. detail 不再顯示 active-operation 區塊
5. detail 保留 final summary + read-only four tabs
6. financial summary 與 DB truth 對得上

---

## 7. 風險

1. 現有 closeout detail 與 `QuoteCostDetailClient` 耦合很深，拆法要小心避免回傷 Batch 2
2. 若 list read-model 與 detail read-model 分太開，命名與欄位語意要一致
3. 若 retained tabs 目前底層仍吃 active costItems payload，可能需要做 retained projection，而不是直接沿用

---

## 8. 影響檔案（預估）

### DB / read-model
- `project-mgmt/src/lib/db/closeout-archive-source.ts`
- `project-mgmt/src/lib/db/closeout-detail-read-model.ts`
- `project-mgmt/src/lib/db/closeout-list-read-model.ts`（預計新增）

### Components
- `project-mgmt/src/components/closeout-list-client.tsx`
- `project-mgmt/src/components/closeout-detail-client.tsx`
- `project-mgmt/src/components/quote-cost-detail-client.tsx`（若 retained mode 仍沿用）

### Routes
- `project-mgmt/src/app/closeout/page.tsx`
- `project-mgmt/src/app/closeout/[id]/page.tsx`

### Tests
- `project-mgmt/tests/*closeout*`

---

## 9. 一句話總結

> Batch 3 的正式任務，不是再碰 active quote-cost，而是把 closeout 真的收成 archive / retained record：先做 closeout list 專用 read-model，避免先拉整份 active financial payload 再前端過濾；再把 closeout detail 從 active quote-cost skeleton 中脫鉤，只保留 project context、final financial summary 與四個 read-only 成本 retained tabs，同時把 `MD106` 已判定為不該存在的 active-operation 區塊與冗餘 badge / note 從 closeout 視角拔掉。