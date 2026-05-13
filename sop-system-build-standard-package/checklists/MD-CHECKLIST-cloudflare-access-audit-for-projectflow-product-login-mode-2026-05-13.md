# MD-CHECKLIST — Cloudflare 實際盤點清單（projectflow 正式產品登入模式）— 2026-05-13

Status: draft
Scope: `projectflow` / `pmis.kuya.tw` / Cloudflare Tunnel / Cloudflare Access / 正式產品登入模式

## 1. 這份清單是做什麼的

這份清單的目的，是讓你或之後接手的人打開 Cloudflare 後，
能夠很清楚知道：

- 要去哪裡看
- 要看哪一個設定
- 目前是哪種登入模式
- 哪裡是造成「先驗信箱再進系統登入頁」的原因
- 如果要切成正式產品模式，要改哪裡

這份不是工程文件，而是實際操作盤點清單。

---

## 2. 盤點目標

本次要確認的核心問題只有一個：

> **現在 `pmis.kuya.tw` 為什麼會先經過 Cloudflare 信箱驗證，而不是直接進 projectflow 登入頁？**

如果未來要切到正式產品模式，
要確認的是：

> **要怎麼讓使用者直接進系統登入頁，同時保留必要的安全保護？**

---

## 3. 先確認你要進哪裡看

打開 Cloudflare 後，優先查這幾個地方：

1. **Zero Trust / Access**
2. **Networks / Tunnels**
3. **DNS**
4. **Rules / WAF / Security**（視需要）

---

# A. Tunnel 盤點

## A-1. 確認 `pmis.kuya.tw` 是不是經 Cloudflare Tunnel 對外

### 你要看什麼
- Tunnel 名稱
- Tunnel 是否 online
- Public hostname 設定
- `pmis.kuya.tw` 是否綁到正確的 target

### 你要回答的問題（白話）
1. `pmis.kuya.tw` 是不是透過 Tunnel 對外？
2. 它指向的是哪個內部服務？
3. 目前 target 是不是正式站？
4. 有沒有其他 hostname 也指到同一個站？

### 記錄欄位
- Tunnel 名稱
- Tunnel 狀態（online / offline）
- Public hostname
- 指向目標（例如 local service / app / URL）
- 備註

---

# B. Access 應用盤點

## B-1. 確認 `pmis.kuya.tw` 有沒有被 Cloudflare Access 保護

### 你要看什麼
- Access application 清單
- 是否有 `pmis.kuya.tw` 對應的 application
- Application type
- 保護範圍是整站還是特定 path

### 你要回答的問題（白話）
1. `pmis.kuya.tw` 有沒有掛在 Access 裡？
2. 是保護整個網站，還是只保護某些網址路徑？
3. 是只保護 `/`，還是包含 `/login`？
4. 有沒有設定 wildcard 或 path-based policy？

### 記錄欄位
- Access application 名稱
- 網域 / path
- 是否保護整站
- 是否包含 `/login`
- 是否包含 admin / internal path
- 備註

---

# C. Access Policy 盤點

## C-1. 確認目前到底是哪條規則在要求信箱驗證

### 你要看什麼
- Policy 名稱
- Allow / Bypass / Block 規則
- Include / Exclude / Require 條件
- Login method / identity provider

### 你要回答的問題（白話）
1. 現在是哪一條 policy 讓使用者先被擋下來？
2. 它是要求 email OTP 嗎？
3. 它是白名單信箱制嗎？
4. 是不是所有人都要先過這條？
5. 有沒有某些人或某些路徑可以 bypass？

### 記錄欄位
- Policy 名稱
- Policy 類型（allow / bypass / block）
- Include 條件
- Exclude 條件
- Require 條件
- 驗證方式（email OTP / IdP / 其他）
- 備註

---

# D. 驗證方式盤點

## D-1. 確認現在是不是 email OTP

### 你要看什麼
- Login methods
- One-time PIN / email OTP
- 是否有綁 Google / Microsoft / GitHub 等 IdP

### 你要回答的問題（白話）
1. 現在使用者看到的信箱驗證，是不是 One-time PIN？
2. 還是其實是某個身分提供者登入？
3. 有沒有同時開多種登入方式？
4. 如果未來要取消這一層，關的是哪一個方法？

### 記錄欄位
- 目前登入方式
- 是否為 email OTP
- 是否有其他 IdP
- 是否只開單一驗證方式
- 備註

---

# E. 路徑分流盤點

## E-1. 確認未來能不能只公開登入頁，保留特定後台保護

### 你要看什麼
- Access application 的 path 覆蓋方式
- 是否可只保護特定 path
- 現有 admin / internal / maintenance 路徑有哪些

### 你要回答的問題（白話）
1. 未來能不能讓一般使用者直接進 `/login`？
2. 能不能只保護某些高權限後台路徑？
3. 哪些路徑值得保留 Cloudflare 保護？
4. 哪些路徑應該完全交給 projectflow 自己登入？

### 建議先分類的路徑
- 公開登入主入口：`/login`
- 一般系統路徑：`/`, `/projects`, `/vendors`, `/quote-costs`, `/accounting-center`
- 高權限或內部路徑：`/system-settings`、維運入口、內部管理頁

### 記錄欄位
- 路徑
- 是否應公開到登入頁
- 是否應保留 Access 保護
- 理由
- 備註

---

# F. 正式產品模式切換判斷

## F-1. 最後要回答的判斷題

當上面都盤完後，要能回答這幾題：

### 1. 現在的問題根因是什麼？
- 是 Access policy 保護整站？
- 是保護了 `/login`？
- 還是 hostname 層整體被攔？

### 2. 切到正式產品模式時，要改哪裡？
- 改 Access application 範圍？
- 改 policy？
- 改 login method？
- 改 path 分流？

### 3. 最安全的切法是哪一種？
- 全站取消 Access
- 還是只把主入口放出來、內部路徑保留保護

---

# G. 我建議的最後輸出格式

盤點完成後，應輸出一份簡短結論，格式如下：

## 現況
- `pmis.kuya.tw` 是否走 Tunnel
- 是否有 Access application
- 是否保護整站
- 目前驗證方式是什麼

## 問題根因
- 是哪條規則讓使用者先經過 Cloudflare 驗證

## 切換建議
- 哪些 path 改公開
- 哪些 path 保留保護
- 應採 B1 還是 B2

## 執行風險
- 切換後的公開暴露風險
- 系統內 auth 是否足夠承接

---

## 4. 一句話總結

> 這份清單的目的，是把 `pmis.kuya.tw` 目前為什麼先被 Cloudflare 驗證、未來要怎麼切成正式產品登入模式，拆成 Cloudflare 裡可實際查證與可實際修改的盤點步驟，避免只停留在抽象討論。