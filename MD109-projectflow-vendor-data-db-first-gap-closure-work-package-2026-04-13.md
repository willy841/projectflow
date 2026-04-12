# MD109 — projectflow vendor data DB-first gap-closure work package (2026-04-13)

> Status: ACTIVE
> Note: 本文件是 `MD108` 的 Batch 1 正式施工單。目標不是重做 Vendor Data，而是依 `MD105` 已拍板的使用情境，對照現有 repo 與既有 DB / read-model / write-path 現況做盤點，並沿現有主線補完 same-source closure 與缺失功能。


## 1. 本批定位

本批是：
> **現況盤點 + gap closure + DB-first 收口**

不是：
- 重做 Vendor Data
- 重開一套新資料模型
- 重寫整頁 UI
- 推翻目前 quote-cost / vendor / closeout 已存在的 financial spine

正式原則：
> **以現有程式架構與既有 DB 為基底，沿已存在主線收口，而不是另起爐灶。**

---

## 2. 本批目標

依 `MD105-projectflow-vendor-data-usage-scenario-alignment-summary-2026-04-13.md`，把 Vendor Data 這條目前 high-risk partial DB-first 區塊，收斂成：
- vendor master same-source
- vendor detail same-source
- unpaid / paid / history / inline document-layer readback same-source
- 搜尋 / 排序 / 工種管理與付款狀態具正式來源與寫入路徑

---

## 3. 對應產品基準

本批主要依據：
1. `MD-MASTER-projectflow-system-source-of-truth.md`
2. `MD-INDEX-projectflow-status-board-2026-04-12.md`
3. `MD105-projectflow-vendor-data-usage-scenario-alignment-summary-2026-04-13.md`
4. `MD104-projectflow-quote-cost-line-usage-scenario-alignment-summary-2026-04-13.md`
5. `MD103-projectflow-vendor-line-usage-scenario-alignment-summary-2026-04-13.md`
6. 視需要回查：
   - `MD64-projectflow-vendor-data-unpaid-zone-partial-reconciliation-rule-2026-04-11.md`
   - `MD65-projectflow-vendor-data-detail-action-vs-archive-semantics-2026-04-12.md`
   - `MD66-projectflow-vendor-data-detail-validation-refresh-2026-04-12.md`

---

## 4. 本批範圍

### 4.1 Vendor Data list
要盤與補的點：
1. vendor master list source
2. 卡片欄位來源：
   - vendor name
   - trade
   - unpaid total
3. 頁面級 unpaid total 來源
4. 搜尋 / 篩選 / status filter 是否吃同一來源
5. 工種管理（create / edit / delete）與 vendor 綁定關係

### 4.2 Vendor Data detail — profile / labor-report
要盤與補的點：
1. vendor profile 欄位 write path：
   - contact / phone / email / line / address / bank / account-name / account-number
2. labor-report tab 欄位 write path：
   - name / id / birthday-roc / union-membership
3. 是否與 vendor 主體同源
4. 是否已有正式 DB 欄位；若無，需判斷是補欄位還是補 read-model adapter

### 4.3 Vendor Data detail — unpaid projects
要盤與補的點：
1. vendor unpaid source 是否 truly 來自 quote-cost reconciliation `已對帳`
2. unpaid project list 是否以 `project × vendor` 為正式單位
3. unpaid amount 是否只吃：
   - design
   - procurement
   - vendor
   並明確排除 `manual labor`
4. `已付款` write path 是否正式改變付款狀態，而不是 UI 假勾選

### 4.4 Vendor Data detail — history / ledger
要盤與補的點：
1. `未結帳` / `過往紀錄` tab 分流來源
2. 每筆紀錄顯示：
   - project title
   - activity date
3. inline expand 內容是否 truly 來自 document-layer retained items
4. 展開內容是否 read-only
5. 搜尋 / 排序能力是否建在正式查詢層，而不是前端臨時拼接

---

## 5. 本批不做什麼

這批明確不做：
1. 不重開 `Accounting Center`
2. 不處理首頁本月金額對接
3. 不重開 payable lifecycle v1 spec
4. 不重做 quote-cost 主體
5. 不把 Vendor Data 做成全新大頁重寫
6. 不在本批處理 closeout list slow / timeout
7. 不做複雜 CRM / 多重身份類型重構
8. 不做多選工種；工種目前仍維持單選規則

---

## 6. 現況盤點必做清單

正式開改前，先盤以下現況：

