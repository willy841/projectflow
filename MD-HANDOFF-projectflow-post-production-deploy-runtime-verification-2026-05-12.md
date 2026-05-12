# MD-HANDOFF — projectflow 正式站 deploy 後 runtime 驗證與 clean-start 營運整理 — 2026-05-12

## 1. 任務目標

這一階段不再是 deploy blocker 排查，也不是 migration 缺表修復。

目前任務改為：

> **在 `project-mgmt-web` 已成功部署到本機正式站（Web App Platform）後，完成正式 runtime 驗證、admin 帳號確認，以及 clean-start / schema-only 初始化流程整理。**

---

## 2. 目前已知完成狀態

以下狀態已成立，不要再重查 deploy 路徑或 migration 缺表：

- `project-mgmt-web` 已成功 deploy
- `webapp-app` 已連到本機 `webapp-db`
- `webapp-db` 已補齊 `project-mgmt` 所需 schema，共 **29 張表**
- **沒有匯入** acceptance sample seed
- `system_users` 內已有 admin：`willy@kuya.tw`
- 未登入狀態下，以下路由都已正常回應，不再是缺表炸掉：
  - `/login`
  - `/`
  - `/projects`
  - `/vendors`
  - `/quote-costs`
  - `/accounting-center`

一句話：

> **deploy 與 webapp-db schema 對齊已完成，主線已切到登入後驗證與營運整理。**

---

## 3. 目前已完成的 runtime 驗證結果

以下驗證已完成：

### A. Admin 登入後主要頁面
已驗證正常：
- `/`
- `/projects`
- `/vendors`
- `/quote-costs`
- `/accounting-center`

### B. Admin credential 驗證
目前已知 admin：
- `willy@kuya.tw`

admin 登入已成功。
若未來需要重設，repo 內可用腳本仍為：
- `project-mgmt/scripts/init-system-owner.js`

### C. 對外 HTTPS 驗證
已透過 ngrok tunnel 驗證外部 HTTPS 入口可用。

### D. 正式 runtime 驗證結論
本輪已新增正式結論文件：
- `project-mgmt/docs/projectflow-production-runtime-verification-conclusion-2026-05-12.md`

### E. Clean-start / schema-only 初始化整理
本輪已完成文件整理；正式站之後若要 clean-start，不應再依賴 acceptance sample data。
保留的正式操作路徑應為：
- schema-only 初始化路徑
- admin 初始化路徑
- project-scoped 測試資料 cleanup 路徑

---

## 4. 已補文件

本輪已新增：

- `project-mgmt/docs/projectflow-production-runtime-verification-and-clean-start-playbook-2026-05-12.md`
- `project-mgmt/docs/projectflow-admin-account-recovery-and-verification-sop-2026-05-12.md`
- `project-mgmt/docs/projectflow-production-runtime-verification-conclusion-2026-05-12.md`

用途：
- 正式 runtime 驗證操作稿
- admin 帳號處理說明
- admin 重設 / 驗證 SOP
- 正式 runtime 驗證結論
- clean-start / schema-only 初始化流程
- project-scoped cleanup 與 full reset 的邊界說明

---

## 5. 重要規則

1. **不要再把 deploy 路徑當主 blocker。**
2. **不要再把 acceptance sample seed 匯入正式站。**
3. **不要把 project-scoped cleanup 和 full schema reset 混為一談。**
4. **若只是清測試專案資料，用 scoped cleanup；若是重建正式站，走 schema-only 初始化。**
5. **若 admin 密碼未知，可直接用 `init-system-owner.js` 重設。**

---

## 6. 後續最合理步驟

1. 驗證 `willy@kuya.tw` 登入
2. 若失敗，重設 admin 密碼
3. 驗證登入後主頁 / projects / vendors / quote-costs / accounting-center
4. 補正式 runtime 驗證結論
5. 把 playbook 視為後續正式站 clean-start 參考文件

---

## 7. 一句話總結

> `projectflow` 正式站目前已完成 deploy 與本機 `webapp-db` schema 對齊；下一步不再是基礎修復，而是 admin 登入驗證、登入後主要頁面驗證，以及 clean-start / schema-only 初始化流程整理。
