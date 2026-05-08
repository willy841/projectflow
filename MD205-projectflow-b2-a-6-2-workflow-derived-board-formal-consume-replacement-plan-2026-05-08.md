# MD205 — projectflow B2-A-6-2 workflow-derived-board formal consume replacement plan — 2026-05-08

Status: ACTIVE / CONSUMER REPLACEMENT PLAN  
Parent:
- `MD203-projectflow-b2-a-6-section-replyoverrides-and-design-procurement-readback-replacement-spec-2026-05-08.md`
- `MD204-projectflow-b2-a-6-1-design-procurement-formal-read-model-shape-definition-2026-05-08.md`
- `MD198-projectflow-local-execution-readback-replacement-execution-spec-2026-05-08.md`

---

## 0. 這份 plan 在做什麼

這份文件是 B2-A-6 的第一個 consumer replacement plan。

它處理的是：

> **先讓 `workflow-derived-board.ts` 從 local execution projection consumer，改成 formal read model consumer。**

這不是最終直接刪檔，
而是把 `workflow-derived-board.ts` 的替換路徑定清楚，
讓下一輪實作可以照著切，不必再一邊讀 code 一邊猜。

---

## 1. 現況 consumer 問題

目前 `workflow-derived-board.ts` 直接依賴：
- `readStoredExecutionTreeState(project.id)`
- `readStoredExecutionSectionState(project.id)`
- `savedDesignAssignments`
- `savedProcurementAssignments`
- `replyOverrides`

它做的事情本質上是：

### 1.1 Design side
把 local execution state 投影成：
- design board list row
- design board downstream readback row

### 1.2 Procurement side
把 local execution state 投影成：
- procurement board list row
- procurement board downstream readback row

問題是：

> **這個 consumer 現在不是在顯示正式 truth，而是在顯示 local projection truth。**

這與 `MD199` 直接衝突。

---

## 2. 本 consumer replacement 的目標

### 2.1 最終目標
讓以下兩個 export：
- `getDesignBoardRecordsForReadback()`
- `getProcurementBoardRecordsForReadback()`

不再從 local storage projection 資料，
而是從 B2-A-6-1 定義的 canonical formal read model row 映射。

### 2.2 中間型態
在完全退休前，允許 `workflow-derived-board.ts` 暫時存在，
但它的角色必須被改成：

> **formal row → board row mapper**

而不是：

> **local storage → board truth projection bridge**

這個角色轉換很重要。

---

## 3. 替換後的 consumer contract

### 3.1 新 input contract
建議 `workflow-derived-board.ts` 改為 consume：

- `ProjectFlowFormalReadbackRow[]`

而不是 consume：
- `projects + local storage + local replies`

### 3.2 建議的新 export surface
可考慮收斂成：

```ts
getDesignBoardRecordsFromFormalRows(rows: ProjectFlowFormalReadbackRow[]): DesignTaskBoardRecord[]
getProcurementBoardRecordsFromFormalRows(rows: ProjectFlowFormalReadbackRow[]): ProcurementBoardRecord[]
```

### 3.3 transitional 階段可接受的包法
若要減少一次改動面，也可先採 adapter 包法：

```ts
getDesignBoardRecordsForReadback(projects) {
  const rows = getFormalDesignReadbackRows(projectIds)
  return mapFormalRowsToDesignBoardRecords(rows)
}
```

```ts
getProcurementBoardRecordsForReadback(projects) {
  const rows = getFormalProcurementReadbackRows(projectIds)
  return mapFormalRowsToProcurementBoardRecords(rows)
}
```

但重點是：
- local storage 不再是 truth source
- 即使函式名先保留，內部 source 也必須已切換

---

## 4. design mapping plan

目前 design board row 需要輸出：
- `id`
- `projectId`
- `projectName`
- `title`
- `size`
- `material`
- `replyCount`
- `confirmStatus`
- `documentStatus`
- `vendorName`
- `costLabel`
- `costAmount`
- `costLocked`

### 對應 canonical row
- `id` → `${projectId}-${taskId}` 或 canonical row stable key
- `projectId` → `projectId`
- `projectName` → `projectName`
- `title` → `taskTitle`
- `size` → `sizeText ?? "未填寫"`
- `material` → `materialText ?? "未填寫"`
- `replyCount` → `totalReplyCount`
- `confirmStatus` → `confirmationStatus`
- `documentStatus` → `documentStatus`
- `vendorName` → `latestConfirmedVendorName ?? "未指定"`
- `costLabel` → `latestConfirmedAmountLabel ?? "待確認後成立"`
- `costAmount` → `latestConfirmedAmountValue ?? 0`
- `costLocked` → `costLocked`

