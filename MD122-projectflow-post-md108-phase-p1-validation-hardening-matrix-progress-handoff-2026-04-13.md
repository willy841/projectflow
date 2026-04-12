# MD122 — projectflow post-MD108 Phase P1 validation hardening matrix progress handoff (2026-04-13)

> Status: ACTIVE / HANDOFF  
> Phase: post-MD108 / Phase P1  
> Role: 記錄 `MD121` 啟動後，五條固定主線的第一輪正式實查、驗收腳本落地結果、已確認缺口與下一步建議。  
> Important: 本文件不是 closure signoff；是 Phase P1 第一輪 validation hardening 實查 handoff。

---

## 1. 本輪目標

依 `MD121`，本輪固定範圍為：

1. design line end-to-end confirmation overwrite validation
2. procurement line end-to-end confirmation overwrite validation
3. vendor grouping / package / document-layer end-to-end validation
4. quote-cost collection / reconciliation / closeout 完整 e2e 補齊
5. closeout retained read-model query timing baseline

固定規則：
- 本批是 post-MD108 / Phase P1
- 不回頭重開 `MD108 Batch 1–4`
- 先做 source-map audit，再驗收
- 驗收必須包含 frontend 操作 + backend DB truth comparison
- 每條主線至少碰一個 overwrite / stale-data / retained-readback 驗證點

---

## 2. 本輪已新增的正式驗收檔

已新增：
- `project-mgmt/tests/design-confirm-overwrite-e2e.spec.ts`
- `project-mgmt/tests/procurement-confirm-overwrite-e2e.spec.ts`
- `project-mgmt/tests/vendor-group-package-document-e2e.spec.ts`
- `project-mgmt/tests/quote-cost-full-chain-e2e.spec.ts`

這些檔案目前的角色是：
> **把 Phase P1 的正式驗收面拉出來，並透過失敗點定位目前真正尚未 closure 的 hardening gap。**

---

## 3. 五條主線目前狀態

### 3.1 design line overwrite validation

#### 已完成
- 已找到正式 DB task id：
  - `65697caf-1bc8-4646-9fe4-0cc4e5621699`
- 已確認：
  - `全部確認` 會走正式 API
  - DB 會寫 `task_confirmations`
  - DB 會寫 `task_confirmation_plan_snapshots`
  - document 頁會讀 latest confirmation snapshot 優先
- 已建立 overwrite e2e 驗收腳本

#### 實查發現
- 測試過程中曾發現欄位 index 誤判，已排除
- 但整體 confirm / snapshot 驗收鏈仍未穩定 closure
- 已觀察到 confirmation_no 確實會增加，但測試層對最新 confirmation 抓取不穩
- 此條線目前仍需再確認：
  1. UI 提交成功時序
  2. redirect / refresh 與最新 confirmation readback 對齊
  3. Playwright poll / DB query 稳定抓取策略

#### 目前判斷
- design 主功能不是完全不存在
- **缺的是 overwrite confirmation 的正式驗收穩定性**

---

### 3.2 procurement line overwrite validation

#### 已完成
- 已找到正式 DB task id：
  - `a2bbb2c4-23b7-4331-a327-25976c072480`
- 已建立 overwrite e2e 驗收腳本
- 已做 DB 實查

#### DB truth 已確認
- `confirmation_no` 已確實增加
- latest snapshot 已正確寫入：
  - `title`
  - `vendor_name_text`
- overwrite 寫入主線成立

#### 實查發現
- 現階段主要不是功能本身失效
- 而是 Playwright 驗收腳本對最新 confirmation 的穩定抓取方式仍需硬化

#### 目前判斷
- procurement 這條相較 design 更接近可 closure
- **目前缺口主要在驗收 harness，而不是 DB write truth 本身**

---

### 3.3 vendor grouping / package / document-layer validation

#### 已完成
- 已找到正式 DB task / project / vendor：
  - task id: `88888888-8888-4888-8888-888888888888`
  - project id: `11111111-1111-4111-8111-111111111111`
  - vendor id: `77777777-7777-4777-8777-777777777777`
- 已建立 vendor group -> package 驗收腳本
- 已確認可進入 group 頁並操作

