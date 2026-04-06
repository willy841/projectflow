# MD17 - projectflow MD 文件整理清單（2026-04-04）

> 用途：整理目前 `projectflow` 相關 MD 文件的角色、優先級與處理建議。
> 目標不是立刻刪檔，而是先把：
> - 哪些文件應保留為主幹
> - 哪些應標記過時 / 僅供歷史回查
> - 哪些適合檢查後合併或淘汰
> 明確列出，避免後續新對話或新 agent 被過多舊 handoff 誤導。

---

# 1. 一句話總結

目前 `projectflow` 的 MD 文件已經進一步收斂成：
- **最新主幹文件** 已明確轉移到 `MD-MASTER + MD21 + MD22`
- `MD18 / MD19 / MD20` 屬輔助規則檔
- `MD16` 已降級為歷史 handoff
- 更早期 handoff 大多應視為歷史回查

因此目前最合理的整理策略是：

> **主幹以 `MD-MASTER + MD21 + MD22` 為核心；其餘文件依角色分成輔助規則檔、歷史 handoff、歷史回查。**

---

# 2. 文件分級原則

## A. 主幹文件
定義：
- 目前仍應作為續接入口
- 角色清楚、內容仍有效
- 不應被歷史 handoff 取代

## B. 歷史回查文件
定義：
- 內容仍有保留價值
- 但高階結論已被母檔或更新 handoff 吸收
- 不應再作為新續接的主要入口

## C. 待檢查是否合併 / 淘汰文件
定義：
- 範圍偏單點或局部微調
- 後續內容高機率已完整覆蓋
- 需要人工檢查後再決定保留、合併或淘汰

---

# 3. 主幹文件（最新版建議）

## 3.1 `MD-MASTER-projectflow-system-source-of-truth.md`
### 判斷
- **絕對保留**
- 目前最高優先高階母檔

### 建議角色
- `projectflow` 的高階總控母檔
- 新對話 / 新 agent 的第一閱讀入口

---

## 3.2 `MD21-projectflow-project-detail-responsibility-redistribution-spec-2026-04-05.md`
### 判斷
- **主幹必讀**
- 已成為目前最新的產品結構 / 頁面責任 / 三條主線承接 spec

### 建議角色
- `Project Detail` 與三條主線的正式責任分配 spec
- 2026-04-05 後產品主線的第一依據

---

## 3.3 `MD22-projectflow-mock-closed-loop-frontend-execution-brief-2026-04-05.md`
### 判斷
- **主幹必讀**
- 已成為目前最新的前端 mock 閉環版工程執行交辦

### 建議角色
- CTO / 實作者的當前工程執行交辦單
- `MD21` 的工程執行補充

---

## 3.4 `MD15-projectflow-repo-audit-summary-v1-2026-04-04.md`
### 判斷
- **保留**
- 角色與主 spec 不重複
- 站在 repo audit 視角盤點已落地狀態，仍有價值

### 建議角色
- repo 現況盤點檔
- 已落地 vs 未封板 vs MVP 邊界判斷檔

---

## 3.5 `MD14-projectflow-progress-review-and-next-step-handoff-2026-04-04.md`
### 判斷
- **保留，但不再是最新主幹 spec**

### 建議角色
- 進度盤點與成熟度判斷檔
- 歷史進度參照檔

---

# 4. 歷史回查文件（建議保留，但標記過時）

這一區的文件不建議刪，
但建議在檔案開頭加明確標示：

> `本檔已被 MD-MASTER / MD14 / MD16 大幅吸收，僅供歷史回查；新續接請先讀最新主幹文件。`

---

## 4.1 `MD1-projectflow-handover.md`
### 判斷
- **建議標記過時 / 僅供歷史回查**

### 原因
- 屬早期 handover
- 高階內容已被母檔吸收

---

## 4.2 `MD4-conversation-context-rule-and-vendor-flow-notes-2026-03-31.md`
### 判斷
- **建議標記過時 / 僅供歷史回查**

### 原因
- 屬早期規則與 vendor flow 脈絡
- 母檔已覆蓋高階結論

---

