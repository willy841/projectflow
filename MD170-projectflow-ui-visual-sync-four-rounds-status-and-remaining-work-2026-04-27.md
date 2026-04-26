# MD170 — projectflow UI visual sync four rounds status and remaining work — 2026-04-27

Status: ACTIVE / HANDOFF-READY
Purpose: 整理本輪 `projectflow` UI 視覺同步四輪執行後，哪些已完成、哪些已明確驗證、哪些仍未完成，供後續續接與管理判斷使用。

---

## 1. 任務前提與硬限制

本輪 UI 視覺同步一律遵守以下硬限制：

1. 不改任何既有文字
2. 不新增任何文字
3. 不刪任何文字或按鈕
4. 不碰功能欄位、資料流、互動語意與結構責任
5. 只做純視覺同步（顏色、卡片材質、surface、table、button、input、spacing、badge）

視覺標準基準頁：
- `Project Detail`
- dark-glass / premium SaaS material hierarchy

---

## 2. 四輪已完成結果

### Round 1 — 第一優先頁面
已完成頁面：
- `/projects`
- `/projects/new`
- `/design-tasks`
- `/procurement-tasks`

實際改檔：
- `src/app/design-tasks/page.tsx`
- `src/app/procurement-tasks/page.tsx`
- `src/app/projects/new/page.tsx`
- `src/components/project-form.tsx`
- `src/components/projects-page-client.tsx`

完成內容摘要：
- `/projects/new` header 與表單改成 dark workspace / dark-glass family
- `ProjectForm` 全表單統一到 dark-glass card / input / button family
- `/projects` 搜尋框、篩選 pills、table shell、分頁、danger 區塊統一到 dark-glass family
- `/design-tasks`、`/procurement-tasks` table wrapper / table family 收斂到 `pf-table-shell` / `pf-table`

驗證：
- `npm run build`：PASS

commit：
- `b8ebc11` — `style: sync priority workspace pages to dark glass`

---

### Round 2 — 第二優先頁面
已完成頁面：
- `/quote-costs`
- `/quote-costs/[id]`

非獨立 UI、未改檔但非阻塞：
- `/quote-cost`
- `/quote-cost/[id]`
- 原因：兩者為 redirect，無獨立可視 UI 可做同步

實際改檔：
- `src/components/quote-cost-list-client.tsx`
- `src/components/quote-cost-detail-sections.tsx`
- `src/components/quote-cost-detail-client.tsx`

完成內容摘要：
- list / detail header、卡片、table、modal、input、badge、button、對帳群組區、人工成本區對齊 `Project Detail` dark-glass 標準

驗證：
- `npm run build`：PASS

commit：
- `7f7f6d0` — `style: align quote cost surfaces with detail standard`

---

### Round 3 — 第三優先頁面
已完成頁面：
- `/vendor-assignments/[id]`
- `/closeouts`

無獨立 UI / 不需實作：
- `/closeout`
- `/closeout/[id]`
- 原因：兩者為 redirect，無獨立可視 UI

本輪審核後未擴動：
- `/vendor-assignments`
  - 原因：已大致位於 dark-glass 家族內，當輪不值得為了「做而做」增加回歸風險
- `/closeouts/[id]`
  - 原因：透過 `QuoteCostDetailClient` 承接，屬既有 dark-theme 主線；當輪未做深入 patch

實際改檔：
- `src/app/vendor-assignments/[id]/page.tsx`
- `src/components/vendor-plan-editor-client.tsx`
- `src/components/vendor-group-confirm-client.tsx`
- `src/components/closeout-list-client.tsx`

完成內容摘要：
- `/vendor-assignments/[id]` header action buttons / editor / confirm client 同步到 dark-glass surface family
- `/closeouts` header、filter 區、table wrapper、table rows、查看按鈕、pagination 對齊 `Project Detail` 風格

驗證：
- `npm run build`：PASS

commit：
- `1005186` — 第三輪優先可安全做的視覺同步

---

### Round 4 — 第四優先頁面
已完成頁面：
- `/`

實際改檔：
- `src/app/page.tsx`

完成內容摘要：
- 首頁 header spacing 節奏對齊已同步頁
- `headlineBadges` 收斂到 `pf-badge`
- `+ 新增專案` 收斂到 `pf-btn-create`
- 四個首頁指標卡收斂到 `pf-panel-soft`
- `近期專案`、`收款概況` 兩個主區塊收斂到 `pf-card`
- `查看全部`、`前往報價成本` 收斂到 `pf-btn-secondary`
- `近期專案` table shell 對齊 `pf-table-shell` / `pf-table`

刻意未動：
- empty state 文案與結構
- 首頁資訊架構重排
- `Project Detail` 式 bullet section title treatment（避免碰結構/語意）

驗證：
- `npm run build`：PASS

commit：
- `17a2a87` — `style: sync home overview surfaces with detail standard`

---

## 3. 四輪完成後，已可視為完成同步的頁面

### Core / shared foundation
- `Project Detail`（作為樣板頁）
- shared dark-glass globals foundation

### Auth / system / admin surfaces
- `/login`
- `/reset-password`
- `/forbidden`
- global error / not-found
- `/system-settings`
- `/accounting-center`

### Vendor / vendor packages
- `/vendor-packages`
- `/vendor-packages/[id]`
- `/vendors`
- `/vendors/[id]`

### Round 1 ~ 4 pages
- `/projects`
- `/projects/new`
- `/design-tasks`
- `/procurement-tasks`
- `/quote-costs`
- `/quote-costs/[id]`
- `/vendor-assignments/[id]`
- `/closeouts`
- `/`

---

## 4. 明確未完成 / 未重新收斂交付的項目

### A. 仍未明確收斂交付的頁面
1. `/closeouts/[id]`
   - 目前最明確尚未列為已完成同步的實頁
   - 原因：第三輪時因承接關係與風險判斷，未做深入 patch

### B. redirect 路由（不是未完成實頁，但也不是獨立完成頁）
- `/quote-cost`
- `/quote-cost/[id]`
- `/closeout`
- `/closeout/[id]`

這些是 redirect 路徑，不應當成獨立 UI 頁面看待。

### C. 未重新大改，但也不屬明顯主缺口
- `/vendor-assignments`
  - 當輪審核判定已大致位於 dark-glass 家族內
  - 未為了「做而做」再硬改

---

## 5. 驗證與穩定性狀態

本輪每批視覺同步後均至少跑：
- `npm run build`

此外，正式驗收主線已重新確認：
- `npm run test:formal-acceptance:v2`
- `npm run test:formal-acceptance:full`

本輪結論：
- 正式功能主線綠燈
- UI 視覺同步未驗出正式 blocker 回歸

---

## 6. GitHub 推送狀態

已將 `project-mgmt` repo 內本輪已完成改動推上 GitHub：
- branch: `main`
- push range: `a5f1d36..17a2a87`

---

## 7. 一句話總結

> 四輪 UI 視覺同步後，`projectflow` 目前已完成大部分主頁的 dark-glass 對齊；最明確仍未收斂交付的實頁主缺口是 `/closeouts/[id]`，其餘未動到的 `/quote-cost`、`/quote-cost/[id]`、`/closeout`、`/closeout/[id]` 為 redirect 路徑，不應視為獨立未完成 UI 頁面。 
