# MD108 — projectflow DB-first implementation batch plan (2026-04-13)

> Status: ACTIVE
> Note: 本文件作為 `projectflow` 下一階段 DB-first / same-source closure / 功能補完的總執行藍圖，用來把大範圍工程拆成可在 context 壓力下穩定推進的批次工作包。


## 1. 文件定位

本文件不是單一模組 spec，也不是單次 handoff。

本文件的角色是：
> **DB-first 實作總控藍圖 / 分批執行地圖**

目的：
- 避免把整個 `projectflow` 的 DB 化與功能補完，硬塞進單一長對話造成 context 崩壞
- 把已完成使用情境對齊的模組，拆成可獨立執行、獨立驗收、獨立交接的 work packages
- 讓後續每一批都能以「小範圍、可驗證、可交接」的方式穩定推進

---

## 2. 本輪總目標

把以下已完成 usage-scenario alignment 的區塊，正式推進為：
- DB-first
- same-source
- 可操作
- 可驗證
- 可交接

涵蓋範圍：
- `MD100` 上游 / Project Detail
- `MD101` 設計線
- `MD102` 備品線
- `MD103` 廠商線
- `MD104` 報價成本
- `MD105` Vendor Data
- `MD106` closeout
- `MD107` 首頁總覽

### 明確排除
- `首頁總覽` 中的 `本月專案總額 / 本月金額`
  - 來源應屬 `Accounting Center`
  - 本輪先不正式對接
- `Accounting Center` 主線本身
  - 暫列最後，先不混進本輪批次實作

---

## 3. 本輪固定驗收標準

本輪所有批次都必須遵守：

> **實際 frontend 操作 + backend DB truth comparison**

也就是：
- 不能只做 code review 就宣告完成
- 不能只看畫面像有資料
- 必須做實際操作
- 並確認 DB 真值與頁面 readback / writeback 一致

---

## 4. 分批執行總原則

### 原則 A：母檔只控局，不塞細節
- `MD-MASTER` 只維護：
  - 總目標
  - 目前做到哪一批
  - 下一批是什麼
- 細節實作與局部風險，寫到各批次 work package / closure 檔，不回灌成母檔流水帳

### 原則 B：每批只處理單一主焦點
- 每一批 work package 只能有一個主要模組焦點
- 最多只允許帶少量直接依賴的鄰接模組
- 禁止一批同時橫跨 4–5 條線亂做

### 原則 C：每批做完必有 closure / handoff
每一批完成後，必須立即產出 closure / validation 文件，至少包含：
1. 本批目標
2. 已完成內容
3. 未完成內容
4. 風險與限制
5. 驗收方式與結果
6. 下一批建議
7. 關鍵檔案與 commit

### 原則 D：context 接近飽和時必須換批 / 開新對話
- 不追求單一對話一路做到完
- 每批都必須設計成可在新對話獨立續接

---

## 5. 建議批次順序

---

### Batch 1 — Vendor Data same-source closure

#### 主焦點
- `MD105` Vendor Data

#### 目標
把 Vendor Data 從目前 high-risk partial DB-first 區，推進成：
- vendor master same-source
- vendor detail same-source
- unpaid / paid / history / inline document-layer readback same-source

#### 主要內容
1. vendor master source closure
2. trade / 工種管理 source closure
3. vendor detail profile / labor-report source closure
4. unpaid project list 與 payment-status 寫回 closure
5. history tabs / inline expand read-only document-layer closure
6. 搜尋 / 排序能力接正式 read model

#### 直接依賴
- `MD103` vendor line
- `MD104` quote-cost reconciliation/payable source

#### 為什麼先做
- 目前這是最大 partial 風險區之一
- 同時連到 quote-cost、payable、vendor identity、history readback
- 先收這條，後面 financial spine 會更穩

---

### Batch 2 — Quote-cost reconciliation / payable / closeout ingress closure

#### 主焦點
- `MD104` quote-cost

#### 目標
把報價成本 detail 中最關鍵的 financial spine 收乾淨：
- quotation total
- collection
- cost buckets
- reconciliation by vendor
- closeout gating

#### 主要內容
1. quotation / receivable readback closure
2. collection write/read closure
3. design/procurement/vendor/manual cost buckets same-source closure
4. reconciliation groups item-level visibility closure
5. `已對帳` -> vendor unpaid source closure
6. closeout gating button / state / write path 補齊
7. 移除 `最終文件內容` 冗餘區塊