## 4.3 `MD5-vendor-flow-context-handoff-2026-03-31.md`
### 判斷
- **建議標記過時 / 僅供歷史回查**

### 原因
- 屬 vendor flow 早期 handoff
- 已被母檔吸收

---

## 4.4 `MD6-vendor-flow-v1-cto-delivery-2026-04-01.md`
### 判斷
- **建議標記過時 / 僅供歷史回查**

### 原因
- 屬早期 CTO 交付脈絡
- 價值在歷史回查，不在主線閱讀

---

## 4.5 `MD7-vendor-flow-discussion-handoff-2026-04-01.md`
### 判斷
- **建議標記過時 / 僅供歷史回查**

### 原因
- 討論已被後續定稿覆蓋
- 不應再當主入口

---

## 4.6 `MD8-package-page-final-outgoing-document-handoff-2026-04-02.md`
### 判斷
- **建議標記過時 / 僅供歷史回查**

### 原因
- package / final document 規格已被母檔吸收

---

## 4.7 `MD9-project-detail-vendor-information-architecture-handoff-2026-04-02.md`
### 判斷
- **建議標記過時 / 僅供歷史回查**

### 原因
- Project Detail 與 vendor IA 的高階結論已進母檔

---

## 4.8 `MD10-projectflow-deployment-debug-and-integration-reset-handoff-2026-04-02.md`
### 判斷
- **建議標記過時 / 僅供歷史回查**

### 原因
- 部署 debug 與 integration reset 已不再是當前主線
- 但保留有歷史查證價值

---

## 4.9 `MD11-projectflow-integration-progress-and-next-planning-handoff-2026-04-02.md`
### 判斷
- **建議標記過時 / 僅供歷史回查**

### 原因
- 進度與規劃內容已被 MD14 / 母檔後續覆蓋

---

## 4.10 `MD12-projectflow-this-page-ui-followup-2026-04-03.md`
### 判斷
- **建議標記過時 / 僅供歷史回查**

### 原因
- 範圍高度單點，僅聚焦 `execution-tree-section.tsx` 的頁面級 UI / 互動補強
- 內容仍有歷史脈絡價值，但不再適合作為主幹閱讀入口
- 高階結論已被母檔 / MD14 / MD16 後續狀態吸收

### 建議處理方式
- 不刪
- 不合併進主幹
- 改列為歷史回查檔，並加過時標頭

---

# 5. 待檢查是否合併 / 淘汰的文件

## 5.1 其他未來新增的單頁 follow-up / 微調型 MD
### 判斷
- 原則上都應進這一類

### 建議規則
若文件屬於：
- 單頁 UI 微調
- 局部 follow-up
- 某一輪暫時性檢查

則應優先判斷：
- 是否已被母檔 / 最新 handoff 吸收
- 是否只剩歷史查證價值
- 是否適合移至歷史區而非留在主幹序列

---

# 6. 建議閱讀順序（整理後）

## 新對話 / 新 agent 建議閱讀順序
1. `MD-MASTER-projectflow-system-source-of-truth.md`
2. `MD21-projectflow-project-detail-responsibility-redistribution-spec-2026-04-05.md`
3. `MD22-projectflow-mock-closed-loop-frontend-execution-brief-2026-04-05.md`
4. `MD18-projectflow-44-commit-review-and-redo-plan-2026-04-05.md`
5. `MD20-projectflow-approved-ui-lock-rule-2026-04-05.md`
6. `MD15-projectflow-repo-audit-summary-v1-2026-04-04.md`

### 補充說明
- 若要看高階主線：先看 **MD-MASTER**
- 若要看目前正式產品責任與頁面結構：看 **MD21**
- 若要看目前工程執行交辦：看 **MD22**
- 若要看工程紅線與 commit 背景：看 **MD18**
- 若要看已驗收 UI 鎖定邊界：看 **MD20**
- 若要盤 repo 現況：看 **MD15**

---

# 7. 建議整理順序

## Step 1：先標記過時，不急著刪
優先對以下文件加統一標頭：
- MD1
- MD4～MD11
- 可能包含 MD12

建議標頭語氣：
> 本檔已被 MD-MASTER / MD14 / MD16 大幅吸收，僅供歷史回查；新續接請先讀最新主幹文件。

