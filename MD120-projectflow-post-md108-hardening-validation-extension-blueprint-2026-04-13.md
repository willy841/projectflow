# MD120 — projectflow post-MD108 hardening / validation / extension blueprint (2026-04-13)

> Status: ACTIVE  
> Role: 本文件作為 `MD108` 完成後的下一輪正式藍圖母檔。  
> Important: 本文件**不是** `MD108 Batch 5`，而是 `post-MD108` 的新階段藍圖。

## 1. 文件定位

`MD108` 已完成 Batch 1 → Batch 4 的 DB-first implementation 主線。

因此後續主線不再是：
- 回頭重做 Batch 1–4
- 假裝還在 `MD108` 裡面補尾巴
- 把新工作硬塞成 `MD108 Batch 5`

本文件的正式定位是：
> **post-MD108 phase blueprint / 下一輪 hardening、deeper validation、extension 的總控藍圖**

---

## 2. 這一輪要解的不是什麼

### 不再是以下主題
1. Vendor Data foundation from 0 to 1
2. quote-cost closeout ingress from 0 to 1
3. closeout list retained read-model from 0 to 1
4. upstream requirement communication from 0 to 1
5. execution lines 基礎 DB-first 打通

這些已在 `MD108 Batch 1–4` 完成。

---

## 3. 這一輪真正目標

post-MD108 的正式目標是三類：

### A. Hardening
把已完成的主線收成更穩、更難壞、更可維護。

### B. Deeper validation
把目前只有部分驗證的區塊補成更完整的：
- frontend 實際操作
- backend DB truth comparison
- e2e matrix

### C. Extension
把前一輪刻意沒納入的延伸主題，拆成新的獨立主線，而不是偷偷混進舊批次。

---

## 4. post-MD108 建議主線分區

### Phase P1 — Validation hardening matrix
#### 目標
把目前 Batch 1–4 只做部分驗證的區塊，補成正式驗收矩陣。

#### 核心內容
1. design line overwrite confirmation e2e
2. procurement line overwrite confirmation e2e
3. vendor grouping / package / document-layer e2e
4. quote-cost collection / reconciliation / closeout 完整 e2e 補齊
5. closeout retained read-model query timing baseline

#### 驗收要求
- Playwright / browser-driven flows
- DB truth comparison
- 至少對每條主線補一個「成功覆蓋舊值」驗證

---

### Phase P2 — Retained / component formalization
#### 目標
把目前仍有共用骨架或過渡命名的 retained 區塊正式化。

#### 核心內容
1. closeout detail retained-only component 化
2. vendor document-layer 欄位語意再正式化
3. 保留 latest confirmation snapshot 優先規則
4. 降低 active / retained 共用骨架耦合

---

### Phase P3 — Home overview active aggregation closure
#### 目標
承接 `MD108` 原本未展開的 Home Overview 主線。

#### 核心內容
1. project count
2. in-progress count
3. pending design/procurement/vendor counts
4. recent projects
5. active 已收款 / 未收款聚合

#### 明確排除
- 本月專案總額 / 本月金額
- 屬 Accounting Center 的 month / finance aggregation

---

### Phase P4 — Accounting Center post-Phase-A extension
#### 目標
把目前仍停在 active spec / partial closure 的 Accounting Center 主線，正式拆出下一輪施工包。

#### 核心內容
1. active projects module extension
2. payable lifecycle 與 Accounting Center readback deeper alignment
3. retained reporting / month-close 邊界再清理
4. 非 `MD108` 範圍的 Accounting Center extension

#### 直接依賴文件
- `MD78`
- `MD80`～`MD86`

---

## 5. 與 `MD108` 的關係

### 正式規則
1. `MD108` = 完成的前一輪主批次藍圖
2. `MD120` = 下一輪新藍圖
3. 不可把 `MD120` 內容回寫成 `MD108` 新 batch
4. `MD119` 為兩輪之間的邊界切分文件

### 管理語意
- `MD108`：completion scope 已封口
- `MD120`：new-phase planning active

---

## 6. 新一輪固定驗收標準

本輪仍固定遵守：
> **實際 frontend 操作 + backend DB truth comparison**

但和 `MD108` 相比，要再加一條：
> **每個 phase 至少補一個 overwrite / stale-data / retained-readback 驗證點**

目的：
- 避免只驗 happy path
- 補齊真正容易壞的地方

---

## 7. 建議續接順序

### 新對話 / 新 session 若要續接 post-MD108
固定建議閱讀順序：
1. `MD-MASTER-projectflow-system-source-of-truth.md`
2. `MD-INDEX-projectflow-status-board-2026-04-12.md`
3. `MD119-projectflow-md108-batch1-to-batch4-completion-summary-and-next-scope-2026-04-13.md`
4. `MD120-projectflow-post-md108-hardening-validation-extension-blueprint-2026-04-13.md`
5. 再視任務所屬，回查：
   - `MD100`～`MD107`
   - `MD78`
   - `MD80`～`MD86`

---

## 8. 一句話總結

> `MD120` 的正式角色，是在 `MD108 Batch 1–4` 完成後，重新開一輪新的總控藍圖：不再把後續工作混回舊批次，而是把剩餘的 harder validation、retained/component formalization、首頁 active aggregation、Accounting Center extension，拆成 post-MD108 的新階段主線。