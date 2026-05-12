# MD-INDEX — projectflow 系統封裝與上下文邊界索引 — 2026-05-12

Status: active
Purpose: 作為 `projectflow` 專屬內容的打包入口與最小載入邊界

## 1. 目的

本索引不是一般 handoff，而是 `projectflow` 專屬內容封裝的入口。

用途：
1. 把 `projectflow` 系統相關內容集中成可辨識的封裝領域
2. 定義哪些文件屬於 `projectflow` 專屬內容
3. 定義未來何時應載入、何時不應載入這套內容

---

## 2. 何時應載入這份索引

只有在以下情況，才應主動載入本索引與其下屬內容：
- 使用者明確提到 `projectflow`
- 任務與 `project-mgmt` 專案系統直接相關
- 任務涉及 `projectflow` 的：
  - 測試站
  - 正式站
  - deployment
  - runtime
  - DB schema
  - acceptance
  - migration
  - handoff
  - 系統治理

若任務不是 `projectflow`，不要主動讀這整包內容。

---

## 3. 核心治理入口

### A. 系統治理與分層規則
- `MD-GOVERNANCE-projectflow-staging-production-and-context-isolation-2026-05-12.md`

### B. 主系統來源入口
- `MD-MASTER-projectflow-system-source-of-truth.md`
- `MD-INDEX-projectflow-governing-document-architecture-2026-05-11.md`
- `MD-INDEX-projectflow-active-secondary-historical-map-2026-05-11.md`
- `MD-SUMMARY-projectflow-current-system-one-page-2026-05-11.md`
- `MD-INDEX-projectflow-missing-legacy-reference-audit-2026-05-11.md`

---

## 4. 部署 / runtime / DB / 正式站相关入口

### 正式 runtime 與 clean-start
- `project-mgmt/docs/projectflow-production-runtime-verification-and-clean-start-playbook-2026-05-12.md`
- `project-mgmt/docs/projectflow-production-runtime-verification-conclusion-2026-05-12.md`
- `project-mgmt/docs/projectflow-admin-account-recovery-and-verification-sop-2026-05-12.md`
- `project-mgmt/docs/projectflow-host-side-redeploy-runbook-2026-05-12.md`

### 測試站 / 正式站環境分界
- `project-mgmt/ENVIRONMENTS.md`
- `project-mgmt/docs/projectflow-acceptance-env-and-deploy-separation-rules-2026-04-26.md`
- `project-mgmt/docs/projectflow-phase1-technical-tail-closure-summary-2026-04-26.md`

### DB / 測試資料治理
- `project-mgmt/db/FORMAL_TEST_DATA_GOVERNANCE.md`
- `project-mgmt/db/migrations/`

---

## 5. handoff 集合

與 `projectflow` 直接相關的 handoff 至少包括：
- `MD-HANDOFF-projectflow-production-deploy-from-github-main-clean-start-2026-05-12.md`
- `MD-HANDOFF-projectflow-post-production-deploy-runtime-verification-2026-05-12.md`
- `MD-HANDOFF-projectflow-root-route-fix-awaiting-host-redeploy-2026-05-12.md`

---

## 6. 封裝邊界規則

### 可以做的事
- 在 `projectflow` 任務裡主動載入這套內容
- 用這套內容延續 deployment / DB /治理脈絡
- 將未來新的 `projectflow` 規則或 handoff 繼續收進這個封裝領域

### 不可以做的事
- 在非 `projectflow` 任務裡無差別帶入這套脈絡
- 把 `projectflow` 規則視為全域一般規則
- 讓大量 `projectflow` 文件污染其他主題對談上下文

---

## 7. 一句話總結

> **這份索引是 `projectflow` 系統封裝的專屬入口；只有在討論 `projectflow` 時，才應打開這整包治理、部署、DB、handoff 與系統脈絡。**
