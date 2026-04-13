# MD128 — projectflow post-MD108 Phase P2 retained / component formalization status (2026-04-13)

> Status: ACTIVE / STATUS  
> Phase: post-MD108 / Phase P2  
> Role: 記錄 `MD126` 啟動後，截至目前為止 P2-W1 ~ P2-W4 的實作落地狀態。

---

## 1. P2-W1 — closeout retained-only component formalization
### 目前狀態
- **第一輪已落地**

### 已完成內容
- retained / closeout detail 的 section-level 結構已開始獨立化
- retained collection 顯示不再依賴 active-only block 的脆弱條件式
- retained mode 的 section 呈現邊界較先前清楚

---

## 2. P2-W2 — active / retained skeleton decoupling
### 目前狀態
- **第一輪已落地**

### 已完成內容
- 新增 `src/components/quote-cost-detail-sections.tsx`
- 已將 `QuoteCostDetailClient` 中一大塊混合 JSX 拆成 section composition
- 已抽出：
  - `QuoteCostHeader`
  - `CollectionSection`
  - `ActiveOnlyFinancialSections`
  - `CostManagementSection`

### 工程意義
- active / retained 不再完全纏在單一大元件內
- 後續 retained-only component 化已更容易繼續往下做

---

## 3. P2-W3 — vendor document-layer field semantics formalization
### 目前狀態
- **第一輪已落地**

### 已完成內容
- 新增 `src/lib/db/vendor-document-contract.ts`
- 已定義：
  - `VendorDocumentSnapshotPayload`
  - `VendorDocumentLine`
  - `mapVendorSnapshotToDocumentLine(...)`
- `vendor-package-adapter.ts` 已改為透過 contract mapping 產生 package/document-layer line

### 工程意義
- vendor package / document-layer 不再直接散落 inline payload_json mapping
- 欄位語意開始收成正式 contract

---

## 4. P2-W4 — latest confirmation snapshot priority contract formalization
### 目前狀態
- **第一輪已落地**

### 已完成內容
- 新增 `getLatestConfirmationPriorityRule()`
- 已在 vendor package adapter 層補出可辨識的 current truth source 規則

### 規則內容
- current readback source = latest confirmation snapshot
- live plans = editable state only
- older snapshots = history only, not current readback source

### 工程意義
- latest snapshot priority 不再只是隱性心智
- 已開始被收成正式 contract

---

## 5. 目前最準確的管理判斷

### 可宣稱
- Phase P2 四個工作包都已完成**第一輪落地**
- 已從「規劃」進入「結構與 contract 已實作」的狀態

### 不應過度宣稱
- 目前較適合稱為：
  - **Phase P2 first implementation round complete**
- 若要正式完全 closure，下一輪仍可再做：
  - retained-only component 再進一步獨立
  - design / procurement / vendor / retained downstream 共通 snapshot contract 再向外延伸

---

## 6. 一句話總結

> `MD128` 的結論是：Phase P2 已不是 planning，而是已完成第一輪實作落地。closeout retained 與 active quote-cost skeleton 已開始分離；vendor document-layer 欄位語意與 latest confirmation snapshot priority 也已被收成更正式的 contract。