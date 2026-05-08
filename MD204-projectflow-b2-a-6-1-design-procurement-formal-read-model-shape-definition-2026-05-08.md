# MD204 — projectflow B2-A-6-1 design/procurement formal read-model shape definition — 2026-05-08

Status: ACTIVE / SHAPE DEFINITION  
Parent:
- `MD203-projectflow-b2-a-6-section-replyoverrides-and-design-procurement-readback-replacement-spec-2026-05-08.md`
- `MD198-projectflow-local-execution-readback-replacement-execution-spec-2026-05-08.md`
- `MD199-projectflow-source-of-truth-declaration-v1-2026-05-08.md`

---

## 0. 這份文件在做什麼

這份文件不是直接改 code，
而是把 B2-A-6 第一個子任務：

> **design / procurement formal read model shape**

定義成可直接落地的欄位規格。

目標是讓下一輪實作時，不必再邊做邊猜：
- board readback 要讀哪些欄位
- cost readback 要讀哪些欄位
- 哪些欄位來自正式 task
- 哪些欄位來自 latest confirmation
- 哪些欄位來自 confirmation snapshots
- 哪些欄位仍需要補 document generation 正式來源

---

## 1. 本 shape 要服務哪些 consumer

本 shape 不是為單一頁面設計，
而是要同時服務兩個 legacy consumer replacement：

### 1.1 Board readback consumer
- `workflow-derived-board.ts`
- design board readback
- procurement board readback

### 1.2 Cost readback consumer
- `workflow-cost-bridge.ts` 的 design/procurement 段

所以這份 shape 必須是：

> **board / cost 共用的 formal read model contract**

而不是又分裂成兩套 truth。

---

## 2. 可確認的正式 DB source

依目前 repo 可查到的正式 source，至少可用：

### 2.1 Task base tables
- `design_tasks`
- `procurement_tasks`

### 2.2 Confirmation tables
- `task_confirmations`
- `task_confirmation_plan_snapshots`

### 2.3 其他已存在正式 adapter / query 參考
repo 內已存在可借鏡的正式 DB 路徑：
- `src/lib/db/design-flow-adapter.ts`
- `src/lib/db/procurement-flow-adapter.ts`
- `src/lib/db/financial-flow-adapter.ts`
- `src/lib/db/project-flow-documents.ts`
- `src/lib/db/home-overview-read-model.ts`

這代表：
- repo 並不是從零開始
- 已有 latest confirmation / snapshots / formal aggregate 的查法可沿用

---

## 3. 共同 canonical row shape

建議先定一個 board / cost 共用的 canonical row：

```ts
export type ProjectFlowFormalReadbackRow = {
  flowType: "design" | "procurement";

  projectId: string;
  taskId: string;
  sourceExecutionItemId: string | null;

  projectName: string;
  taskTitle: string;
  assignee: string | null;

  requirementText: string | null;
  quantityText: string | null;
  sizeText: string | null;
  materialText: string | null;
  referenceUrl: string | null;

  latestConfirmationId: string | null;
  latestConfirmationNo: number | null;
  confirmationStatus: "尚無回覆" | "待確認" | "已確認";

  latestConfirmedVendorName: string | null;
  latestConfirmedAmountLabel: string | null;
  latestConfirmedAmountValue: number | null;

  confirmedReplyCount: number;
  totalReplyCount: number;

  documentStatus: "未生成" | "已生成" | "需更新";
  generatedDocumentCount: number;
  expectedDocumentCount: number;

  costLocked: boolean;
  includeInCost: boolean;
};
```

這個 shape 的原則是：
- board 要看的欄位都在裡面
- cost 要看的欄位也在裡面
- 不再讓 board 與 cost 各自從不同 local source 重組真相

---

## 4. 欄位來源對應

### 4.1 任務 base 欄位
來源：
- `design_tasks`
- `procurement_tasks`

建議承接：
- `projectId`
- `taskId`
- `sourceExecutionItemId`
- `taskTitle`
- `assignee`（至少 design 要有）
- `requirementText`
- `quantityText`（procurement）
- `sizeText`
- `materialText`
- `referenceUrl`

### 4.2 latest confirmation 欄位
來源：
- `task_confirmations`

建議承接：
- `latestConfirmationId`
- `latestConfirmationNo`
- `latestConfirmedVendorName`
- `confirmationStatus`

### 4.3 latest confirmation snapshot 欄位
來源：
- `task_confirmation_plan_snapshots`

建議承接：
- `latestConfirmedAmountLabel`
- `latestConfirmedAmountValue`
- 若 title / requirement 的正式版本以 snapshot 為準，也應從 snapshot 讀

