# MD61 — Projectflow downstream DB-first / vendor runtime status handoff — 2026-04-11

## 1. 任務目標

本輪主線目標是把 `projectflow` 持續往下游收斂成 **DB-first 正式資料流**，並維持既定規則：

- 上游 / 中游已驗收通過的鏈路不可回退
- 每一段完成都必須同時滿足：
  1. 前端全流程驗證
  2. DB 真值驗證
- `報價成本` list UI 已鎖，不改 UI 結構，只能改資料來源與邏輯
- reconciliation 單位固定為：
  - `project × sourceType × vendor`
- Vendor Data 未付金額聚合固定為：
  - `project × vendor`
  - 並加總設計 / 備品 / 廠商三種來源下已對帳群組

本輪實際執行重點是：

1. 續推 downstream `報價成本 / 成本與報價` DB-first
2. 切掉 `vendor-assignments` 假資料 fallback，改成真 DB flow
3. 驗證 vendor line 的 `vendor_name_text` 能否在 DB 與 confirmation snapshot 正式承接

---

## 2. 已確認不變的主線結論

### 2.1 上游 DB-first：PASS

已在 live Supabase runtime 驗證通過：

- `Project Detail / execution items / dispatch`
- design `dispatch -> reload -> detail -> document`
- procurement `dispatch -> reload -> detail -> document`

### 2.2 中游 DB-first：PASS

已驗證通過：

- design `detail -> plan -> confirm -> snapshot(DB)`
- procurement `detail -> plan -> confirm -> snapshot(DB)`

### 2.3 報價成本 group-level reconciliation 已成立

目前已成立並已驗證的核心規則：

- reconciliation 單位 = `project × sourceType × vendor`
- 不再以整個 project 或單一 item 當對帳單位
- quote-cost detail 已開始以 group model 運作
- live DB 已驗證：
  - project: `11111111-1111-4111-8111-111111111111`
  - group: `備品 × 驗收廠商B`
  - amount: `$21,600`
  - status: `已對帳`
  - DB table: `financial_reconciliation_groups`
  - reload 後仍可保留

### 2.4 Supabase runtime 路徑

已確認這個環境應走 **Transaction Pooler**，不是 direct DB host。

- 可用：pooler host
- 不可用：`db.vkjabxekxnnczpulumod.supabase.co`
  - error: `getaddrinfo ENOTFOUND db.vkjabxekxnnczpulumod.supabase.co`

---

## 3. 本輪 vendor 線實際處理結果

## 3.1 先前問題：vendor board 其實還在吃 seed fallback

查 code 後確認：

- `src/app/vendor-assignments/page.tsx`
  本來就有 DB-first 分支
- 真正控制條件在：
  - `src/lib/db/vendor-flow-toggle.ts`
- toggle 條件為：
  - `PROJECTFLOW_USE_DB_VENDOR === '1'`

本輪查到 `.env.local` 原本是：

```env
PROJECTFLOW_USE_DB_VENDOR=0
```

這就是為什麼 runtime 會看到 seed 資料，例如：

- `spring-popup-2026`
- `星澄輸出`

因此這不是 vendor page 邏輯誤寫，而是 **runtime toggle 沒打開**。

---

## 3.2 已切換 vendor flow 到 DB-first

本輪已把：

```env
PROJECTFLOW_USE_DB_VENDOR=1
```

打開後重新驗證，`/vendor-assignments` 顯示的已不再是 seed 專案，而是 DB-backed 專案，例如：

- `正式測試0710`
- `Projectflow 驗收測試專案`

這表示：

> `vendor-assignments` board/list 層現在已正式切到 DB-first。

---

## 3.3 vendor group route identity 已對齊

本輪已驗到 vendor group entry 產生的真 DB route 為：

```text
/vendor-assignments/11111111-1111-4111-8111-111111111111~77777777-7777-4777-8777-777777777777
```

也就是：

- `projectId~vendorId`

符合既定 helper：

- `buildVendorGroupRouteId(projectId, vendorId)`

這代表：

> vendor 線先前「slug/name 混用造成 group route 錯 identity」這個問題，已往正確 DB identity 收斂。

---

## 3.4 vendor editor / sync 資料鏈已補齊到 DB

本輪已補的 vendor line 後端鏈包含：

- type / sync / confirm payload 支援 `vendor_name_text`
- vendor flow editor 已可帶入群組 vendor 名稱
- 新增 migration：
  - `project-mgmt/db/migrations/20260411_vendor_task_plans_add_vendor_name_text.sql`

migration 內容：

```sql
alter table vendor_task_plans
add column if not exists vendor_name_text text;
```

已實際套用至 live Supabase DB。

---

## 3.5 已驗證 `sync-plans` 可正式寫入 `vendor_name_text`

在 migration 補完後，已直接驗到：

- API:
  - `POST /api/vendor-tasks/88888888-8888-4888-8888-888888888888/sync-plans`
- response:
  - `200 OK`
- 寫入結果：
  - `vendor_name_text = 驗收廠商C`

也就是說：

> vendor line 的 plan 存檔資料鏈，現在已能正式把 vendor identity 寫進 `vendor_task_plans`。

這一段不是推測，是已用真 API + 真 DB 驗過。

---

## 4. 本輪沒能正式簽 PASS 的點

