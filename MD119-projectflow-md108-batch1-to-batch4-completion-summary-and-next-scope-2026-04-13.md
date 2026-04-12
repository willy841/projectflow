# MD119 — projectflow MD108 Batch 1 → Batch 4 completion summary and next-scope split (2026-04-13)

> Status: ACTIVE  
> Purpose: 正式整理 `MD108` 藍圖這一輪已完成範圍，以及哪些仍屬下一輪 / 藍圖外延伸工作，避免把「本輪完成」與「整體工程全部完成」混在一起。

## 1. 結論先講

### 已可正式確認完成的範圍
`MD108` 這一輪 DB-first implementation batch plan 所定義的主批次：
1. Batch 1
2. Batch 2
3. Batch 3
4. Batch 4

**均已完成。**

### 尚不可宣稱已全部完成的範圍
若把範圍放大到：
- projectflow 整體所有未來 formalization
- 所有 deeper validation
- 所有額外 e2e coverage
- 所有後續 performance hardening / reporting / accounting extensions

則**尚未全部完成**。

---

## 2. MD108 本輪已完成項

### Batch 1 — Vendor foundation / profile validation
已完成重點：
- vendor foundation
- profile validation
- vendor payment relation foundation
- vendor data source-map audit / closure

對應文件：
- `MD110-projectflow-vendor-data-source-map-audit-and-gap-report-2026-04-13.md`
- `MD111-projectflow-vendor-data-batch1-foundation-and-profile-validation-closure-2026-04-13.md`

### Batch 2 — Quote-cost / payable / closeout ingress
已完成重點：
- quote-cost reconciliation / payable / closeout ingress closure
- closeout 正式 API / DB write path
- `未收款 = 0 + 全部對帳完畢` gating
- reconciliation item-level visibility
- quote-cost 冗餘 UI 清理

對應文件：
- `MD112-projectflow-quote-cost-reconciliation-payable-closeout-ingress-work-package-2026-04-13.md`
- `MD113-projectflow-batch2-quote-cost-reconciliation-payable-closeout-ingress-closure-2026-04-13.md`

### Batch 3 — Closeout retained read-model / performance
已完成重點：
- closeout list 專用 read-model
- closeout retained summary UI
- closeout detail active-operation 區塊裁切
- closeout list performance risk 結構性下降

對應文件：
- `MD114-projectflow-closeout-retained-read-model-performance-work-package-2026-04-13.md`
- `MD115-projectflow-batch3-closeout-retained-read-model-performance-closure-2026-04-13.md`

### Batch 4 — Upstream + execution lines write/read closure
已完成重點：
- upstream requirement communication DB-first closure
- execution dispatch spine 確認
- design / procurement confirm semantics 收口
- vendor line `全部確認` 語意對齊
- document-layer same-source 規則固定
- Playwright + DB truth comparison（requirements API）

對應文件：
- `MD116-projectflow-upstream-execution-lines-write-read-closure-work-package-2026-04-13.md`
- `MD117-projectflow-batch4-upstream-execution-lines-write-read-closure-progress-2026-04-13.md`
- `MD118-projectflow-batch4-upstream-execution-lines-write-read-closure-final-2026-04-13.md`

---

## 3. 因此現在可以怎麼說

### 可以說的
- `MD108` 本輪 Batch 1–4 已完成
- 這一輪 DB-first implementation 主線已收完
- 本輪主要 source-map audit、write path、read-model、closure 文件與基礎驗收已建立

### 不該說的
- projectflow 全部工程已完成
- 所有後續 formalization / optimization / accounting extension 都已完成
- 所有區塊都已有完整 e2e matrix

---

## 4. 目前剩餘但不屬於「MD108 Batch 1–4 未完成」的項目

以下應視為：
> **下一輪候選主題 / 藍圖外延伸 / deeper hardening**

### A. 更完整的 frontend + DB truth 驗收矩陣
目前已有部分 Playwright + DB truth 驗收，但仍可再補：
- design line end-to-end confirmation overwrite validation
- procurement line end-to-end confirmation overwrite validation
- vendor grouping / package / document-layer end-to-end validation
- closeout retained read-model query timing / performance baseline

### B. deeper component formalization
例如：
- closeout detail 若要完全脫離共用骨架，可再拆 retained-only component
- vendor document-layer 欄位語意若要再更正式，可再獨立命名與 adapter 化

### C. accounting / reporting / aggregation 延伸
這些不屬於本輪 Batch 1–4 已完成範圍：
- Accounting Center 更多 phase extension
- 更完整月結 / 報表 / retained reporting
- 更大範圍 performance hardening

---

## 5. 目前最乾淨的管理判斷

如果現在要管理進度，應該這樣切：

### Phase A — MD108 主批次
- 狀態：**完成**

### Phase B — Post-MD108 hardening / validation / extension
- 狀態：**尚未展開或只完成部分**

這樣最準確，也最不會把工程狀態說過頭。

---

## 6. 一句話總結

> `MD108` 這一輪 DB-first implementation 的 Batch 1 → Batch 4 已全部完成；但這不等於整個 projectflow 所有未來工程都已完成。最準確的說法是：**MD108 主批次已完成，後續剩下的是 post-MD108 的 deeper validation、hardening 與延伸工作。**