### 6.1 Repo / component / route 盤點
至少盤：
- `vendors` list page route 與主要 client component
- `vendors/[id]` detail route 與主要 shell/client component
- vendor store / adapter / read-model / local fallback 現況
- 與 quote-cost / reconciliation / payment-status 有關的共用層

### 6.2 DB / read-model 盤點
至少盤：
- vendor master 現有資料表 / read path
- trade / 工種是否已有正式來源
- payment-status / unpaid amount 是否已有 DB 真值欄位或正式關聯可讀
- history / document-layer readback 是否已有正式來源

### 6.3 同源性盤點
逐項判斷：
1. 現在 list 與 detail 是不是同源
2. unpaid total 與 quote-cost `已對帳` 結果是不是同源
3. history inline 展開內容與 document-layer 是不是同源
4. 搜尋 / 排序是不是在正式資料上做，而不是 seed/fallback 上做

---

## 7. 建議實作順序（本批內部）

### Step 1 — source map audit
先畫出 Vendor Data 現況來源圖：
- list source
- detail source
- unpaid source
- history source
- payment write path
- trade source

### Step 2 — vendor master / trade closure
先把：
- vendor name
- trade
- profile
- labor-report
這條主檔線收同源

### Step 3 — unpaid / payment-status closure
再收：
- project × vendor unpaid
- `已付款` 寫回
- list unpaid total
- page unpaid total

### Step 4 — history / inline retained closure
最後收：
- 未結帳 / 過往紀錄
- inline expand document-layer readback
- 搜尋 / 排序

### Step 5 — actual validation
用真實頁面操作驗：
- vendor profile 編輯
- 工種管理
- unpaid -> paid
- history tab 分流
- inline 展開與 read-only
- quote-cost / vendor detail 數字對照

---

## 8. 驗收方式

本批驗收不得只做 code review。

### 必做驗收
1. frontend 實際操作 Vendor Data list / detail
2. 若有 profile / trade / paid-status 編輯，驗 DB 寫入
3. 若有 unpaid / history readback，驗 DB 真值與頁面一致
4. 驗 list / detail / quote-cost 之間是否 same-source
5. 驗搜尋 / 排序結果是否建立在正式來源上

### 驗收重點
- 不是「看起來對」
- 而是：
  - vendor master 對
  - trade 對
  - unpaid 對
  - history 對
  - paid/unpaid state 對
  - 展開內容對

---

## 9. 風險與注意事項

### 風險 1
Vendor Data 目前可能仍混有：
- 舊 helper
- local fallback
- quote-cost bridge cache
- partial reconciliation 視覺層拼接

### 風險 2
若 payment-status 與 unpaid amount 缺正式資料欄位，可能需要補最小 schema / relation，而不是只修前端。

### 風險 3
trade 管理若目前只有前端 catalog，而無正式 DB source，需先判斷本批是否補 DB 表 / 欄位，或暫用正式 adapter 邊界過渡。

### 風險 4
history inline 若目前直接從多來源拼裝，可能要先補 retained read-model，否則 same-source 無法成立。

### 原則提醒
- 盡量補 read-model / adapter / write-path closure
- 避免整頁重寫
- 避免一次順手重構太大

---

## 10. 影響檔案（待盤點後補實際清單）

本批高度可能涉及：
- `project-mgmt/src/app/vendors/...`
- `project-mgmt/src/components/vendor-*.tsx`
- `project-mgmt/src/lib/db/...vendor...`
- `project-mgmt/src/lib/db/...financial...`
- `project-mgmt/src/lib/...payment...`
- `project-mgmt/db/migrations/...`（若需補欄位 / relation）

正式規則：
- 開工後應把實際影響檔案補回本文件或後續 closure 文件

---

## 11. 完成定義

本批可視為完成，至少要同時達成：
1. Vendor Data list / detail 主資料與工種管理同源
2. unpaid / paid / history 狀態有正式來源與正式寫入路徑
3. quote-cost reconciliation 後的 vendor unpaid 可在 Vendor Data 正式 readback
4. history inline 展開內容與 document-layer retained items 同源且 read-only
5. 搜尋 / 排序建立在正式來源上
6. 已完成 frontend 實際操作 + DB truth validation
7. 已產出下一份 closure / validation handoff MD

---

## 12. 一句話總結

> 本批（MD109）的正確做法不是重做 Vendor Data，而是依 `MD105` 已拍板的使用情境，對照目前 repo 與既有 DB / read-model / write-path 現況做 source-map audit，然後沿現有主線補完 vendor master、trade、unpaid / paid、history / inline document-layer readback 的 same-source closure，並以實際前端操作與 DB 真值對照完成驗收。