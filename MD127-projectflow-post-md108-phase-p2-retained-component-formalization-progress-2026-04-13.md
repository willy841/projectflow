# MD127 — projectflow post-MD108 Phase P2 retained / component formalization progress (2026-04-13)

> Status: ACTIVE / PROGRESS  
> Phase: post-MD108 / Phase P2  
> Role: 記錄 `MD126` 啟動後，P2-W1 / P2-W2 第一輪實際結構改造結果。

---

## 1. 本輪已完成內容

### P2-W1 — closeout retained-only component formalization（第一輪）
已完成：
- retained / closeout detail 不再只靠 `QuoteCostDetailClient` 內部大段 JSX 條件式硬分流
- 已把 retained 會共用到的 section 邏輯拆到獨立 section-level component
- retained collection readback 所依賴的 section 結構不再被 active-only block 綁死

### P2-W2 — active / retained skeleton decoupling（第一輪）
已完成：
- 新增 `src/components/quote-cost-detail-sections.tsx`
- 抽出：
  - `QuoteCostHeader`
  - `CollectionSection`
  - `ActiveOnlyFinancialSections`
  - `CostManagementSection`
  - 共用 section helpers
- `QuoteCostDetailClient` 已從超大塊 active/retained 混合 JSX，切成較清楚的 section composition 結構

---

## 2. 本輪意義

這一輪的重點不是功能新增，而是：
- 把 retained / active 邊界從脆弱條件 render，推進到較可維護的 section composition
- 避免未來再次發生：
  - retained data 明明存在
  - 但因 active-only block 擋住而不顯示

---

## 3. 目前尚未完成

### P2-W3 — vendor document-layer field semantics formalization
尚未開始正式收口，下一步要處理：
- vendor package / document-layer 目前仍直接從 snapshot payload_json inline mapping
- 需收成更正式的 field semantics / view-model contract

### P2-W4 — latest confirmation snapshot priority contract formalization
尚未開始正式收口，下一步要處理：
- 將 design / procurement / vendor / retained downstream 共同依賴的 latest snapshot 優先規則，從分散 adapter 邏輯提升成更正式的工程 contract

---

## 4. 一句話總結

> `MD127` 記錄的是 Phase P2 第一輪真正的結構改造：closeout retained 與 active quote-cost detail 的共用骨架已開始拆界線，`QuoteCostDetailClient` 由大塊混合 JSX 改成 section composition；接下來正式焦點應轉向 vendor document-layer 欄位語意與 latest confirmation snapshot priority contract。