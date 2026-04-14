# MD137 — projectflow guardrails round 1 implementation closure (2026-04-15)

> Status: CLOSED / HANDOFF READY
> Role: 承接 `MD136` 後的第一批正式落地實作 closure。這份文件的目的不是重複規則，而是清楚標記：哪些規則已拍板、哪些已做進 code、哪些仍屬下一輪 formalization 範圍。

---

## 1. 本輪定位

本輪承接 `MD136-projectflow-product-guardrails-and-formalization-rules-2026-04-15.md`。

定位明確為：
- 將已拍板的 product guardrails 中，**可以直接落地的第一批項目先做進 code**
- 不重開產品方向討論
- 不做 DB schema 重構
- 不做 Accounting Center 主線延伸
- 不做全站無限制繼續修補

本輪主線只有兩條：
1. closeout / reopen 制度第一批落地
2. 三條線工作臺 formalization 第一批落地

---

## 2. 本輪前已拍板的核心規則（摘要）

### 2.1 Closeout / 資料治理
- 測試資料一律刪除
- `刪除 = 正式刪 DB`
- 結案資料內需有 `取消結案`
- `取消結案` 後：
  - 專案回 `執行中`
  - 不回推快照 / 結案紀錄 / 摘要
  - 若再結案，以當下資料覆蓋
- closeout 不可直接編輯；若要修改，需取消結案回主線修改

### 2.2 三條線工作臺
- design / procurement / vendor 要被定義為**同一家族的正式工作臺**
- formalization 只動前台骨架，不動 DB 與核心邏輯
- 採部分固定骨架：
  - header 區
  - action 區
  - 儲存 / 確認 / 返回 / 文件節奏
  - 區塊排序邏輯
- `儲存 = 保存編輯內容`
- `確認 = 正式成立 / 往下游承接`
- `文件 = 正式結果頁`
- detail / 文件 / 工作臺必須有明確返回入口

---

## 3. 本輪已正式做進 code 的項目

## 3.1 Closeout reopen 第一批落地
已完成：
- 新增 `POST /api/financial-projects/[id]/reopen`
- 目前 reopen 行為為：
  - 只把 `projects.status` 改回 `執行中`
  - 不清除 closeout 快照 / 紀錄 / 摘要
- `quote-cost-detail-client` 已新增 closeout 視圖下的 `取消結案` 按鈕
- 成功後：
  - 前端 state 回 `執行中`
  - refresh
  - push 回 active `quote-costs/[id]`

管理結論：
- **PASS（第一批 reopen 制度已落地）**

---

## 3.2 三條線工作臺 formalization 第一批落地
已完成：
- design / procurement / vendor plan editor 的：
  - `新增執行處理`
  - `儲存`
  - `全部確認`
  按鈕高度與家族節奏已開始統一
- 三條線工作臺卡片已開始統一：
  - 白底 card surface
  - footer action 區加 top border / spacing
  - 刪除按鈕高度對齊
- 三條線成功訊息與文件語意已開始統一：
  - `正在前往文件`
  - `文件將承接這次正式確認結果`
- detail / 文件 / 返回 / 查看文件 相關入口按鈕高度與家族感已開始對齊
- 共用工作臺元件 `mock-editable-plan-list` 與 `vendor-group-confirm-client` 已一併收進正式節奏

管理結論：
- **PASS（第一批工作臺 formalization 已落地）**

---

## 4. 本輪對應代表性 commit

### closeout reopen / workbench 第一批落地
- `e4411a8` — `feat: add closeout reopen and align workbench controls`
- `a0ee46b` — `refactor: align workbench card structure`
- `81de44e` — `refactor: align workbench confirmation wording`
- `663458e` — `refactor: standardize shared workbench interactions`
- `15efe3a` — `refactor: align active and closeout detail wording`
- `6efa0a4` — `refactor: align workbench list card surfaces`
- `a88ba9e` — `refactor: finish document action sizing alignment`

---

## 5. 哪些規則已從「制度」變成「已實作」

### 已實作
1. closeout 可取消結案
2. 取消結案後回執行中
3. 取消結案第一版不回推快照 / 紀錄 / 摘要
4. active / closeout detail 一批語氣已對齊
5. 三條線工作臺第一批骨架已對齊
6. 三條線 `儲存 / 確認 / 文件` 語意第一批已對齊
7. 三條線返回 / 文件入口第一批已對齊
8. 共用工作臺元件已被收進同一家族規範

### 仍主要屬制度 / 後續 formalization 的
1. 測試資料治理（屬操作制度，不是單一 code feature）
2. closeout 不可編輯的更嚴格 UI lock / interaction lock
3. 三條線工作臺第二輪 formalization（更完整的 section / header / 欄位節奏）
4. system-generated code 全 repo 零殘留的最終精掃
5. 新頁 / 新模組強制沿用骨架的未來執行

---

## 6. 本輪後的正確狀態

截至 `MD137`：

### A. 規則層
- `MD136` 已成為正式 product guardrails 文件
- 之後續接 `projectflow` 必須讀 `MD136`

### B. 實作層
- closeout reopen 已不是只有制度，而是已有第一批 code 落地
- 三條線工作臺 formalization 已不是抽象方向，而是已有第一批 code 落地

### C. 管理層
- 這輪可以視為：
  - **guardrails round 1 implementation complete**
  - 或更白話：
    - **規則定稿 + 第一批落地完成**

---

## 7. 下一步建議

本輪之後，不建議再以「無差別全站一直修」的方式往下做。

若未來 reopen 下一輪，建議只在以下兩條中擇一：

### 7.1 Closeout / active 制度第二輪
- closeout UI / interaction lock 更完整化
- reopen 邊界驗證更完整化
- active / closeout 邊界在更多頁面再驗一次

### 7.2 三條線工作臺 formalization 第二輪
- section / header / footer 骨架更完整固化
- 欄位節奏再對齊
- 工作臺 family 感更完整追平

正式建議：
- **不要兩條一起無限制繼續拖長**
- 之後若再做，應該是明確開一輪新的 work package

---

## 8. 一句話總結

`MD137` 代表：
- `MD136` 不再只是制度文件，因為其中一批規則已正式做進 code
- closeout `取消結案` 與三條線工作臺 formalization 都已完成第一批落地
- 因此目前正確狀態應為：
  - **guardrails fixed**
  - **round 1 implementation done**
  - **next round should be scoped, not open-ended**
