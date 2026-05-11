# MD-INDEX — projectflow Missing Legacy Reference Audit — 2026-05-11

Status: ACTIVE / REFERENCE AUDIT  
Role: 記錄 `projectflow` 舊文件鏈中，常被引用但目前 workspace 找不到實體檔案的缺失引用清單。  
Goal: 避免未來續接時誤以為舊引用鏈完整可用，並明確標示哪些早期文件引用已斷裂。

---

## 0. 為什麼需要這份清單

在這輪文件治理重整過程中，已實際查到：
- 多份早期 `projectflow` 文件會引用更早期的輔助規格或交接檔
- 但其中有一批檔名，在目前 workspace 內找不到對應實體檔案

這代表：

> **舊文件引用鏈不只層級過時，還有部分已實體斷裂。**

因此後續不可再把早期文件中的「建議閱讀順序」當成現在仍完整有效的入口鏈。

---

## 1. 目前已確認缺失的舊引用檔

以下檔名在目前 workspace 中查無實體檔：

- `MD18-projectflow-44-commit-review-and-redo-plan-2026-04-05.md`
- `MD19-projectflow-page-by-page-ui-review-summary-2026-04-05.md`
- `MD20-projectflow-approved-ui-lock-rule-2026-04-05.md`
- `MD22-projectflow-mock-closed-loop-frontend-execution-brief-2026-04-05.md`
- `MD23-projectflow-db-schema-v1-draft-2026-04-05.md`
- `MD24-projectflow-db-schema-v1-table-walkthrough-2026-04-05.md`
- `MD25-projectflow-db-phase1-migration-plan-2026-04-05.md`

---

## 2. 這代表什麼

### A. 不可再信任舊閱讀鏈的完整性
若某份舊 MD 寫著：
- 先讀 `MD21`
- 再讀 `MD22`
- 再讀 `MD23~25`

這不代表現在 workspace 中真的有完整可讀鏈。

### B. 更需要依賴新的治理入口
現在應以：
- `MD-MASTER-projectflow-system-source-of-truth.md`
- `MD-INDEX-projectflow-governing-document-architecture-2026-05-11.md`
- `MD-INDEX-projectflow-active-secondary-historical-map-2026-05-11.md`
- `MD-SUMMARY-projectflow-current-system-one-page-2026-05-11.md`

作為正式入口。

### C. 缺失檔案不等於該主題不存在
這份清單只能說明：
- 這些特定舊檔名在目前 workspace 中缺失

不代表：
- 它們對應的產品決策沒有被後續文件吸收
- 它們對應的規則沒有被更新後的主線承接

很多內容已被：
- `MD155~157`
- `MD158 / MD163 / MD164`
- `MD171~173`
- `MD203~210`

吸收或升級覆蓋。

---

## 3. 後續續接規則

若遇到舊文件引用：
- `MD18`
- `MD19`
- `MD20`
- `MD22`
- `MD23`
- `MD24`
- `MD25`

應採以下處理方式：

1. 不要假設檔案存在
2. 不要中斷在「找不到舊檔」
3. 直接回到新的治理入口與 Active 主線判讀
4. 若確實需要該主題的現行判讀，優先查：
   - 現行規則層：`MD155~157`
   - 成熟度判讀層：`MD158 / MD163 / MD164`
   - 驗收體系層：`MD167 / MD168 / MD171~173`
   - 最新工程主線：`MD203~210`

---

## 4. 一句話總結

> **`projectflow` 的一部分早期引用鏈在目前 workspace 中已實體斷裂，因此未來不可再依賴舊 MD 內部引用順序續接；應直接回到 2026-05-11 建立的新治理入口與 Active 主線文件。**
