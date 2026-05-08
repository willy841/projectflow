# MD206 — projectflow B2-A-6-3 workflow-cost-bridge design/procurement formal consume replacement plan — 2026-05-08

Status: ACTIVE / CONSUMER REPLACEMENT PLAN  
Parent:
- `MD203-projectflow-b2-a-6-section-replyoverrides-and-design-procurement-readback-replacement-spec-2026-05-08.md`
- `MD204-projectflow-b2-a-6-1-design-procurement-formal-read-model-shape-definition-2026-05-08.md`
- `MD205-projectflow-b2-a-6-2-workflow-derived-board-formal-consume-replacement-plan-2026-05-08.md`
- `MD198-projectflow-local-execution-readback-replacement-execution-spec-2026-05-08.md`

---

## 0. 這份 plan 在做什麼

這份文件是 B2-A-6 的第二個 consumer replacement plan。

它處理的是：

> **讓 `workflow-cost-bridge.ts` 的 design/procurement cost readback，從 local reply parse chain 改成 formal read model consume。**

注意：
- 這份 plan 只處理 design/procurement 段
- vendor package / vendor assignment fallback 仍是下一段
- 本段完成後，`workflow-cost-bridge.ts` 會更接近只剩 vendor side 殘留面

---

## 1. 現況 consumer 問題

目前 `workflow-cost-bridge.ts` 的 design/procurement 成本來源是：
- `readStoredExecutionTreeState(projectId)`
- `readStoredExecutionSectionState(projectId)`
- `savedDesignAssignments`
- `savedProcurementAssignments`
- `replyOverrides`
- `assignment.replies`
- `parseReplyMessage(reply)`
- `parseCurrency(parsed.amount)`

它的實際流程是：
1. 從 local persistence 拿 replies
2. parse 出 confirmed / vendor / amount / title
3. 直接組成 quote-cost fallback item

問題是：

> **這段目前不是在 consume 正式 confirmation truth，而是在 consume local reply parse truth。**

這與 `MD199` 直接衝突。

---

## 2. 本 consumer replacement 的目標

### 2.1 最終目標
讓 design/procurement cost item 的 assemble，改為 consume：
- `ProjectFlowFormalReadbackRow[]`

而不是 consume：
- local reply chain

### 2.2 中間型態
在 vendor side 尚未替換前，允許 `workflow-cost-bridge.ts` 暫時仍存在，
但它的角色要改成：

> **formal design/procurement cost mapper + legacy vendor package fallback holder**

而不是：

> **整段都由 local readback 直接拼成本項。**

---

## 3. 替換後的 consumer contract

### 3.1 新 input contract
建議新增或改造為：

```ts
buildFormalDesignProcurementCostItems(rows: ProjectFlowFormalReadbackRow[]): CostLineItem[]
```

或拆成：

```ts
buildFormalDesignCostItems(rows: ProjectFlowFormalReadbackRow[]): CostLineItem[]
buildFormalProcurementCostItems(rows: ProjectFlowFormalReadbackRow[]): CostLineItem[]
```

### 3.2 transitional 包法
若要減少改動面，可先保留：
- `getQuoteCostProjectsForClientFallback()`

但把其中 design/procurement 段替換成：
- formal rows → cost items

而 vendor 段仍留在 legacy path。

這樣可先把整條 bridge 切成兩半：
- **formalized segment**：design/procurement
- **legacy residual segment**：vendor package / assignment fallback

---

## 4. design cost mapping plan

目前 design 段 cost item 需要輸出：
- `id`
- `itemName`
- `sourceType`
- `sourceRef`
- `vendorName`
- `originalAmount`
- `adjustedAmount`
- `includedInCost`
- `isManual`

### 對應 canonical row
- `id` → `formal-design-${projectId}-${taskId}-${latestConfirmationId ?? "no-confirmation"}`
- `itemName` → `taskTitle`
- `sourceType` → `"設計"`
- `sourceRef` → `設計文件整理 / ${latestConfirmedVendorName ?? "未指定廠商"}`
- `vendorName` → `latestConfirmedVendorName`
- `originalAmount` → `latestConfirmedAmountValue ?? 0`
- `adjustedAmount` → `latestConfirmedAmountValue ?? 0`
- `includedInCost` → `costLocked && confirmationStatus === "已確認"`
- `isManual` → `false`

### cost item 納入條件
只有在以下條件成立時才進 cost item：
- `flowType === "design"`
- `confirmationStatus === "已確認"`
- `latestConfirmedAmountValue !== null`

### local 專屬邏輯要退出的部分
- `section.replyOverrides[targetId] ?? assignment.replies ?? []`
- `parseReplyMessage(reply)`
- `parseCurrency(parsed.amount)`
- `parsed.vendor`
- `parsed.title`

