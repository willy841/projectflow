# MD132 — projectflow post-MD108 Phase P3 home overview active aggregation status (2026-04-13)

> Status: ACTIVE / STATUS  
> Phase: post-MD108 / Phase P3  
> Role: 記錄 `MD130` 啟動後，截至目前為止 P3-W1 ~ P3-W4 的實作落地狀態。

---

## 1. P3-W1 — home overview DB-backed read-model
### 目前狀態
- **第一輪已落地**

### 已完成內容
- 新增 `src/lib/db/home-overview-read-model.ts`
- 已提供首頁 overview 專用 DB-backed aggregation source
- 已包含：
  - project count
  - in-progress count
  - pending design count
  - pending procurement count
  - pending vendor count
  - active collected total
  - active outstanding total
  - recent projects

---

## 2. P3-W2 — homepage metric cards closure
### 目前狀態
- **第一輪已落地**

### 已完成內容
- 首頁 `src/app/page.tsx` 已不再使用硬編碼 mock stats
- metric cards 已改吃 overview read-model
- 首頁主 badge 也已改吃正式 aggregation source

---

## 3. P3-W3 — recent projects closure
### 目前狀態
- **第一輪已落地**

### 已完成內容
- recent projects 已改吃正式 DB source
- 首頁表格已從 local mock project list 切到正式 recent project aggregation

### 已確認 DB truth
目前 recent projects source 至少可讀到：
- `Projectflow DB 驗收主線樣本`
- `Projectflow 驗收測試專案`
- `正式測試0710`

---

## 4. P3-W4 — active collected / outstanding aggregation closure
### 目前狀態
- **第一輪已落地**

### 已完成內容
- 首頁右側區塊已從 `本月財務摘要` 改為 `Active 收款概況`
- active collected / outstanding aggregation 已接正式 DB source

### 已確認 DB truth
目前 active aggregation 實值：
- collected = `0`
- outstanding = `602000`

### 邊界確認
- 本輪沒有混入：
  - 本月金額
  - month aggregation
  - Accounting Center extension

---

## 5. 目前最準確的管理判斷

### 可宣稱
- Phase P3 四個工作包都已完成**第一輪落地**
- 首頁已從 mock dashboard 推進到 DB-backed active overview aggregation

### 不應過度宣稱
- 目前較適合稱為：
  - **Phase P3 first implementation round complete**
- 若要正式 closure，下一輪建議仍可補：
  - focused UI / data validation
  - recent projects 顯示語意細修（例如 owner）
  - active aggregation 文案與卡片命名再定稿

---

## 6. 一句話總結

> `MD132` 的結論是：Phase P3 已不是 planning，而是首頁 active overview aggregation 已完成第一輪實作落地。project count、pending design/procurement/vendor、recent projects、以及 active collected / outstanding 都已切到正式 DB-backed source，且未混入 month aggregation 或 Accounting Center extension。