## Step 2：檢查 MD12 是否值得保留
- 若內容已被主幹文件吸收，優先考慮降級為 historical 或淘汰

## Step 3：之後再考慮 archive 結構
- 等閱讀動線穩了，再把 historical 文件集中整理
- 先不要急著搬動，以免打斷目前續接習慣

---

# 8. 最終判斷

## 應保留主幹
- `MD-MASTER-projectflow-system-source-of-truth.md`
- `MD20-projectflow-approved-ui-lock-rule-2026-04-05.md`
- `MD21-projectflow-project-detail-responsibility-redistribution-spec-2026-04-05.md`
- `MD22-projectflow-mock-closed-loop-frontend-execution-brief-2026-04-05.md`
- `MD23-projectflow-db-schema-v1-draft-2026-04-05.md`
- `MD24-projectflow-db-schema-v1-table-walkthrough-2026-04-05.md`
- `MD25-projectflow-db-phase1-migration-plan-2026-04-05.md`
- `MD26-projectflow-formal-data-closure-validation-plan-2026-04-06.md`
- `MD15-projectflow-repo-audit-summary-v1-2026-04-04.md`

## 應標記過時 / 歷史回查
- `MD1-projectflow-handover.md`
- `MD4-conversation-context-rule-and-vendor-flow-notes-2026-03-31.md`
- `MD5-vendor-flow-context-handoff-2026-03-31.md`
- `MD6-vendor-flow-v1-cto-delivery-2026-04-01.md`
- `MD7-vendor-flow-discussion-handoff-2026-04-01.md`
- `MD8-package-page-final-outgoing-document-handoff-2026-04-02.md`
- `MD9-project-detail-vendor-information-architecture-handoff-2026-04-02.md`
- `MD10-projectflow-deployment-debug-and-integration-reset-handoff-2026-04-02.md`
- `MD11-projectflow-integration-progress-and-next-planning-handoff-2026-04-02.md`
- `MD12-projectflow-this-page-ui-followup-2026-04-03.md`
- `MD13-projectflow-ui-polish-handoff-2026-04-03.md`
- `MD14-projectflow-progress-review-and-next-step-handoff-2026-04-04.md`
- `MD16-projectflow-current-round-handoff-2026-04-04.md`
- `MD18-projectflow-44-commit-review-and-redo-plan-2026-04-05.md`
- `MD19-projectflow-page-by-page-ui-review-summary-2026-04-05.md`

## 應優先檢查是否合併 / 淘汰
- 未來任何單頁 / 單點 / 局部微調型 follow-up MD

---

# 9. 2026-04-06 最新整理決議

本輪整理後，最新文件結構應理解為：

## A. 現行主幹（續接必讀）
- `MD-MASTER-projectflow-system-source-of-truth.md`
- `MD20-projectflow-approved-ui-lock-rule-2026-04-05.md`
- `MD21-projectflow-project-detail-responsibility-redistribution-spec-2026-04-05.md`
- `MD22-projectflow-mock-closed-loop-frontend-execution-brief-2026-04-05.md`
- `MD23-projectflow-db-schema-v1-draft-2026-04-05.md`
- `MD24-projectflow-db-schema-v1-table-walkthrough-2026-04-05.md`
- `MD25-projectflow-db-phase1-migration-plan-2026-04-05.md`
- `MD26-projectflow-formal-data-closure-validation-plan-2026-04-06.md`

## B. 現行輔助但非主入口
- `MD15-projectflow-repo-audit-summary-v1-2026-04-04.md`
- `MD17-projectflow-md-cleanup-plan-2026-04-04.md`

## C. 歷史回查 / 不再作為主入口
- `MD1`
- `MD4`～`MD14`
- `MD16`
- `MD18`
- `MD19`
- `MD-projectflow-left-sidebar-root-cause-2026-04-04.md`

# 10. 一句話交接

> `projectflow` 的 MD 主幹已正式收斂到 `MD-MASTER + MD20～MD26`；更早期 handoff 與收斂檔應視為歷史回查，不可再拿來覆蓋最新主線結論。
