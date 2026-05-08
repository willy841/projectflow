# MD203 — projectflow B2-A-6 section replyOverrides and design/procurement readback replacement spec — 2026-05-08

Status: ACTIVE / EXECUTION SPEC  
Parent lines:
- `MD198-projectflow-local-execution-readback-replacement-execution-spec-2026-05-08.md`
- `MD199-projectflow-source-of-truth-declaration-v1-2026-05-08.md`
- B2-A / legacy compatibility island retirement follow-through

---

## 0. 這份 spec 在做什麼

這份 spec 不是在直接砍 `workflow-cost-bridge.ts`，也不是先砍 `workflow-derived-board.ts`。

它處理的是目前 local execution readback chain 的**第一個 replacement 切口**：

> **先把 `section.replyOverrides` + `savedDesignAssignments` + `savedProcurementAssignments` 這條 design/procurement readback 主鏈，換成正式 DB / read model truth。**

原因很明確：
- 這條鏈同時餵給 `workflow-derived-board.ts` 與 `workflow-cost-bridge.ts`
- 它是目前最有槓桿的共同上游
- 先替換它，board readback 與 cost readback 會一起鬆

---

## 1. 本階段目標

### 1.1 主目標
讓 design / procurement 的以下 readback，不再依賴 local execution persistence：

- `execution-section.replyOverrides`
- `execution-tree.savedDesignAssignments`
- `execution-tree.savedProcurementAssignments`

改由正式來源提供：
- task 正式資料
- confirmation 正式資料
- document generation 正式資料
- 必要的 task assignee / title / requirement / quantity / vendor / amount read model

### 1.2 直接受影響的 legacy consumer
- `src/components/workflow-derived-board.ts`
- `src/components/workflow-cost-bridge.ts`

### 1.3 本階段暫不直接處理
- `savedVendorAssignments`
- `workflow-vendor-package-bridge.ts`
- `vendor package assignment fallback`
- `vendor unpaid / history final replacement`

這些屬下一段，不能和本段混成同一刀。

---

## 2. 為什麼先做這刀

依目前依賴地圖：

### 2.1 `workflow-derived-board.ts` 依賴
- `readStoredExecutionTreeState(project.id)`
- `readStoredExecutionSectionState(project.id)`
- `savedDesignAssignments`
- `savedProcurementAssignments`
- `replyOverrides`

### 2.2 `workflow-cost-bridge.ts` 依賴中的 design/procurement 部分
- `readStoredExecutionTreeState(projectId)`
- `readStoredExecutionSectionState(projectId)`
- `savedDesignAssignments`
- `savedProcurementAssignments`
- `replyOverrides`

也就是：

> **board readback 與 cost readback 的 design/procurement 段，現在共用同一條 local execution readback truth。**

所以最有槓桿的 replacement 不是 vendor package，而是這條共同上游。

---

## 3. 對應 `MD199` 的正式 truth

本階段直接受以下正式規則約束：

### 3.1 設計 / 備品正式內容
只有「正式 confirm 過」的內容，才算正式 truth。

這代表：
- save draft 不算正式 truth
- local reply override 不算正式 truth
- assignment local persistence 不算正式 truth
- 只有正式 confirmation / snapshot / DB writeback 才是下游應相信的內容

### 3.2 Board / downstream 顯示頁
board、summary、downstream readback 未來都只能顯示正式 DB / read model 整理出的答案，
不能再自己拼 local / fallback / bridge 資料。

---

## 4. 現況問題（本段要解的）

### 4.1 `workflow-derived-board.ts` 以 local storage 投影 board truth
目前：
- design board records 從 `savedDesignAssignments + replyOverrides` 投影
- procurement board records 從 `savedProcurementAssignments + replyOverrides` 投影

問題：
- board 真相不是正式 DB
- board detail / board list / project detail downstream card 容易與正式 confirmation 分裂

### 4.2 `workflow-cost-bridge.ts` 的 design/procurement 成本仍吃 local reply truth
目前：
- confirmed reply 是從 local persistence 讀出
- 再 parse amount / vendor / title 組成 cost items

問題：
- quote-cost fallback 的 design/procurement 成本 truth 不是正式 source
- 後續若要退休 client fallback，這段一定得先被替換

### 4.3 local assignment / reply readback 承擔了太多「像正式 truth」的角色
目前 local persistence 同時扮演：
- draft 暫存
- board readback 基底
- cost readback 基底

這違反 `MD199`：
> local / fallback / bridge 不應長期與正式 truth 並存