### 4.4 document generation 欄位
目前 local readback 使用：
- `generatedDesignDocuments`
- `generatedProcurementDocuments`

這代表：

> 這塊還需要正式 document generation source 補位，
> 否則 `documentStatus` 只能部分 formalized。

所以在本 shape 裡，先把這兩個欄位留成正式需求：
- `generatedDocumentCount`
- `expectedDocumentCount`

但實作時必須決定正式來源：
- project-level document generation 記錄
- confirmation/document linkage
- 或 formal read model 補算

---

## 5. flow-specific mapping

### 5.1 Design row mapping
Board 需要：
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

對應到 canonical row：
- `taskTitle`
- `sizeText`
- `materialText`
- `totalReplyCount`
- `confirmationStatus`
- `documentStatus`
- `latestConfirmedVendorName`
- `latestConfirmedAmountLabel`
- `latestConfirmedAmountValue`
- `costLocked`

### 5.2 Procurement row mapping
Board 需要：
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

對應到 canonical row：
- `taskTitle`
- `sizeText`
- `materialText`
- `quantityText`
- `totalReplyCount`
- `confirmationStatus`
- `documentStatus`
- `latestConfirmedVendorName`
- `latestConfirmedAmountLabel`
- `latestConfirmedAmountValue`
- `costLocked`
- `requirementText`
- `referenceUrl`

---

## 6. cost readback consume mapping

`workflow-cost-bridge.ts` 的 design/procurement 段目前會產：
- `sourceType`
- `sourceRef`
- `vendorName`
- `adjustedAmount`
- `includedInCost`

在 formal shape 替換後，cost side 至少要能映射：

### Design cost item
```ts
{
  sourceType: "設計",
  sourceRef: `設計文件整理 / ${latestConfirmedVendorName}`,
  vendorName: latestConfirmedVendorName,
  adjustedAmount: latestConfirmedAmountValue,
  includedInCost: costLocked,
}
```

### Procurement cost item
```ts
{
  sourceType: "備品",
  sourceRef: `備品整理 / ${latestConfirmedVendorName}`,
  vendorName: latestConfirmedVendorName,
  adjustedAmount: latestConfirmedAmountValue,
  includedInCost: costLocked,
}
```

前提：
- 只有 confirmationStatus = `已確認` 的 row 才能進 cost item assemble

---

## 7. local 欄位淘汰對照

本 shape 成立後，以下 local readback 欄位應逐步退出正式主線：

### 可淘汰 / 不再作為正式 truth
- `section.replyOverrides[targetId]`
- `assignment.replies`
- `generatedDesignDocuments`（作為 local truth）
- `generatedProcurementDocuments`（作為 local truth）
- `savedDesignAssignments[targetId].data.*`（作為正式 board/cost truth）
- `savedProcurementAssignments[targetId].data.*`（作為正式 board/cost truth）

### 可保留但降級為 draft-only
- assignment local draft fields
- execution-tree 編輯中狀態
- UI drawer 尚未正式 dispatch / confirm 的暫存內容

---

## 8. 本 shape 的未決點

### 8.1 documentStatus 正式來源仍需補足
目前 repo 裡最明確的 local 欄位是：
- `generatedDesignDocuments`
- `generatedProcurementDocuments`

但若要完全 formalize，仍需補：
- project-level document generation 正式 source
- 或 confirmation/document 正式 linkage

### 8.2 totalReplyCount / confirmedReplyCount 是否完全需要保留
若正式產品只相信 latest confirmed truth，
則 totalReplyCount 在某些下游可能只是過渡顯示需求。

這欄位需在實作前再確認：
- 是正式 read model 必要欄位
- 還是僅供 legacy board parity 過渡用途

### 8.3 `待確認` 狀態是否仍由正式資料提供
若 `待確認` 仍要保留，需明確定義：
- 來自 task draft state
- 來自 confirmation existence / absence
- 還是來自另一個 formal task state machine

---

## 9. 本段完成定義

B2-A-6-1 要算完成，至少要達成：

1. board / cost 共用 canonical row shape 已定義
2. 每個欄位已有正式來源對應
3. local 欄位哪些退、哪些降級為 draft-only 已說清楚
4. documentStatus 這類未補齊欄位已被明確標成 open item，而不是假裝已解

---

## 10. 直接結論

這份 shape definition 的一句話版本是：

> **先定一個 board / cost 共用的 design/procurement formal readback row，讓 `workflow-derived-board.ts` 與 `workflow-cost-bridge.ts` 後續 replacement 都吃同一份正式 truth，而不是各自從 local execution persistence 拼資料。**
