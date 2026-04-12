# MD78 — projectflow Accounting Center Phase A closure and lock recommendation (2026-04-12)

> Status: ACTIVE
> Note: 本文件是目前 `Accounting Center Phase A` 是否 closure / lock 的主判斷依據。


## 1. 文件定位

本文件用來正式收口 `Accounting Center DB-first Phase A` 目前的完成狀態，並提出是否可進入 lock / 不再重開主線的建議。

本文件目的：
- 把目前已完成的核心主線明確列出
- 區分哪些屬於 Phase A 已完成範圍、哪些不屬於本階段
- 給出是否可視為 `Phase A closure` 的正式建議

---

## 2. 本文件的核心結論

> **截至 2026-04-12，`Accounting Center DB-first Phase A` 的核心主線已基本打通，可視為已進入 closure / lock recommendation 階段。**

更準確地說：
- 不代表所有帳務生態系都已完成
- 但代表 `Accounting Center` 在 Phase A 原本承接的核心範圍，已不再是待施工骨架，而是已有正式真值、正式入口與正式驗收基礎的主線模組

---

## 3. Phase A 原始目標回顧

依既有 Phase A 脈絡，`Accounting Center DB-first Phase A` 主要承接：

1. `執行中專案` summary / table
2. `管銷成本`（人事 / 庶務 / 其他）
3. `營收概況` summary layer
4. 基本 DB-first source 與 readback

也就是：
> **先把 Accounting Center 的三大主區塊，從 spec / mock / 半成形結構，推到 DB-first 可用狀態。**

---

## 4. 截至目前已站穩的 Phase A 核心主線

## 4.1 人事 editor 主線：已站穩
已完成：
- 獨立人事 editor 工作流
- DB employee uuid 單一路徑
- submit -> DB payload -> list -> drawer -> delete inactive -> roster hidden
- Playwright 最終綠燈

可視為：
> **Phase A 的人事主線已完成。**

---

## 4.2 庶務 / 其他 DB-first closure：已站穩
已完成：
- office category / office expense / other expense 的 DB-first CRUD
- reload readback
- DB 真值驗證
- 第一輪 E2E 已通

可視為：
> **Phase A 的 operating expense（除人事外）主線已完成。**

---

## 4.3 client collection 主線：已站穩
已正式拍板與落地：
- 收款真值：`project_collection_records`
- 收款主入口：`quote-cost detail / financial detail`
- `Accounting Center / active-projects` 只承接 tracking / summary / drill-down

已完成：
- `quote-cost detail` client collection module
- 新增收款 / 刪除收款
- DB truth readback
- `Accounting Center active-projects` 承接應收 / 已收 / 未收
- row -> detail 導流
- 自動化驗收已通

可視為：
> **Phase A 的 active-projects / collection 主線已完成。**

---

## 4.4 營收概況 summary layer：已完成第一輪正式驗收
已完成：
- month / year / range 三模式切換
- 已結案總收入 / 已結案總成本 / 營運支出 / 利潤總計 四卡
- 第一輪 Playwright 驗收已通
- 已確認 summary layer 在卡片存在、模式切換、公式一致性上已站穩

可視為：
> **Phase A 的 revenue summary layer 已達可收口狀態。**

---

## 5. 因此目前可怎麼判定

截至本文件，`Accounting Center` 三大主區塊可做如下判定：

### A. 執行中專案
- active-project summary / table：已站穩
- client collection truth：已站穩
- drill-down responsibility：已站穩

### B. 管銷成本
- 人事：已站穩
- 庶務：已站穩
- 其他：已站穩

### C. 營收概況
- summary layer：已站穩

也就是：
> **Phase A 三大主區塊都已不再是待開工狀態。**

---

## 6. 目前還沒有完成、但不應算 Phase A 未完成的項目

這些事情仍未完成，但不建議把它們算成 `Accounting Center Phase A` 尚未完成：

### 6.1 更完整的收款 lifecycle
例如：
- 收款紀錄編輯
- 更細的 client receivable 流程
- invoice / 分期 / 對帳 / 催收之類

這些屬於：
> **client collection Phase B / lifecycle formalization**

### 6.2 更完整的 payable / accounting lifecycle
例如：
- vendor payable lifecycle
- month close aggregation / readback
- 更高層 financial lifecycle / accounting archive / retained view 設計

這些屬於：
> **financial lifecycle 後續階段**

重要校正：
- 依 `MD83`，後續不得把 `Accounting Center` 解讀成金額確認層
- `Accounting Center` 不做任何金額確認，只承接已成立金額做 aggregation / tracking / readback
- 所有金額成立與確認，仍以 `quote-cost / financial detail` 為唯一主線

### 6.3 全面 UI / 文案 product polish
例如：
- 少量系統感 hint
- 說明文案第二輪清理
- 全面 UI wording polish

這些屬於：
> **產品 polish / lock 前清理**

而不是 Phase A 主線是否已完成的判準。

---

## 7. 現在最準確的 closure 建議

### 建議判斷
我建議正式把目前狀態判定為：

> **`Accounting Center DB-first Phase A` 可視為核心完成，進入 closure / lock recommendation 狀態。**

### 為什麼可以這樣判
因為：
1. 三大主區塊都已有正式真值
2. 三大主區塊都已有正式入口 / 責任分工
3. 三大主區塊都已有至少一輪正式驗收
4. 已不再存在「這塊其實還只是 mock 骨架」的核心風險

---

## 8. 建議接下來怎麼做

### Option A — 直接宣告 Phase A closure（建議）
做法：
- 把本文件視為 closure recommendation
- 後續不再重開 Phase A 核心主線
- 接下來的修改視為：
  - polish
  - lifecycle expansion
  - Phase B

### Option B — 先做很小一輪文案 polish，再宣告 closure
做法：
- 只清少量系統感 hint / 說明文案
- 不再動資料流與工作流
- 清完後再正式 lock

我偏向：
> **若沒有明顯 UI / wording 強需求，應直接採 Option A。**

---

## 9. 下一階段最合理的主線

一旦接受本文件的 closure 建議，下一階段最合理的方向不應再是回頭重開 `Accounting Center Phase A`，而應轉向：

1. `client collection lifecycle` 更完整正式化（若需要）
2. `financial lifecycle / payable / accounting close` 後續規格
3. `Accounting Center` 的小範圍文案 polish / lock 文檔化

---

## 10. 一句話總結

> 截至 2026-04-12，`Accounting Center DB-first Phase A` 的三大主區塊——`執行中專案`、`管銷成本`、`營收概況`——都已具備正式真值、正式入口責任與至少一輪正式驗收，因此最準確的判斷已不再是「仍在施工中」，而是：`Phase A` 核心已完成，可進入 closure / lock recommendation 階段；後續若再往前推，應視為 polish、lifecycle expansion 或後續 Phase，而不應再把 Phase A 核心主線重開。