---

## 5. procurement cost mapping plan

目前 procurement 段 cost item 需要輸出：
- `id`
- `itemName`
- `sourceType`
- `sourceRef`
- `vendorName`
- `originalAmount`
- `adjustedAmount`
- `includedInCost`
- `isManual`

### 對應 canonical row
- `id` → `formal-procurement-${projectId}-${taskId}-${latestConfirmationId ?? "no-confirmation"}`
- `itemName` → `taskTitle`
- `sourceType` → `"備品"`
- `sourceRef` → `備品整理 / ${latestConfirmedVendorName ?? "未指定廠商"}`
- `vendorName` → `latestConfirmedVendorName`
- `originalAmount` → `latestConfirmedAmountValue ?? 0`
- `adjustedAmount` → `latestConfirmedAmountValue ?? 0`
- `includedInCost` → `costLocked && confirmationStatus === "已確認"`
- `isManual` → `false`

### cost item 納入條件
只有在以下條件成立時才進 cost item：
- `flowType === "procurement"`
- `confirmationStatus === "已確認"`
- `latestConfirmedAmountValue !== null`

### local 專屬邏輯要退出的部分
- `section.replyOverrides[targetId] ?? assignment.replies ?? []`
- `parseReplyMessage(reply)`
- `parseCurrency(parsed.amount)`
- `parsed.vendor`
- `parsed.title`

---

## 6. 與 quote-cost client fallback 的關係

目前 `getQuoteCostProjectsForClientFallback()` 會：
- 先保留 seed items
- 再塞 workflowItems

本段完成後，design/procurement 的 `workflowItems` 應改成來自：
- formal read model rows

而不是來自：
- local reply parse chain

所以完成後，這支 bridge 內部會形成清楚分層：

### formalized in this stage
- design cost items
- procurement cost items

### still legacy after this stage
- vendor package / vendor assignment segment

---

## 7. 實作切法建議

### B2-A-6-3-1
先抽 mapper

交付：
- `buildFormalDesignCostItems()`
- `buildFormalProcurementCostItems()`

### B2-A-6-3-2
把 `buildWorkflowCostItems()` 切段

交付：
- design/procurement 改走 formal mapper
- vendor segment 暫時保留 legacy path

### B2-A-6-3-3
更新 boundary 描述

交付：
- `workflowCostBridgeBoundary` 要能明確描述：
  - design/procurement 段已 formalized
  - vendor 段仍 legacy residual

---

## 8. parity 驗證設計

### 8.1 Design/procurement cost parity
舊路：
- local reply parse chain

新路：
- formal read model rows

成功條件：
- quote-cost detail 中 design/procurement 成本一致
- downstream summary 中 design/procurement 成本一致
- closeout / downstream financial readback 不因 local save draft 污染

### 8.2 Cross-page parity
至少應交叉驗：
- board readback（若 B2-A-6-2 已切）
- quote-cost detail/list
- downstream summary / closeout relevant totals

成功條件：
- 同一 task 的 vendor / amount / confirmed truth 在 board 與 cost side 一致

### 8.3 回歸風險點
- 若 latest confirmation snapshot 與 task base title / requirement 有版本差異，哪個欄位應優先採用
- `documentStatus` 仍未完全 formalized 時，cost side 是否應完全無視它
- `costLocked` 是否應等價於 `confirmationStatus === 已確認`

---

## 9. 本段完成條件

B2-A-6-3 要算完成，至少要達成：

1. `workflow-cost-bridge.ts` 的 design/procurement 段不再 parse local reply persistence
2. design/procurement cost items 來自 canonical formal row mapping
3. quote-cost fallback 內只剩 vendor segment 屬於 legacy residual
4. board 與 cost 兩側已可證明 design/procurement 段共用同一份正式 truth

---

## 10. 做完這段後，後面會發生什麼

如果 B2-A-6-3 完成：
- `replyOverrides` 對 cost 主線的 design/procurement 影響會被拔掉
- `savedDesignAssignments / savedProcurementAssignments` 對 cost 主線的影響會被拔掉
- `workflow-cost-bridge.ts` 會被縮成幾乎只剩 vendor package / vendor assignment fallback
- 後續 B2-A 主線就能專注拆 vendor side 殘留鏈

也就是：

> **本段做完，workflow cost bridge 會從全段 legacy，縮成半 formal / 半 residual 的過渡態。**

---

## 11. 直接結論

這份 consumer replacement plan 的一句話版本是：

> **先把 `workflow-cost-bridge.ts` 的 design/procurement cost readback，從 local reply parse chain 改成 formal read model consume，讓這支 bridge 之後只剩 vendor package / assignment fallback 殘留面需要處理。**
