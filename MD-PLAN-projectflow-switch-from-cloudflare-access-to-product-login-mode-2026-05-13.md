# MD-PLAN — projectflow 從 Cloudflare 外層驗證切換到正式產品登入模式 — 2026-05-13

Status: draft
Scope: `projectflow` / production auth entry / Cloudflare Access → product login mode

## 1. 目標

本次方向已由使用者明確拍板為：

> **模式 B：正式產品模式**

也就是：
- 使用者直接進 `pmis.kuya.tw`
- 直接看到專案系統登入頁
- 使用系統帳號密碼登入
- 角色與權限由系統內部處理
- 不再要求所有使用者先經過 Cloudflare email 驗證

---

## 2. 現況問題

目前外部使用者登入流程是：

1. 先經過 Cloudflare Access / Zero Trust
2. 先做 email 驗證
3. 通過後才看到專案系統登入頁
4. 再登入專案系統

這樣的問題是：
- 使用者流程過長
- 入口權限與系統內權限分兩套
- 帳號管理分裂
- 不符合正式產品模式

---

## 3. 切換後的目標登入鏈路

切換完成後應為：

1. 使用者打開 `pmis.kuya.tw`
2. 直接看到專案系統登入頁
3. 使用系統帳號密碼登入
4. 系統內部處理 session / role / permission

---

## 4. 切換前必查清單

### A. Cloudflare 現況盤點
必須查清：
1. 現在是不是整站都被 Cloudflare Access 保護
2. 是只保護主網域，還是特定路徑
3. 現在使用的驗證方式是不是 email OTP
4. 有沒有 allowlist / policy / identity provider 綁定
5. 現在 Cloudflare Access 規則是保護整個站，還是只保護某些後台入口

### B. 系統內登入能力盤點
必須查清：
1. 系統登入頁是否穩定
2. 帳號建立方式是什麼
3. 新使用者如何建立帳號
4. 重設密碼流程是否可用
5. system_users / auth_sessions 是否已可作正式主線
6. 角色與權限是否已足夠支撐正式產品模式

### C. 正式站切換風險盤點
必須查清：
1. 拿掉 Cloudflare 外層驗證後，網站是否會直接暴露給所有人
2. 是否已有足夠的系統內 auth / rate limit / 安全保護
3. 是否需要保留某些特定後台路徑仍受 Cloudflare 保護
4. 是否需要讓正式登入頁公開，但保留 admin / internal path 在 Access 後面

---

## 5. 建議切換策略

### 方案 B1 — 全站正式產品登入模式
- `pmis.kuya.tw` 全站取消 Cloudflare Access 前置 email 驗證
- 所有人直接進系統登入頁
- 由系統內 auth / role 處理所有登入與權限

適用情況：
- 系統內登入機制已成熟
- 正式使用者將直接進站使用
- 不再需要 Cloudflare 幫忙做人員白名單入口控管

### 方案 B2 — 公開登入頁 + 保留特定後台 Cloudflare 保護
- 使用者可直接進主站登入頁
- 但某些 internal / admin / maintenance path 仍保留 Cloudflare Access

適用情況：
- 希望正式使用者登入流程正常化
- 但仍希望特定內部入口保留額外保護層

---

## 6. 我建議的正式方向

若以正式產品模式為目標，優先建議：

> **採 B2 作為過渡，再視系統成熟度決定是否全面走 B1。**

理由：
- 使用者主入口先正常化
- 專案系統可正式承接自己的登入責任
- 但高權限後台或維運入口仍可保留外層保護
- 風險比直接全站裸露更低

---

## 7. 具體執行步驟

### Phase 1 — 查證現況
1. 盤 Cloudflare Access 規則
2. 盤目前主站是否整站被保護
3. 盤系統內 auth / account / reset-password 狀態
4. 盤哪些路徑應保留額外保護

### Phase 2 — 定切換邊界
5. 明確定義：
   - 哪些路徑要直接公開到登入頁
   - 哪些路徑可保留 Cloudflare Access
6. 明確定義：
   - 新使用者如何建立帳號
   - 忘記密碼 / reset-password 怎麼走

### Phase 3 — 切換與驗證
7. 修改 Cloudflare Access 策略
8. 驗證 `pmis.kuya.tw` 是否直接進系統登入頁
9. 驗證系統登入是否正常
10. 驗證一般使用者權限與頁面行為
11. 若保留後台保護，驗證內外路徑分流是否正確

---

## 8. 切換完成後的驗收條件

切換完成後，至少要驗：

1. 一般使用者打開 `pmis.kuya.tw`，不再先看到 Cloudflare email 驗證
2. 一般使用者直接看到專案系統登入頁
3. 系統帳號密碼登入成功
4. session 正常建立
5. 一般角色只能看到自己該看的內容
6. 若有保留後台保護，內部保護路徑仍正常受 Cloudflare 控制

---

## 9. 一句話總結

> 本次切換的核心，不是單純拿掉 Cloudflare，而是把 `projectflow` 正式站的登入責任，從外層 Cloudflare Access 轉回專案系統本身；使用者主入口應直接進系統登入頁，而高權限或內部路徑可視風險決定是否保留額外保護。