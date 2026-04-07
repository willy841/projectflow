# MD33 — projectflow 專案刪除流程交接與根因記錄

日期：2026-04-07
狀態：已完成第一輪正式可用版
適用範圍：`project-mgmt` / `/projects` / `/projects/[id]` / `DELETE /api/projects/[id]`

---

## 1. 本輪需求定案

本輪已拍板的刪除功能規格如下：

1. 在 `/projects` 專案列表每筆專案後面新增 **刪除按鍵**
2. 刪除前必須先做 **防誤刪確認**
3. **唯一保留的防呆規則**：使用者必須手動輸入專案名稱，名稱完全一致才能刪除
4. 刪除必須是 **正式 DB 刪除**，不是前端 local 假刪除
5. 不做額外「若已有下游正式資料就禁止刪除」的阻擋規則（此條已討論後明確拿掉）

---

## 2. 最終有效實作內容

### 前端

檔案：`project-mgmt/src/components/projects-page-client.tsx`

已完成：

- 每列專案新增刪除按鍵
- 點擊後展開刪除確認區
- 使用者需手動輸入專案名稱
- 名稱不一致時不可送出刪除
- 刪除成功後，先從 client state 立即移除該專案
- 之後再執行 route refresh / navigation refresh

### 後端

檔案：`project-mgmt/src/app/api/projects/[id]/route.ts`

已完成：

- 新增 `DELETE /api/projects/[id]`
- 後端會先查 project 是否存在
- 後端會驗證 `confirmProjectName` 是否與專案名稱完全一致
- 驗證通過後正式刪除 `projects` row

### Repository

檔案：`project-mgmt/src/lib/db/phase1-repositories.ts`

已完成：

- `projects` repository 補上 `delete(id)`

---

## 3. 這輪實際踩到的坑

### 坑 1：DB 刪掉了，但 `/projects` 列表看起來還在

一開始誤以為 delete API 沒生效。
實際上 DB 已刪掉，因為再次刪除會回傳「找不到專案」。

第一層原因是：

- 舊版 `/projects` 會把 **DB projects + `project-data.ts` mock projects** 合併顯示
- 所以 DB 專案刪掉後，前端可能仍被 seed / mock 資料補回影子

有效修法：

- 在 DB mode 下，`/projects` 只顯示 DB projects
- 不再把 `project-data.ts` 的 mock seed 合併回來

對應 commit：
- `867ef6c` — `fix: use db-only project list in db mode`

---

### 坑 2：`/projects/[id]` detail 仍可能 fallback 到 seed project

舊邏輯：

- 若 id 不是特定判斷條件，detail page 仍可能 fallback 到 `project-data.ts`
- 導致已刪除專案仍可能在 detail 被 mock 撐起來

有效修法：

- DB mode 下，`/projects/[id]` 只讀 DB
- DB 查不到就直接 `notFound()`

對應 commit：
- `5341292` — `fix: use db-only project detail in db mode`

---

### 坑 3：刪除成功後 client 畫面沒有立刻消失

雖然後端已刪除，但單靠 `router.refresh()` 在某些情境下畫面仍殘留。

有效修法：

- 刪除成功後，先從 client state 中把該 project 立即移除
- 再做 refresh / navigation 校正

對應 commit：
- `b841c34` — `fix: remove deleted project from client list immediately`
- `e9133b5` — `fix: force navigation refresh after project deletion`

---

### 坑 4：真正根因是 `/projects` 與 `/projects/[id]` 路由被快取

最後驗證後確定，前端殘留的最核心原因不是 DB，也不是 delete API，而是：

- `/projects`
- `/projects/[id]`

這兩個 route 沒有強制 dynamic，導致 Next route cache 讓已刪除專案仍以舊 server payload 顯示。

### 最終有效修法

在以下檔案加上：

```ts
export const dynamic = "force-dynamic";
```

檔案：
- `project-mgmt/src/app/projects/page.tsx`
- `project-mgmt/src/app/projects/[id]/page.tsx`

對應 commit：
- `a3b8c67` — `fix: force dynamic project routes`

這是本輪最後確認有效、真正讓刪除後前端表現正確的關鍵修正。

---

## 4. 本輪不採用的方案

以下方案曾討論，但最終 **不採用**：

1. 若專案已有下游正式資料就禁止刪除
2. 前端顯示 dependency summary / 阻擋刪除理由
3. 刪除前做額外 closeout / accounting / downstream gate

原因：本輪需求已由使用者明確收斂為：

- **只保留「手動輸入專案名稱」這個防誤刪規則**
- 不要加多餘阻擋

---

## 5. 目前已知穩定規則

針對 projectflow 專案刪除流程，後續請遵守：

1. DB mode 下，`/projects` 不可再回退到 mock merge 顯示
2. DB mode 下，`/projects/[id]` 不可再 fallback 到 `project-data.ts`
3. `/projects` 與 `/projects/[id]` 若持續依賴 DB 即時結果，應維持 dynamic route
4. 刪除成功後，前端列表應立即移除該筆，不要只依賴 refresh
5. 本輪已定規格只有一個防呆：**輸入專案名稱後才能刪除**

---

## 6. 當前完成狀態

已完成：

- DB-backed project delete API
- 專案列表刪除按鍵
- 名稱確認防誤刪
- DB mode list/detail 純 DB 化
- route cache 修正
- client 列表刪除後即時移除

目前狀態可視為：

**project delete flow phase 1 已完成並可用**

---

## 7. 後續若要再做的建議（非本輪）

若未來要升級，可考慮：

1. 補 delete audit log
2. 補 soft delete / archive 機制
3. 補 closeout / accounting / downstream protection gate
4. 補刪除成功 toast / feedback
5. 補刪除前 server-side preflight 檢查 API

但這些都不是本輪已拍板範圍。
