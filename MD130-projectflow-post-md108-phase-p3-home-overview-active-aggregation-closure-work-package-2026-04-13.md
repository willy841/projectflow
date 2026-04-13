# MD130 — projectflow post-MD108 Phase P3 home overview active aggregation closure work package (2026-04-13)

> Status: ACTIVE  
> Phase: post-MD108 / Phase P3  
> Role: 本文件作為 `MD120` 中 **Phase P3 — Home overview active aggregation closure** 的正式施工單。  
> Important: 本文件承接 `MD129`（Phase P2 已完成），正式進入 Home overview active aggregation closure，不可混入 Accounting Center extension。

---

## 1. 本文件定位

依 `MD120`：
- `Phase P1` 已完成
- `Phase P2` 已完成
- 下一步正式主線為：
  > **Phase P3 — Home overview active aggregation closure**

本文件目的：
1. 先做 source-map audit
2. 定義首頁 overview active aggregation 正式 scope
3. 明確排除財務 / Accounting Center extension 項目
4. 作為 P3 的正式施工單

---

## 2. P3 正式目標

依 `MD120`，Phase P3 核心目標為：

1. project count
2. in-progress count
3. pending design / procurement / vendor counts
4. recent projects
5. active 已收款 / 未收款聚合

---

## 3. Source-map audit

### 3.1 首頁現況
目前首頁：
- `src/app/page.tsx`
- 仍使用硬編碼 mock dashboard

包含：
- `進行中專案`
- `待處理設計交辦`
- `待採購備品`
- `未付款項`
- `近期專案`
- `本月財務摘要`

#### 現況判斷
目前首頁並不是 DB-first active aggregation overview，仍偏：
- mock metric cards
- mock finance summary
- project list from local project data

---

### 3.2 與 P3 目標不一致的項目
目前首頁存在明確不應混進 P3 的內容：
- 本月已收款
- 本月未收款
- 本月已付款
- 本月預估毛利

依 `MD120`：
- 這些屬 month / finance aggregation
- 不應在 P3 先做
- 應視為 Accounting Center 邊界，不可混入 P3

---

### 3.3 repo aggregation adapter 現況
目前 repo 沒有獨立的：
- home overview adapter
- home overview read-model
- homepage active aggregation DB source

代表：
- P3 不是小修首頁文字
- 而是要正式補出首頁 active aggregation read-model / adapter

---

## 4. Phase P3 正式工作包

### P3-W1 — home overview DB-backed read-model
目標：
- 建立首頁 overview 專用 aggregation source

預期內容：
- project count
- in-progress count
- pending design count
- pending procurement count
- pending vendor count
- active project collected / outstanding aggregation
- recent active/relevant projects

---

### P3-W2 — homepage metric cards closure
目標：
- 用 DB-backed aggregation 取代首頁硬編碼 mock stats

預期內容：
- 進行中專案
- 待設計
- 待備品
- 待廠商 / 或對應 active pending 指標
- 不再保留目前與正式 source 脫鉤的 mock 數字

---

### P3-W3 — recent projects closure
目標：
- 讓首頁 recent projects 改由正式 project source / active overview source 提供

預期內容：
- recent projects 不再只吃 local mock project list
- 至少與正式 project detail / current project status 對齊

---

### P3-W4 — active collected / outstanding aggregation closure
目標：
- 首頁只補 active 已收款 / 未收款聚合
- 不擴張到 month aggregation / accounting extension

預期內容：
- active collected total
- active outstanding total
- 明確標示為 active overview 指標，而非 monthly report

---

## 5. 明確不做

本批不做：
- 本月專案總額 / 本月金額
- month-close / retained reporting
- Accounting Center active projects module extension
- payable lifecycle deeper accounting alignment
- 任何應屬 `Phase P4` 的 Accounting Center extension

尤其：
- **不要把 Accounting Center extension 混進 Phase P3**

---

## 6. 驗收標準

本批固定驗收標準：

1. 首頁 overview 不再是 mock 數字
2. metrics 需來自正式 source / adapter / read-model
3. recent projects 需與正式 project source 對齊
4. active collected / outstanding 為 active aggregation，不混成 month aggregation
5. 不破壞既有 Phase P1 / P2 成果

---

## 7. 推進順序建議

建議順序：
1. P3-W1 home overview read-model
2. P3-W2 homepage metric cards closure
3. P3-W3 recent projects closure
4. P3-W4 active collected / outstanding aggregation closure
5. 補 progress / closure MD

---

## 8. 一句話總結

> `MD130` 是 post-MD108 / Phase P3 的第一張正式施工單：把首頁從 mock dashboard 推進成 DB-backed active overview aggregation，正式補齊 project count、pending design/procurement/vendor、recent projects、以及 active 已收款 / 未收款聚合；同時嚴格排除 month aggregation 與 Accounting Center extension。