#### 已確認風險點
- vendor group route id 不是 `::`
- 正式格式是：
  - `projectId~vendorId`
- route format 若判錯，會直接 404

#### 實查發現
- 正確 route 可進入 group page
- 可儲存、可按 `全部確認`
- 可跳 package 頁
- 但對 latest snapshot 的正式 DB truth 驗收仍未穩定 closure

#### 目前判斷
- vendor 主線不是壞在不存在 route / package
- **缺的是 group-route 對齊 + latest confirmation/package/document-layer 驗收穩定性**

---

### 3.4 quote-cost full-chain validation

#### 已完成
- 已建立 full-chain 驗收腳本
- 驗收目標包含：
  - collection create
  - reconciliation existence check
  - closeout stale guard probe
  - retained readback

#### 實查發現
- quote-cost detail 頁可進
- `收款管理` 區塊存在
- 但預期的 `對帳 / 結案` 文案在頁面上找不到

#### 目前判斷
- financial 主線不是不可用
- **目前先暴露的是 UI source-map / section label 與驗收預期不一致**
- 下一輪需先重新對齊 quote-cost detail 實際 section 命名與 selector，再繼續補齊 full-chain 驗收

---

### 3.5 closeout retained read-model query timing baseline

#### 已完成
- 已嘗試對 closeout list / detail read-model 做 baseline timing 量測
- 因 alias import 問題，改採 SQL baseline 方式直接量測

#### 實查發現
- 在 closeout list 對應 SQL 上直接碰到：
  - `relation "financial_manual_cost_items" does not exist`

#### 目前判斷
- 這條不是單純「還沒量 baseline」
- 而是 baseline 之前先暴露出：
  - schema / runtime dependency gap
  - migration / environment 對齊問題

#### 正式風險
- closeout retained read-model 在當前 DB 環境下，存在正式 schema dependency 缺口
- 若不先補這個 gap，query timing baseline 沒有穩定量測基礎

---

## 4. 本輪總結判斷

### 已確認的正向結論
1. 五條主線都已成功從「文件規劃」進到「正式驗收實查」
2. design / procurement / vendor / quote-cost / closeout 都不是純空殼
3. 本輪已把真正的 hardening 問題點拉出來，而不是停在 happy path 假綠燈

### 已確認的主要缺口類型
1. **latest confirmation / snapshot 驗收穩定性不足**
   - design
   - procurement（較輕）
   - vendor

2. **route / source-map 對齊風險**
   - vendor group route id format
   - quote-cost detail section label / selector expectation

3. **schema/runtime dependency gap**
   - closeout retained read-model 對 `financial_manual_cost_items` 的依賴

---

## 5. 下一步建議（依優先順序）

### Step 1 — 先收 execution lines 驗收鏈
先處理：
1. procurement Playwright 驗收穩定化
2. design confirm / snapshot 驗收穩定化

理由：
- 這兩條最接近 closure
- procurement 已有 DB truth 正向證據

### Step 2 — 收 vendor package 驗收鏈
處理：
1. 固化 vendor group route id 規則
2. 補 package/document-layer 對 latest snapshot 的穩定驗收

### Step 3 — 重做 quote-cost selector / source-map 對齊
先把 quote-cost detail 真實區塊命名與驗收腳本對齊，再繼續 full-chain e2e

### Step 4 — 補 closeout retained schema gap
先處理 `financial_manual_cost_items` 缺表 / schema 對齊問題，再談 query timing baseline

---

## 6. 明確不做（本 handoff 延續規則）

- 不把 Accounting Center extension 混進本批
- 不把本輪回寫成 `MD108 Batch 5`
- 不把 source-map / validation hardening 說成已 closure

---

## 7. 一句話總結

> `MD121` 啟動後，Phase P1 的五條固定主線都已成功進入正式驗收實查；目前真正暴露的不是「功能完全不存在」，而是 latest confirmation/snapshot 驗收穩定性、vendor/quote-cost route/source-map 對齊，以及 closeout retained read-model 的 schema dependency gap。下一輪應依序先收 execution lines，再收 vendor package，再重對齊 quote-cost，最後處理 closeout retained baseline 的 schema gap。