#### 直接依賴
- Batch 1 vendor unpaid / vendor identity 若尚未完全完成，至少要先有可用 read-model 邊界

---

### Batch 3 — Closeout retained read-model / performance closure

#### 主焦點
- `MD106` closeout

#### 目標
把 closeout 收成真正的 retained archive：
- list 查詢穩定
- detail retained semantics 穩定
- 效能與 timeout 問題處理

#### 主要內容
1. closeout list read-model 專用化
2. 年份 / 搜尋 / 排序 closure
3. list 欄位 retained summary closure
4. 移除冗餘 badge / note / active-operation 殘留
5. detail retained context + retained financial summary closure
6. retained cost tabs 讀 final document-layer items
7. 解 closeout list slow / timeout 問題

#### 直接依賴
- Batch 2 closeout ingress / closeout state 寫入邊界清楚

---

### Batch 4 — Upstream + execution lines write/read closure

#### 主焦點
- `MD100` upstream
- `MD101` design
- `MD102` procurement
- `MD103` vendor line

#### 目標
把上游到三條執行線的 write path / confirm path / document path / cost ingress 全部補齊到 DB-first

#### 主要內容
1. project detail activity/customer/requirement communication writeback closure
2. execution tree / release / dispatch write path closure
3. design line confirm-all / overwrite semantics DB closure
4. procurement line confirm-all / overwrite semantics DB closure
5. vendor line project -> vendor -> tasks / document-layer closure
6. document-layer table/export same-source closure

#### 直接依賴
- quote-cost / vendor-data / closeout financial/readback 主線已收穩，不然上下游會互相拖累

---

### Batch 5 — Home overview active aggregation closure (excluding monthly amount)

#### 主焦點
- `MD107` home overview

#### 目標
把首頁總覽中「不依賴 Accounting Center」的部分正式接起來

#### 主要內容
1. project count 正式來源 closure
2. in-progress project count closure
3. pending design/procurement/vendor counts closure
4. recent projects list closure
5. active `已收款 / 未收款` aggregation closure
6. 移除冗餘 CTA / summary items

#### 明確排除
- `本月專案總額 / 本月金額`
  - 仍等 `Accounting Center` 後續對接

---

## 6. 每批文件規格

每個 batch 正式開工前，應新增一份：
> `implementation work package MD`

建議命名：
- `MD109-...work-package...md`
- `MD110-...work-package...md`
- 依序往下

固定格式：
1. 目標
2. 本批範圍
3. 不做什麼
4. 現況盤點
5. 實作方案
6. 驗收方式
7. 風險
8. 影響檔案

每批完成後，再新增一份：
> `closure / validation handoff MD`

固定格式：
1. 已完成項
2. 驗收結果
3. 未完成項
4. 限制 / 風險
5. 下一批建議
6. 關鍵檔案
7. 關鍵 commit

---

## 7. Context 抗爆執行規則

### 規則 1
每一批 work package 建議在**獨立對話**內執行。

### 規則 2
新對話必讀順序固定為：
1. `MD-MASTER`
2. `MD-INDEX`
3. 對應 usage-scenario summary（`MD100`～`MD107`）
4. 對應 batch work-package MD
5. 若有上一批 closure MD，也一併讀

### 規則 3
一旦出現以下情況，必須立刻收口：
- 對話開始跨多模組反覆跳轉
- 已做出一批完整改動
- 已接近 context 80–90%
- 已出現前文規則難以穩定引用的情況

### 規則 4
收口時一定要做三件事：
1. 寫 closure / handoff MD
2. commit
3. 再開新對話續接

---

## 8. 本輪最重要的執行提醒

1. 不要重開已鎖線：
   - month close aggregation
   - payable lifecycle v1
   - Accounting Center Phase A
   - quotation schema/read-model 主線
2. 不要把首頁 `本月金額` 偷接成半套假聚合
3. 不要把 Vendor Data、quote-cost、closeout 混成同一批同時大亂改
4. 驗收一定要做「實際操作 + DB 對照」，不能只看 code
5. 每批都要能在新對話獨立續接

---

## 9. 一句話總結

> 本文件的正式作用，是把 `projectflow` 已完成使用情境對齊的多條主線，拆成可抗 context 爆掉的 DB-first 實作藍圖：先以 Vendor Data same-source closure 為第一批，再依序處理 quote-cost financial spine、closeout retained read-model、上游與三條執行線 write/read closure，最後才處理首頁總覽的 active aggregation（排除本月金額）。之後每一批都必須用獨立 work package + closure handoff 的方式推進，才能穩定落地。