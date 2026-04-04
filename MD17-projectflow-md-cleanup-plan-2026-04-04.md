# MD17 - projectflow MD 文件整理清單（2026-04-04）

> 用途：整理目前 `projectflow` 相關 MD 文件的角色、優先級與處理建議。
> 目標不是立刻刪檔，而是先把：
> - 哪些文件應保留為主幹
> - 哪些應標記過時 / 僅供歷史回查
> - 哪些適合檢查後合併或淘汰
> 明確列出，避免後續新對話或新 agent 被過多舊 handoff 誤導。

---

# 1. 一句話總結

目前 `projectflow` 的 MD 文件已經形成：
- **主幹文件** 已清楚存在
- **歷史 handoff** 仍大量保留
- **部分單點 follow-up 文件** 已有被後續內容覆蓋的跡象

因此目前最合理的整理策略是：

> **先建立清楚的文件分級與閱讀順序，再決定哪些標記過時、哪些進一步合併或淘汰。**

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

# 3. 主幹文件（建議保留）

## 3.1 `MD-MASTER-projectflow-system-source-of-truth.md`
### 判斷
- **絕對保留**
- 目前最高優先 source of truth
- 已吸收大量正式規格與高階決策

### 建議角色
- `projectflow` 的唯一高階母檔
- 新對話 / 新 agent 的第一閱讀入口

---

## 3.2 `MD14-projectflow-progress-review-and-next-step-handoff-2026-04-04.md`
### 判斷
- **保留**
- 角色清楚：進度總盤點與下一步建議

### 建議角色
- 進度盤點檔
- 成熟度判斷檔

### 注意
- 不建議再承接太多細規格，避免與母檔打架

---

## 3.3 `MD15-projectflow-repo-audit-summary-v1-2026-04-04.md`
### 判斷
- **保留**
- 角色與 MD14 不重複
- 站在 repo audit 視角盤點目前已落地狀態，很有價值

### 建議角色
- repo 現況盤點檔
- 已落地 vs 未封板 vs MVP 邊界判斷檔

---

## 3.4 `MD16-projectflow-current-round-handoff-2026-04-04.md`
### 判斷
- **保留**
- 這一輪收尾 handoff 很清楚

### 建議角色
- 最新一輪完成事項與續接入口

### 注意
- 未來若出現 MD17 / MD18 類似 handoff，MD16 會逐步退成上一輪歷史 handoff

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
1. `MD16-projectflow-current-round-handoff-2026-04-04.md`
2. `MD15-projectflow-repo-audit-summary-v1-2026-04-04.md`
3. `MD14-projectflow-progress-review-and-next-step-handoff-2026-04-04.md`
4. `MD-MASTER-projectflow-system-source-of-truth.md`

### 補充說明
- 若要快速接手：先看 **MD16**
- 若要判斷 repo 到底落地多少：看 **MD15**
- 若要看成熟度與下一步：看 **MD14**
- 若要看高階定稿規格：回到 **MD-MASTER**

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
- `MD14-projectflow-progress-review-and-next-step-handoff-2026-04-04.md`
- `MD15-projectflow-repo-audit-summary-v1-2026-04-04.md`
- `MD16-projectflow-current-round-handoff-2026-04-04.md`

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

## 應優先檢查是否合併 / 淘汰
- 未來任何單頁 / 單點 / 局部微調型 follow-up MD

---

# 9. 一句話交接

> `projectflow` 的 MD 結構目前已適合做一次文件層級收斂：主幹保留 MD-MASTER + MD14 + MD15 + MD16，其餘早期 handoff 應標記為歷史回查，MD12 類單點 follow-up 則優先檢查是否可合併或淘汰。
