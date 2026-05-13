# README — 系統建置 SOP 標準包 v1 — 2026-05-13

Status: draft
Purpose: 作為「系統建置 SOP 標準包 v1」的總入口，讓使用者、產品整理者、執行者能快速知道要看哪份文件、先看哪份、怎麼使用。

---

## 1. 這是什麼

這是一套用來建立**新系統 / 新專案**的 SOP 標準包。

它不是某一個單一系統的需求文件，
而是把「未來要怎麼從 0 開始把一套新系統做對」整理成可交接、可複製、可執行的標準流程。

這套標準包的目標是：

- 讓一般使用者也能提供正確輸入
- 不需要工程背景也知道題目在問什麼
- 執行者不需要靠猜就能接得住
- 專案不會一直卡在口頭討論與反覆 MVP

---

## 2. 這套標準包目前包含什麼

目前已完成的主要內容有四層：

### A. 白話版骨架
用來說明整套 SOP 的架構與每個模組在做什麼。

- `../guides/MD-SOP-system-build-standard-package-v1-plain-language-draft-2026-05-12.md`

### B. 10 個核心模組的可填模板
這是目前最重要的主體，未來可直接拿來填。

#### 模組 1～3
- `../templates/MD-TEMPLATE-SOP-module-1-2-3-fillable-2026-05-13.md`
- 包含：
  1. 名詞定義表
  2. 角色與權限表
  3. 流程與狀態表

#### 模組 4～6
- `../templates/MD-TEMPLATE-SOP-module-4-5-6-fillable-2026-05-13.md`
- 包含：
  4. 資料蒐集清單
  5. 環境與帳號清單
  6. 驗收標準表

#### 模組 7～10
- `../templates/MD-TEMPLATE-SOP-module-7-8-9-10-fillable-2026-05-13.md`
- 包含：
  7. 變更管理表
  8. 階段進出場條件表
  9. 環境分層規則表
  10. 交接與維運責任表

### C. 範例填寫版
這部分用來示範「一份比較好的答案長什麼樣」。

- `../examples/MD-EXAMPLE-SOP-module-1-2-3-sample-fill-2026-05-13.md`
- `../examples/MD-EXAMPLE-SOP-module-4-5-6-sample-fill-2026-05-13.md`
- `../examples/MD-EXAMPLE-SOP-module-7-8-9-10-sample-fill-2026-05-13.md`

### D. 使用說明與補充盤點文件
這部分用來降低使用門檻，並補環境協作與正式產品模式相關清單。

- `../guides/MD-GUIDE-SOP-for-general-users-2026-05-13.md`
- `../plans/MD-PLAN-projectflow-switch-from-cloudflare-access-to-product-login-mode-2026-05-13.md`
- `../checklists/MD-CHECKLIST-cloudflare-access-audit-for-projectflow-product-login-mode-2026-05-13.md`

---

## 3. 這套 SOP 要怎麼用

### 用法 1：要開新系統時
先從白話版骨架開始看：
- `../guides/MD-SOP-system-build-standard-package-v1-plain-language-draft-2026-05-12.md`

看完後，再依序填：
1. 模組 1～3
2. 模組 4～6
3. 模組 7～10

這是最完整的走法。

---

### 用法 2：只想先把需求講清楚
先填：
- 模組 1～3
- 模組 4

也就是先把：
- 名詞
- 角色
- 流程
- 需要哪些資料

整理清楚。

---

### 用法 3：已經有系統，要補環境 / 驗收 / 維運標準
優先填：
- 模組 5
- 模組 6
- 模組 8
- 模組 9
- 模組 10

也就是：
- 環境與帳號
- 驗收標準
- 階段切換
- 環境分層
- 維運交接

---

## 4. 建議閱讀順序

如果是第一次接觸這套 SOP，建議閱讀順序如下：

### 第一步：先理解整體架構
1. `../guides/MD-SOP-system-build-standard-package-v1-plain-language-draft-2026-05-12.md`

### 第二步：開始填需求核心
2. `../templates/MD-TEMPLATE-SOP-module-1-2-3-fillable-2026-05-13.md`
3. `../templates/MD-TEMPLATE-SOP-module-4-5-6-fillable-2026-05-13.md`

### 第三步：補上長期運作規則
4. `../templates/MD-TEMPLATE-SOP-module-7-8-9-10-fillable-2026-05-13.md`

### 第四步：若不知道怎麼填，先看範例
5. `../examples/MD-EXAMPLE-SOP-module-1-2-3-sample-fill-2026-05-13.md`
6. `../examples/MD-EXAMPLE-SOP-module-4-5-6-sample-fill-2026-05-13.md`
7. `../examples/MD-EXAMPLE-SOP-module-7-8-9-10-sample-fill-2026-05-13.md`

### 第五步：如果是一般使用者，先看使用說明
8. `../guides/MD-GUIDE-SOP-for-general-users-2026-05-13.md`

### 第六步：若牽涉到正式對外登入 / Cloudflare / 正式站入口
9. `../plans/MD-PLAN-projectflow-switch-from-cloudflare-access-to-product-login-mode-2026-05-13.md`
10. `../checklists/MD-CHECKLIST-cloudflare-access-audit-for-projectflow-product-login-mode-2026-05-13.md`

---

## 5. 這套標準包目前完成到哪裡

### 已完成
- 白話版骨架
- 10 模組可填模板
- 10 模組範例填寫版
- 一般使用者操作說明版
- Cloudflare / 正式產品登入模式盤點文件
- README / index

### 後續還可以補的方向
1. 更正式的資料夾命名收斂
2. 視需要再拆成「需求方版 / 產品整理版 / 執行者版」
3. 若有真實專案，可再做一份完整實戰填寫範例

---

## 6. 適合哪些人使用

### A. 提出需求的人
- 不懂工程也可以先把輸入講清楚

### B. 產品整理者 / PM / CPO
- 可以把口語需求整理成結構化輸入

### C. 執行者 / 工程 / 設計
- 可以明確知道該依據哪些資料開工

### D. 維運 / 接手人員
- 可以知道帳號、環境、交接責任在哪裡

---

## 7. 一句話總結

> 這份 README 的目的，是把「系統建置 SOP 標準包 v1」目前已完成的骨架、模板、範例、使用說明與環境盤點文件整理成單一入口，讓之後不管是新專案啟動、需求整理、環境盤點、還是正式交接，都知道應該先看哪份、再填哪份。