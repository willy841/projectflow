# MD207 — projectflow vendor residual assignment fallback replacement shape — 2026-05-08

Status: ACTIVE / EXECUTION SHAPE  
Parent:
- `MD198-projectflow-local-execution-readback-replacement-execution-spec-2026-05-08.md`
- `MD199-projectflow-source-of-truth-declaration-v1-2026-05-08.md`
- vendor residual chain follow-through after B2-A-6

---

## 0. 這份文件在做什麼

這份文件不是直接刪 `workflow-vendor-package-bridge.ts`。

它處理的是 vendor residual chain 裡，assignment fallback 這一段的最小 replacement shape：

> **把目前從 `savedVendorAssignments` draft shape 硬轉 package-like shape 的三個欄位，改成由正式 source / read model 提供。**

這三個欄位是：
- `vendorName`
- `title`
- `requirement`

---

## 1. 現況問題

目前 `buildFallbackPackagesFromAssignments(projectId)` 做的事是：

1. 從 `execution-tree.savedVendorAssignments` 讀 draft
2. 用 `vendorName` 分組成 package
3. 用 `title` 當 itemName
4. 用 `requirement` 當 requirementText

也就是：

> **assignment fallback 並不是正式 vendor package source，**
> **而是 draft → package-like projection。**

這違反 `MD199`：
- draft / local / bridge 不應長期扮演正式 truth

---

## 2. 三個欄位的正式來源對應

### 2.1 `vendorName`
目前 draft 來源：
- `savedVendorAssignments[targetId].data.vendorName`

建議正式來源：
- `vendor_tasks.vendor_id`
- join `vendors.name`
- 或 `vendor_flow_adapter` / `vendor_package_adapter` 已整理出的 vendor name

原則：
- 以 vendor identity 為正式來源
- 不再相信 local draft string 本身

### 2.2 `title`
目前 draft 來源：
- `savedVendorAssignments[targetId].data.title`

建議正式來源：
- `vendor_tasks.title`
- 或 task snapshot / plan snapshot 的正式 title
- 若需 package item title，應以 vendor flow formal row / package adapter item title 為準

原則：
- 不再由 local draft title 直接扮演正式 package item name

### 2.3 `requirement`
目前 draft 來源：
- `savedVendorAssignments[targetId].data.requirement`

建議正式來源：
- `vendor_tasks.requirement_text`
- 或 `vendor_document_contract` / vendor flow adapter 內的 requirementText

原則：
- 不再由 local draft requirement 扮演正式 requirementText

---

## 3. 可直接對接的現有正式 DB 路徑

目前 repo 內已存在可直接沿用的正式路徑：

### 3.1 `src/lib/db/vendor-flow-adapter.ts`
已可提供：
- `vendorName`
- `title`
- `requirementText`
- plan / snapshot / confirm 相關資訊

這是 assignment fallback replacement 的最直接候選來源。

### 3.2 `src/lib/db/vendor-package-adapter.ts`
已可提供 package-level grouping：
- package id
- code
- vendorName
- item list
- requirementText

這是 replacement 後用來取代 package-like fallback grouping 的直接候選。

### 3.3 `src/lib/db/vendor-document-contract.ts`
已定義 vendor document item contract：
- `itemName`
- `requirementText`

這可作為 package item-level formal shape 的 contract 參考。

---

## 4. 建議的最小正式 row shape

建議先定一個 assignment fallback replacement 最小 row：

```ts
export type VendorPackageFormalFallbackRow = {
  projectId: string;
  vendorTaskId: string;
  sourceExecutionItemId: string | null;

  vendorId: string | null;
  vendorName: string;

  itemTitle: string;
  requirementText: string;

  packageId: string | null;
  packageCode: string | null;
};
```

這個 shape 的目的不是最終頁面顯示，
而是讓目前的 package-like fallback 至少改為 consume 正式 row，
而不是 consume assignment draft。

---

## 5. 從 row 到 package-like grouping 的 transitional 做法

在完全退休 `workflow-vendor-package-bridge.ts` 之前，可接受的過渡做法是：

1. 先從正式來源取 `VendorPackageFormalFallbackRow[]`
2. 再用正式 row 做 package grouping
3. 如果 package adapter 已能直接提供 package-level output，則更好

也就是：

### 舊路
- draft assignment
- `vendorName/title/requirement`
- package-like grouping

### 新路
- formal vendor row
- `vendorName/title/requirementText`
- package-like grouping（transitional）

重點在於：
- grouping 可以暫時保留
- **但輸入 row 必須先正式化**

---

## 6. 哪些東西應降級成 draft-only

如果這段 replacement 成立，以下欄位應降級為 draft-only：

- `savedVendorAssignments[targetId].data.vendorName`
- `savedVendorAssignments[targetId].data.title`
- `savedVendorAssignments[targetId].data.requirement`

它們仍可保留作為：
- 尚未正式送出前的編輯狀態
- UI drawer draft
- local temp state

但不能再作為：
- workflow cost vendor package fallback 的正式輸入 truth

---

## 7. 本段的完成條件

要算 assignment fallback replacement shape 完成，至少要達成：

1. `vendorName/title/requirement` 三個欄位已對應正式來源
2. 已定義最小 formal row shape
3. 已明確指出哪個現有 DB adapter 可直接提供這些欄位
4. 已明確指出 local draft 欄位只能降級為 draft-only，不再扮演正式 package source

---

## 8. 直接結論

這份文件的一句話版本是：

> **assignment fallback 真正要替換的不是整包 `savedVendorAssignments`，而是其中 `vendorName`、`title`、`requirement` 三個目前被拿來硬轉 package-like shape 的欄位；這三個欄位可直接改由 `vendor-flow-adapter` / `vendor-package-adapter` 等正式 DB 路徑提供。**