## 4.1 vendor group detail page runtime 仍不穩

雖然本輪一度已在 runtime 上看到：

- `單 vendor 群組執行處理層`
- `VendorPlanEditorClient`
- `執行處理`
- `新增執行處理`
- `儲存`

也就是說 editor 的確曾成功 render。

但問題是：

- 同一條 DB route 在重複 Playwright 驗證時
- 會出現不穩定 timeout
- 並且不是只有 `networkidle`
- `domcontentloaded` / `load` / `commit` 都曾 timeout

代表：

> 這條 vendor group detail page 在目前 dev runtime 下，尚未達到可穩定驗收的程度。

---

## 4.2 dev runtime 曾出現 Turbopack cache corruption

server log 已抓到 Turbopack cache panic / corruption 痕跡，例如：

- `Failed to restore task data`
- `corrupted database or bug`
- `ArrayLengthMismatch`
- `.next/dev/cache/turbopack/...`
- missing `.sst` file

因此本輪後段的 vendor page 驗證，曾受 dev runtime 本身不穩定干擾。

雖然之後有清 `.next/dev/cache/turbopack` 並重啟，但整體 page-load 穩定性仍未完全恢復到可正式簽核的程度。

---

## 4.3 目前 vendor 線的真實驗收狀態

### 已完成

1. `vendor-assignments` board/list 層已切到 DB-first
2. vendor group route identity 已改為真 DB route id (`projectId~vendorId`)
3. `vendor_task_plans.vendor_name_text` schema 已補齊
4. `sync-plans` API 已可成功寫入 `vendor_name_text`
5. vendor line 的資料鏈已大致接通

### 尚未正式完成

以下因前端正式驗收尚未穩定完成，所以 **不能簽 PASS**：

1. vendor group page 的穩定前端操作驗證
2. 從前端頁面穩定完成：
   - save
   - group confirm
   - 跳到 package
3. DB 端最終驗證：
   - `task_confirmation_plan_snapshots.payload_json.vendor_name_text`
   - 是否由真實前端流程穩定承接

### 正確結論

> vendor 線目前不是卡在資料模型，也不是卡在 `vendor_name_text` schema；
> 真正未完成的是 **vendor group detail page runtime 穩定性**，
> 因此前端 + DB 真值的最終正式簽核還沒完成。

---

## 5. 本輪新增 / 重要檔案

### 5.1 新增 migration

- `project-mgmt/db/migrations/20260411_vendor_task_plans_add_vendor_name_text.sql`

### 5.2 關鍵檢查檔案

- `project-mgmt/src/app/vendor-assignments/page.tsx`
- `project-mgmt/src/app/vendor-assignments/[id]/page.tsx`
- `project-mgmt/src/components/vendor-plan-editor-client.tsx`
- `project-mgmt/src/components/vendor-group-confirm-client.tsx`
- `project-mgmt/src/app/api/vendor-tasks/[id]/sync-plans/route.ts`
- `project-mgmt/src/lib/db/vendor-flow-toggle.ts`
- `project-mgmt/src/lib/db/vendor-group-route.ts`
- `project-mgmt/src/lib/db/phase1-services.ts`
- `project-mgmt/src/lib/db/plan-sync.ts`
- `project-mgmt/src/lib/db/phase1-types.ts`

---

## 6. 目前最正確的 downstream 狀態總表

### PASS

- upstream DB-first
- midstream DB-first
- quote-cost reconciliation group model mainline
- quote-cost group write/readback closure
- design/procurement vendor carry into snapshot

### In Progress / Not Signed Off Yet

- quote-cost list source 改成 all projects（仍待正式收完）
- quote-cost detail 更完整去 project-level 舊假設（仍待續推）
- Vendor Data monetary layer 正式吃 reconciled groups（仍待續推）
- vendor line 最終前端驗收閉環（**尚未 PASS**）

---

## 7. 下一步續接建議（唯一正確主線）

### Step 1 — 先穩定 vendor group detail page runtime

不要再先討論抽象方向；直接處理這個頁面的 runtime 不穩定問題。

目標：

- 讓 `/vendor-assignments/[projectId]~[vendorId]` 在 DB-first runtime 下穩定載入
- 可穩定看到 editor
- 可穩定操作 save / group confirm

### Step 2 — 重做 vendor 正式驗收

在穩定 runtime 上，重新完整跑：

1. vendor group page save
2. group confirm
3. redirect / package 承接
4. DB 驗證：
   - `vendor_task_plans.vendor_name_text`
   - `task_confirmation_plan_snapshots.payload_json.vendor_name_text`

只有這一段跑通，vendor 線才能正式簽 PASS。

### Step 3 — 再回到 downstream financial closure

vendor 線 PASS 後再往下收：

1. `報價成本` list source 改為 all projects
2. quote-cost detail 更完整 group-driven 化
3. Vendor Data monetary layer 對接 reconciled groups
4. 完成 downstream end-to-end front-end + DB 驗收

---

## 8. 本輪一句話 handoff

> upstream 與 midstream 已 PASS，quote-cost group reconciliation 已成立；vendor 線已把 DB identity、schema 與 sync path 補到位，但 vendor group detail page runtime 仍不穩，因此 final front-end + DB truth acceptance 尚未簽 PASS。
