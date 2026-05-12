# MD-PACKAGE — projectflow 系統封裝總入口 — 2026-05-12

Status: active
Scope: `projectflow` only
Purpose: 作為 `projectflow` 專案系統的單一封裝入口與打包總索引

## 1. 這份文件是做什麼的

這份文件的目的是把 `projectflow` 專案系統的所有核心內容，整理成一個單一入口。

它不是單一 handoff，也不是單一規則說明，而是：

> **未來只要要碰 `projectflow`，就先從這裡進。**

這樣可以避免：
- 每次都散讀大量 MD
- 把歷史層、治理層、runtime 層、handoff 層混在一起
- 把 `projectflow` 的龐大內容污染到其他非 `projectflow` 對談

---

## 2. 使用原則

### 何時讀這份文件
只有在以下情況才主動載入：
- 使用者明確提到 `projectflow`
- 任務與 `project-mgmt` 系統直接相關
- 任務涉及：
  - 測試站
  - 正式站
  - DB schema
  - migration
  - deployment
  - runtime
  - 驗收
  - 系統治理
  - handoff

### 何時不要讀這份文件
若任務不是 `projectflow`，不要主動讀這份封裝總入口，也不要把這整包內容帶進一般對談。

---

## 3. 最小必讀入口（新 session / 新對話）

若新 session 要續接 `projectflow`，至少先讀：

1. `MD-PACKAGE-projectflow-system-bundle-entrypoint-2026-05-12.md`
2. `MD-GOVERNANCE-projectflow-staging-production-and-context-isolation-2026-05-12.md`
3. `MD-INDEX-projectflow-system-package-and-context-boundary-2026-05-12.md`
4. `MD-MASTER-projectflow-system-source-of-truth.md`
5. `MD-INDEX-projectflow-governing-document-architecture-2026-05-11.md`
6. `MD-INDEX-projectflow-active-secondary-historical-map-2026-05-11.md`
7. `MD-SUMMARY-projectflow-current-system-one-page-2026-05-11.md`
8. `MD-INDEX-projectflow-missing-legacy-reference-audit-2026-05-11.md`

這 8 份構成現在的最小安全入口。

---

## 4. 內容分層

### A. 治理層（最高優先）
- `MD-GOVERNANCE-projectflow-staging-production-and-context-isolation-2026-05-12.md`
- `MD-MASTER-projectflow-system-source-of-truth.md`
- `MD-INDEX-projectflow-governing-document-architecture-2026-05-11.md`
- `MD-INDEX-projectflow-active-secondary-historical-map-2026-05-11.md`
- `MD-SUMMARY-projectflow-current-system-one-page-2026-05-11.md`
- `MD-INDEX-projectflow-missing-legacy-reference-audit-2026-05-11.md`

用途：
- 定義現在該怎麼讀 `projectflow`
- 定義哪些是 active 主線
- 防止新 session 直接掉回舊 spec / 舊 handoff

### B. 測試站 / 正式站 / runtime 層
- `project-mgmt/ENVIRONMENTS.md`
- `project-mgmt/docs/projectflow-acceptance-env-and-deploy-separation-rules-2026-04-26.md`
- `project-mgmt/docs/projectflow-phase1-technical-tail-closure-summary-2026-04-26.md`
- `project-mgmt/docs/projectflow-production-runtime-verification-and-clean-start-playbook-2026-05-12.md`
- `project-mgmt/docs/projectflow-production-runtime-verification-conclusion-2026-05-12.md`
- `project-mgmt/docs/projectflow-host-side-redeploy-runbook-2026-05-12.md`
- `project-mgmt/docs/projectflow-admin-account-recovery-and-verification-sop-2026-05-12.md`

用途：
- 定義測試站與正式站角色
- 定義部署、runtime、host-side redeploy、admin 驗證與 clean-start 規則

### C. DB / migration / 資料治理層
- `project-mgmt/db/migrations/`
- `project-mgmt/db/FORMAL_TEST_DATA_GOVERNANCE.md`
- `project-mgmt/db/scripts/projectflow-formal-test-data-cleanup.sql`

用途：
- 定義 schema 演進
- 定義 clean-start / 測試資料清除策略
- 避免 live DB 與 repo schema 再度脫節

### D. 當前 handoff 層
- `MD-HANDOFF-projectflow-production-deploy-from-github-main-clean-start-2026-05-12.md`
- `MD-HANDOFF-projectflow-post-production-deploy-runtime-verification-2026-05-12.md`
- `MD-HANDOFF-projectflow-root-route-fix-awaiting-host-redeploy-2026-05-12.md`

用途：
- 續接最近一輪部署、runtime、root-route、host-side redeploy 脈絡

### E. 歷史參考層（只供回查）
- 早期 `MD1`、`MD10~17`、`MD21`、`MD26`
- 多數早期 `MD28~107`
- `repo/MD*.md`

用途：
- 回查歷史產品語意、規格演進、早期 repo 狀態

限制：
- 不可再主導現在式判斷

---

## 5. 打包邊界規則

### `projectflow` 專屬內容包括
- 所有 `MD-*projectflow*`
- `project-mgmt/docs/*projectflow*`
- 與 `projectflow` 部署 / runtime / DB / migration / acceptance / production 直接相關的手冊與規則

### 不應污染的對象
- 一般生活協助對談
- 其他非 `projectflow` 專案
- 與 `projectflow` 無關的群組或單次工作

### 行為要求
- 只有在 `projectflow` 任務才打開這整包內容
- 非 `projectflow` 任務不要主動載入這整包上下文

---

## 6. 現在已知的系統狀態摘要

截至 2026-05-12：
- `projectflow` 已有正式對外入口：`pmis.kuya.tw`
- Cloudflare DNS 接管與 Tunnel 主線已成立
- 正式站已可視為 go-live
- live DB 的 `projects.owner` 缺欄事故已被識別，且 repo migration 已補回
- GitHub `main` 已正式定義為測試站主線
- 正式站升版必須走「測試站先驗 → 整理候選 → 正式部署」流程

---

## 7. 一句話總結

> **這份文件是 `projectflow` 專案系統的單一封裝入口。未來只要要談 `projectflow`，先從這裡進；若不是 `projectflow` 任務，就不要打開這整包治理、部署、DB、handoff 與歷史脈絡。**