### local 專屬邏輯要退出的部分
以下應從 design board mapper 退出：
- `section.replyOverrides[targetId] ?? assignment.replies ?? []`
- `confirmedReplies` local regroup
- `generatedDesignDocuments[vendorName]`
- `project.executionItems.find(...)` 作為正式 title truth

---

## 5. procurement mapping plan

目前 procurement board row 需要輸出：
- `id`
- `projectId`
- `projectName`
- `title`
- `size`
- `material`
- `quantity`
- `replyCount`
- `confirmStatus`
- `documentStatus`
- `vendorName`
- `costLabel`
- `costAmount`
- `costLocked`
- `note`
- `referenceUrl`
- `plans`
- `documentRows`

### 對應 canonical row
- `id` → `${projectId}-${taskId}` 或 canonical row stable key
- `projectId` → `projectId`
- `projectName` → `projectName`
- `title` → `taskTitle`
- `size` → `sizeText ?? "未填寫"`
- `material` → `materialText ?? "未填寫"`
- `quantity` → `quantityText ?? "未填寫"`
- `replyCount` → `totalReplyCount`
- `confirmStatus` → `confirmationStatus`
- `documentStatus` → `documentStatus`
- `vendorName` → `latestConfirmedVendorName ?? "未指定"`
- `costLabel` → `latestConfirmedAmountLabel ?? "待確認後成立"`
- `costAmount` → `latestConfirmedAmountValue ?? 0`
- `costLocked` → `costLocked`
- `note` → `requirementText ?? ""`
- `referenceUrl` → `referenceUrl ?? ""`
- `plans` → transitional empty or future formal plan rows
- `documentRows` → transitional empty or future formal document rows

### local 專屬邏輯要退出的部分
以下應從 procurement board mapper 退出：
- `section.replyOverrides[targetId] ?? assignment.replies ?? []`
- `generatedProcurementDocuments[project.id]`
- `assignment.item || project.executionItems.find(...)`

---

## 6. 實作切法建議

### B2-A-6-2-1
先抽 mapper，不先刪函式名

交付：
- `mapFormalRowsToDesignBoardRecords()`
- `mapFormalRowsToProcurementBoardRecords()`

目的：
- 先把 mapping 與 local source 解耦

### B2-A-6-2-2
再改 source provider

交付：
- 舊函式名仍可保留
- 但內部改成吃 formal rows

### B2-A-6-2-3
最後再決定是否 retire 旧 export 名稱

若外部 consumer 已穩定，才考慮：
- rename
- retire
- 或把 `workflow-derived-board.ts` 縮成 pure mapper 檔

---

## 7. parity 驗證設計

### 7.1 Design board parity
必驗：
- board list
- board detail
- project detail downstream card

成功條件：
- 三者 design 欄位一致
- confirm 後 vendor / amount / cost locked 一致
- draft save 不會污染正式 board readback

### 7.2 Procurement board parity
必驗：
- board list
- board detail
- project detail downstream card

成功條件：
- quantity / note / vendor / amount / document status 一致
- confirm 後才成為正式 truth

### 7.3 回歸風險點
- `待確認` / `尚無回覆` 邏輯是否與正式 state machine 對齊
- `documentStatus` 正式來源是否暫時仍需 transitional adapter
- `plans` / `documentRows` 若仍為空陣列，是否與現行 UI 預期一致

---

## 8. 本段完成條件

B2-A-6-2 要算完成，至少要達成：

1. `workflow-derived-board.ts` 已不直接從 local storage 取 design/procurement 正式 truth
2. design board rows 來自 canonical formal row mapping
3. procurement board rows 來自 canonical formal row mapping
4. legacy local projection 邏輯已退出正式 consumer 路徑
5. board parity 驗證通過

---

## 9. 做完這段後，能往哪裡推

如果 B2-A-6-2 完成：
- `workflow-derived-board.ts` 會從 projection bridge 降級成 formal mapper / thin adapter
- local readback chain 對 board 主線的控制力會大幅下降
- 下一刀 B2-A-6-3 就能更專注切 `workflow-cost-bridge.ts` 的 design/procurement 段

也就是：

> **先把 board side 脫 local，再讓 cost side 跟進。**

---

## 10. 直接結論

這份 consumer replacement plan 的一句話版本是：

> **先把 `workflow-derived-board.ts` 從 local execution projection bridge，改造成 formal read model mapper，讓 design/procurement board readback 不再直接依賴 `replyOverrides` 與 assignment local persistence。**
