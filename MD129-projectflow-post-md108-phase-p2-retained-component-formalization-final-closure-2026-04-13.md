# MD129 — projectflow post-MD108 Phase P2 retained / component formalization final closure (2026-04-13)

> Status: CLOSED / SIGNED-OFF  
> Phase: post-MD108 / Phase P2  
> Role: `MD126` 所定義的 Phase P2 retained / component formalization 最終 closure 文件。  
> Important: 本文件代表 post-MD108 第二個正式 work package 已完成本輪收口。

---

## 1. 本批正式範圍

依 `MD126`，Phase P2 正式範圍為：

1. closeout detail retained-only component 化
2. vendor document-layer 欄位語意再正式化
3. 保留 latest confirmation snapshot 優先規則
4. 降低 active / retained 共用骨架耦合

---

## 2. 最終完成結果

### 2.1 P2-W1 — closeout retained-only component formalization
完成情況：
- retained / closeout detail 已不再完全依賴混雜的大段 active/retained JSX block
- retained collection 顯示區已被拉成更穩定的 section-level 結構
- closeout retained 顯示層比 Phase P1 前更可維護

結論：
- **PASS（本輪 formalization 完成）**

---

### 2.2 P2-W2 — active / retained skeleton decoupling
完成情況：
- 新增 `src/components/quote-cost-detail-sections.tsx`
- 已抽出：
  - `QuoteCostHeader`
  - `CollectionSection`
  - `ActiveOnlyFinancialSections`
  - `CostManagementSection`
- `QuoteCostDetailClient` 從大塊混合 JSX，正式改成 section composition 形式

結論：
- **PASS（第一輪 skeleton decoupling 完成）**

---

### 2.3 P2-W3 — vendor document-layer field semantics formalization
完成情況：
- 新增 `src/lib/db/vendor-document-contract.ts`
- 已定義：
  - `VendorDocumentSnapshotPayload`
  - `VendorDocumentLine`
  - `mapVendorSnapshotToDocumentLine(...)`
- `vendor-package-adapter.ts` 已不再直接 inline payload_json mapping
- vendor package / document-layer 欄位語意已開始集中為正式 contract

結論：
- **PASS（第一輪 field semantics formalization 完成）**

---

### 2.4 P2-W4 — latest confirmation snapshot priority contract formalization
完成情況：
- 已新增 `getLatestConfirmationPriorityRule()`
- 已明確固定：
  - current readback source = latest confirmation snapshot
  - live plans = editable state only
  - older snapshots = history only
- vendor package adapter 已開始使用這層較正式的規則語意

結論：
- **PASS（第一輪 priority contract formalization 完成）**

---

## 3. Focused regression validation

為確認 P2 refactor 沒有讓 P1 已驗收主線退化，本輪已重新驗以下主線：

1. `tests/design-confirm-overwrite-e2e.spec.ts`
2. `tests/procurement-confirm-overwrite-e2e.spec.ts`
3. `tests/vendor-group-package-document-e2e.spec.ts`
4. `tests/quote-cost-full-chain-e2e.spec.ts`

結果：
- **4 / 4 passed**

管理結論：
- P2 refactor 未破壞 Phase P1 已驗收主線

---

## 4. 本輪實際交付物

文件：
- `MD126-projectflow-post-md108-phase-p2-retained-component-formalization-work-package-2026-04-13.md`
- `MD127-projectflow-post-md108-phase-p2-retained-component-formalization-progress-2026-04-13.md`
- `MD128-projectflow-post-md108-phase-p2-retained-component-formalization-status-2026-04-13.md`
- `MD129-projectflow-post-md108-phase-p2-retained-component-formalization-final-closure-2026-04-13.md`

程式：
- `src/components/quote-cost-detail-sections.tsx`
- `src/lib/db/vendor-document-contract.ts`
- `src/components/quote-cost-detail-client.tsx`
- `src/lib/db/vendor-package-adapter.ts`

---

## 5. 最終管理結論

### Phase P2 是否完成？
是。

### 是否可正式收口？
可以。

### 是否仍有必要留在 P2 持續打磨？
不建議。

理由：
- 本輪 formalization 目的已完成
- focused regression 已證明 P1 主線未退化
- 再留在 P2 會開始邊際效益下降

---

## 6. 下一步

依 `MD120`，下一步應正式切入：
- **Phase P3 — Home overview active aggregation closure**

且必須遵守：
- 不把 P3 混成 P2 補尾
- 不把 Accounting Center extension 混進來

---

## 7. 一句話總結

> `MD129` 代表 post-MD108 / Phase P2 retained / component formalization 已正式完成：closeout retained 與 active quote-cost skeleton 已完成第一輪 decoupling，vendor document-layer 欄位語意與 latest confirmation snapshot priority 已收成更正式 contract，且 focused regression 4/4 通過，證明 P1 已驗收主線未被 refactor 破壞。