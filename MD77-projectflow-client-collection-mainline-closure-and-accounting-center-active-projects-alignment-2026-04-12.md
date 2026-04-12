# MD77 — projectflow client collection mainline closure and accounting center active-projects alignment (2026-04-12)

## 1. 文件定位

本文件整理本輪 `client collection` 主線已完成的正式落地結果。

本文件目的：
- 記錄 `quote-cost detail` 已成為 client collection 主入口
- 記錄 `Accounting Center / active-projects` 已正式承接這條收款真值
- 提供下一輪續接時的準確停點與下一步建議

---

## 2. 本輪正式拍板已落地的內容

### 2.1 已正式成立的責任分工
- **收款主入口：** `quote-cost detail / financial detail`
- **收款真值：** `project_collection_records`
- **Accounting Center / active-projects：** tracking / summary / drill-down

### 2.2 quote-cost detail 已新增 client collection module
已完成：
- 應收總金額
- 已收款
- 未收款
- 收款紀錄區
- 新增收款
- 刪除收款

### 2.3 quote-cost detail 驗收已通過
已驗通：
- 進入單案 `quote-cost detail`
- 新增收款
- DB 寫入 `project_collection_records`
- 頁面 readback 正確
- 刪除收款
- DB 與頁面一致

Playwright：
- `tests/quote-cost-collection-e2e.spec.ts`
- **1 passed**

### 2.4 Accounting Center / active-projects 已承接新真值
已完成：
- `總金額` 改承接對外報價總額（應收總額）
- `已收款` 承接 `project_collection_records`
- `未收款 = 應收總額 - 已收款`
- `查看詳情` 改直達 `/quote-costs/[id]`

### 2.5 Accounting Center 驗收已通過
已驗通：
- quote-cost detail 的應收 / 已收 / 未收
- Accounting Center active-project row readback 一致
- row drill-down 導流正確

Playwright：
- `tests/accounting-active-projects-collection-readback.spec.ts`
- **1 passed**

---

## 3. 本輪關鍵 commits

- `cfd4360` — `feat: add client collection flow to quote cost detail`
- `051e265` — `feat: align accounting active projects with collection truth`

---

## 4. 目前整體系統狀態（相對 Accounting Center Phase A）

截至本文件：

### 已站穩
1. Accounting Center personnel editor closure
2. Accounting Center office / other db-first closure
3. quote-cost detail client collection module
4. Accounting Center active-projects 承接 collection truth

### 因此目前已站穩的主鏈包括
- `quote-cost detail` 作為單案帳務 / 收款主入口
- `Accounting Center active-projects` 作為逐案追蹤與導流層
- `Accounting Center 管銷成本` 作為營運支出管理層

---

## 5. 現在最合理的下一步

在這條 client collection 主線完成後，下一步最合理的是：

> **回到 `Accounting Center / 營收概況`，檢查並驗收 month / year / range aggregation 是否已正式承接新的 collection / operating expense truth。**

原因：
1. active-projects 已補齊收入側的進行中收款管理主線
2. operating expense（人事 / 庶務 / 其他）也已基本站穩
3. 現在最有價值的是確認 summary layer 是否已真正吃到這些正式真值

---

## 6. 一句話總結

> 截至 2026-04-12，本輪已正式完成 `client collection` 主線拍板與落地：`quote-cost detail / financial detail` 已成為收款主入口，`project_collection_records` 已成為正式收款真值，`Accounting Center / active-projects` 已承接這條真值做逐案追蹤與導流；下一步最合理的主線，應轉向 `Accounting Center / 營收概況` 的 month / year / range aggregation 正式驗收。