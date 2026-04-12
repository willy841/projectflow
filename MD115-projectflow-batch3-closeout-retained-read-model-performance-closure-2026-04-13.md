# MD115 — projectflow Batch 3 closeout retained read-model / performance closure (2026-04-13)

> Status: ACTIVE  
> Note: 本文件記錄 `MD114` Batch 3 到目前驗收停點為止的已完成項、驗收方式、限制與後續建議。此文件定位為本批 closure / validation handoff。

## 1. 本批目標

依 `MD108` / `MD114`，本批目標為：
1. closeout list read-model 專用化
2. 年份 / 搜尋 / 排序 closure
3. list 欄位 retained summary closure
4. 移除冗餘 badge / note / active-operation 殘留
5. detail retained context + retained financial summary closure
6. retained cost tabs 讀 final layer / read-only layer
7. 降低 closeout list 慢 / timeout 風險

---

## 2. 已完成項

### 2.1 Batch 3 source-map audit 已完成
已完成 closeout list / detail / read-model / UI source-map 盤點，並固定於：
- `MD114-projectflow-closeout-retained-read-model-performance-work-package-2026-04-13.md`

已固定核心結論：
- closeout list 原本直接吃 active financial projects 再前端過濾 `已結案`
- closeout detail 原本仍高度依賴 `QuoteCostDetailClient` active financial skeleton
- 慢 / timeout 風險主因來自 read-model 不夠專用、payload 過重

### 2.2 closeout list 專用 read-model 已建立
已新增：
- `project-mgmt/src/lib/db/closeout-list-read-model.ts`

已完成效果：
- closeout list 不再先吃整份 active financial payload
- 改為直接 query `已結案` project 的 retained summary
- list server payload 只保留：
  - project id
  - 活動標題
  - 客戶名稱
  - 活動日期 / 年份
  - 對外報價總額
  - 專案成本
  - 毛利

### 2.3 `/closeout` route 已改接 closeout list read-model
已完成：
- `src/app/closeout/page.tsx` 改接 `getCloseoutListReadModel()`

正式效果：
- closeout list 與 active quote-cost project adapter 脫鉤一層
- 先把 Batch 3 最大的 performance risk 壓下來

### 2.4 closeout list UI 已收成 retained summary 版本
已完成：
- `src/components/closeout-list-client.tsx` 改為吃 `CloseoutListRow[]`
- 保留：
  - 活動標題
  - 活動日期
  - 客戶名稱
  - 對外報價總額
  - 專案成本
  - 毛利
- 保留檢索：
  - 年份篩選
  - 搜尋
  - 日期排序
  - 分頁

### 2.5 closeout list 冗餘 UI 已移除
已完成移除：
- `對帳狀態` badge
- `結案狀態` badge
- `留存備註`
- active financial 殘留狀態語言

此段已與 `MD106` 對齊。

### 2.6 closeout detail active-operation 區塊已拔掉一輪
已完成：
- 在 retained mode 下，不再顯示：
  - 收款管理
  - 廠商付款狀態
  - 對外報價單整張明細表

正式效果：
- closeout detail 已更接近 retained archive 頁
- 不再把 active quote-cost financial operation 區塊直接帶進 closeout 視角

---

## 3. 驗收結果

### 3.1 build 驗證
已完成：
- `npm run build`
- 結果：PASS

已確認：
- `/closeout`
- `/closeout/[id]`
- `/closeouts` alias 邊界
皆可正常編譯。

### 3.2 本停點正式判讀
可正式判定：
- closeout list 已從 active quote-cost adapter 脫出第一層
- closeout list retained summary 已成立
- closeout detail active-operation 殘留已清掉一輪
- Batch 3 已到達可交接停點

---

## 4. 尚未完成 / 本停點保留項

### 4.1 closeout detail 仍未完全脫離 `QuoteCostDetailClient`
目前雖已透過 retained mode 裁掉主要 active 區塊，但：
- detail 主骨架仍沿用 `QuoteCostDetailClient`
- 後續若要更純的 retained presenter，仍值得拆出 closeout retained-only detail component

### 4.2 retained tabs 目前仍沿用既有 costItems projection
目前四個 read-only tabs 已可用，但底層仍偏向：
- final cost layer projection
- 而非獨立命名的 retained document-layer read-model

本停點判讀：
- 產品上可接受
- 工程上仍有再正式化空間

### 4.3 closeout list slow / timeout 風險雖下降，但尚未做量測型驗收
目前已從結構上降低風險：
- 改成專用 read-model
- payload 變輕

但本停點尚未附上：
- query timing 基準
- timeout 對照數據

---

## 5. 風險與限制

1. closeout detail 與 quote-cost detail 仍有元件層耦合
2. retained tabs 仍是 projection，不是完全獨立 retained schema
3. 若後續又把 active 區塊加回 retained mode，容易回退

---

## 6. 關鍵檔案

- `MD114-projectflow-closeout-retained-read-model-performance-work-package-2026-04-13.md`
- `project-mgmt/src/lib/db/closeout-list-read-model.ts`
- `project-mgmt/src/app/closeout/page.tsx`
- `project-mgmt/src/components/closeout-list-client.tsx`
- `project-mgmt/src/components/quote-cost-detail-client.tsx`

---

## 7. 下一步建議

若下一輪要續接，建議兩條路：

### A. Batch 3 deeper retained formalization
- 拆 closeout retained-only detail component
- 讓 detail 完全脫離 `QuoteCostDetailClient` active skeleton
- 視需要把 retained tabs 改成更正式的 read-model naming / adapter

### B. 直接進 Batch 4
- 上游 + execution lines write/read closure
- 以前三批已收穩的下游 financial / closeout spine 作為基礎

---

## 8. 一句話總結

> Batch 3 到本停點已把 closeout 從 active quote-cost financial view 中再拉開一大步：建立 closeout list 專用 read-model，讓 `/closeout` 不再先吃整份 active financial payload 再過濾；同時把 closeout list UI 收成真正的 retained summary，移除 `已完成 / 已結案 / 留存備註` 等冗餘項，並在 closeout detail 中拔掉收款管理、廠商付款狀態、報價明細等 active-operation 主區。build 已通過，這一批已可視為 Batch 3 的正式停點；剩下的是要不要再把 detail 完全拆成 retained-only component，以及是否接續進 Batch 4。