---

## 5. 本階段 replacement source 設計

### 5.1 Design readback formal source
建議正式來源：
- `design_tasks`
- `task_confirmations`
- `task_confirmation_plan_snapshots`
- 必要的 task meta（title / assignee / project linkage）
- document generation 正式來源

### 5.2 Procurement readback formal source
建議正式來源：
- `procurement_tasks`
- `task_confirmations`
- `task_confirmation_plan_snapshots`
- 必要的 task meta（title / quantity / requirement / project linkage）
- document generation 正式來源

### 5.3 必須輸出的正式 read model 欄位
至少要能提供：
- projectId
- task / execution item linkage
- title / item / requirement / quantity / size / material
- replyCount
- latest confirmed vendor
- latest confirmed amount
- confirmStatus
- documentStatus
- costLocked
- costAmount
- 必要的 confirmed snapshot count / generated document count

---

## 6. Replace consume 面

### 6.1 第一優先 consumer：`workflow-derived-board.ts`
目標：
- design/procurement board readback 改吃正式 read model
- 不再從 local storage projection

完成後：
- `getDesignBoardRecordsForReadback()` 可退場或只留 debug surface
- `getProcurementBoardRecordsForReadback()` 可退場或只留 debug surface

### 6.2 第二優先 consumer：`workflow-cost-bridge.ts` 的 design/procurement 段
目標：
- design / procurement cost items 不再從 `replyOverrides + assignment.replies` parse
- 改從正式 confirmed snapshot / read model 拿 amount / vendor / title

注意：
- 本段只處理 design / procurement cost readback
- vendor package / assignment fallback 仍留到下一段

---

## 7. 分段執行建議

### B2-A-6-1
建立 design/procurement formal read model shape

交付：
- 定義 board / cost 共同可 consume 的正式 read model 輸出

### B2-A-6-2
先切 `workflow-derived-board.ts`

交付：
- design board readback 改吃正式 source
- procurement board readback 改吃正式 source

### B2-A-6-3
再切 `workflow-cost-bridge.ts` 的 design/procurement 段

交付：
- design/procurement cost items 改吃正式 source
- 本段之後 bridge 僅剩 vendor package / vendor assignment fallback 殘留面

---

## 8. 驗證 / parity 設計

### 8.1 Board parity
舊路：
- `workflow-derived-board.ts`
- local execution projection

新路：
- design/procurement formal DB read model

成功條件：
- board list
- board detail
- project detail downstream card
三者一致

### 8.2 Cost parity（本段只驗 design/procurement 段）
舊路：
- `workflow-cost-bridge.ts` 內 design/procurement local parse chain

新路：
- formal confirmed snapshot read model

成功條件：
- quote-cost detail / downstream summary 中 design/procurement 成本，與正式 confirmation 一致

### 8.3 Formal acceptance 必關注
- phase 2 — design project document mainline
- phase 2 — procurement project document mainline
- phase 3 — quote-cost mainline
- pack F — dispatch family routing downstream readback
- 必要時新增 board parity pack

---

## 9. 本段完成條件

要算本段完成，至少要達成：

### B2-A-6-R1
`workflow-derived-board.ts` 不再以 local storage projection 當正式 readback truth

### B2-A-6-R2
`workflow-cost-bridge.ts` 的 design/procurement cost readback 不再 parse local reply persistence

### B2-A-6-R3
design/procurement board + quote-cost design/procurement 段可證明共用正式 truth，而不是各自吃不同 local source

### B2-A-6-R4
正式驗收 / parity 可以證明：
- save draft 不污染正式 downstream
- confirm 後的正式 truth 才會進 board / cost readback

---

## 10. 本段做完後，後面會發生什麼

一旦本段完成：
- `replyOverrides` 對 board / cost 的正式主線影響會被拔掉
- `savedDesignAssignments / savedProcurementAssignments` 對 board / cost 的正式主線影響會被拔掉
- `workflow-cost-bridge.ts` 會被縮成更接近只剩 vendor package / vendor assignment fallback 殘留面
- `workflow-derived-board.ts` 會更接近正式 retirement

也就是：

> **這一刀做完，local execution readback chain 會先鬆最有槓桿的一段。**

---

## 11. 直接結論

B2-A-6 的一句話定義是：

> **先把 design/procurement 的 replyOverrides + assignment readback，從 local execution persistence 換成正式 DB/read model truth，讓 board readback 與 cost readback 一起脫離這條共同上游。**
