# MD-OPERATIONS — projectflow 專案系統完整操作總手冊 — 2026-05-12

Status: active
Scope: `projectflow` only
Purpose: 將 `projectflow` 的 skills、tools、GitHub 流程、測試站、正式站、DB、Cloudflare、deploy、驗收方式整合成單一操作手冊

## 1. 這份文件是做什麼的

這份文件不是單一 handoff，也不是單一部署 memo。
它是 `projectflow` 專案系統的完整操作總手冊。

用途：
1. 告訴未來的 `projectflow` 工作應該怎麼做
2. 告訴系統內會用到哪些 skill / tool / 路徑 / 入口
3. 定義從 GitHub 測試站到正式站的升版流程
4. 定義正式站 deployment、DB、Cloudflare、Tunnel 與驗收方式
5. 避免 `projectflow` 知識散落成大量無入口的 MD 噪音

---

## 2. 核心治理規則（先讀）

先遵守：
- `MD-GOVERNANCE-projectflow-staging-production-and-context-isolation-2026-05-12.md`
- `MD-PACKAGE-projectflow-system-bundle-entrypoint-2026-05-12.md`
- `MD-INDEX-projectflow-system-package-and-context-boundary-2026-05-12.md`

其中最重要的一條：

> **GitHub `main` 永遠屬於測試站主線。任何變更都必須先在測試站驗過，再整理成正式站候選變更，最後才可部署到正式站。**

---

## 3. `projectflow` 會用到的 skills

### A. `webapp-deployer-deploy`
用途：
- 把 `project-mgmt` 透過 `webapp-deployer` 部署到本機正式站（Web App Platform）

使用情境：
- 正式站部署
- 產生 deploy package
- 查正式部署狀態

關鍵規則：
- 不可直接 copy source 到 `webapp-platform`
- 正確路線是：source project → deployment package → deployer → runtime

### B. `skill-creator`
用途：
- 整理、封裝、改善 skills / 治理文件 / 結構化知識包

使用情境：
- 當要把 `projectflow` 操作知識整理成可封裝、可重用的專屬知識入口時
- 當要整理結構、清理、治理 skill / 文檔包時

### C. 其他 skills
目前 `projectflow` 主線沒有固定要求其他技能包。
若未來有專屬 `projectflow` skill，可再把它收進本操作總手冊。

---

## 4. `projectflow` 會用到的 tools / 能力

### 文件 / 結構整理
- `read`
- `write`
- `edit`

用途：
- 讀治理文件
- 補 handoff
- 更新 migration / docs / 規則文件

### 執行與驗證
- `exec`
- `process`

用途：
- build
- deploy script
- SQL / migration / runtime 指令
- 背景進程管理

### 記憶與歷史延續
- `memory_search`
- `memory_get`

用途：
- 查過去決策
- 查部署脈絡
- 查治理規則

### 重要限制
- 在 Telegram 直連 session 中，不能假設有 host/elevated 權限
- 本機 repo 已改，不等於正式站已生效
- 正式 deploy 是否真的落地，必須看真實部署鏈與現場驗證

---

## 5. 系統核心路徑與入口

### Workspace / source
#### Container-side
- workspace root: `/home/node/.openclaw/workspace`
- source project: `/home/node/.openclaw/workspace/project-mgmt`
- deployment target: `/home/node/.openclaw/workspace/deployments/project-mgmt-web`

#### Host-side
- source project: `/Users/user/openclaw-secure/data/workspace/project-mgmt`
- deployment target: `/Users/user/openclaw-secure/data/workspace/deployments/project-mgmt-web`
- webapp platform root: `/Users/user/webapp-platform`

### 正式 deployer 入口
- Docker-network deployer URL: `http://webapp-deployer:8081`
- Host deployer URL: `http://127.0.0.1:8081`

### 正式站公開入口
- `https://pmis.kuya.tw`

---

## 6. GitHub / 測試站 / 正式站流程

## A. GitHub
### 規則
- GitHub `main` = 測試站主線
- 不可把 `main` 直接視為正式站版本

### 變更流程
1. 在 workspace 內修改 code / docs / migration
2. build / test / 驗收
3. commit
4. push 到 GitHub `main`
5. 在測試站驗證

### 如何推上 GitHub
基本流程：
```bash
cd /home/node/.openclaw/workspace/project-mgmt
git status
git add <files>
git commit -m "..."
git push origin main
```

注意：
- 未經驗證，不可直接當成正式站候選
- push 成功 ≠ 正式站已更新

## B. 測試站
用途：
- 承接 `main`
- 驗證所有新修改
- 驗功能 / runtime / schema / route / DB 行為

## C. 正式站
用途：
- 正式使用
- 只吃已驗證、已整理、已批准的候選變更

正式站升版前，至少要整理：
- 這次改了哪些檔案
- 哪些 migration
- 哪些 runtime / env 變更
- 驗證結果
- 風險

---

## 7. 正式部署方式

### Container-side deploy script
```bash
cd /home/node/.openclaw/workspace/project-mgmt
sh ./scripts/deploy.sh prepare
sh ./scripts/deploy.sh deploy
sh ./scripts/deploy.sh status
```

### Host-side 真實 deploy 鏈（重要）
如果正式站真實 deploy 是走 host-side，那 canonical 指令為：

```bash
cd /Users/user/openclaw-secure/data/workspace/project-mgmt
DEPLOYER_URL=http://127.0.0.1:8081 sh ./scripts/deploy.sh deploy
```

查狀態：

```bash
cd /Users/user/openclaw-secure/data/workspace/project-mgmt
DEPLOYER_URL=http://127.0.0.1:8081 sh ./scripts/deploy.sh status
```

### 重要規則
- 不可直接 copy source 到 `/Users/user/webapp-platform`
- 不可把 deploy package 更新講成正式站已更新
- 不可把本機 repo 已改講成 live runtime 已生效

---

## 8. DB / migration / 正式資料治理

### DB 類型
#### 測試站 / 驗證 DB
- 目前常用 Supabase transaction pooler

#### 正式站 DB
- 本機 `webapp-db`
- live runtime 曾直接出現缺欄事故：`column p.owner does not exist`

### migration 管理
位置：
- `project-mgmt/db/migrations/`

重要事故已寫回 repo：
- `20260512_projects_owner_column_backfill.sql`

用途：
- 避免 future clean-start / rebuild / redeploy 再少 `projects.owner`

### 測試資料治理
- `project-mgmt/db/FORMAL_TEST_DATA_GOVERNANCE.md`
- `project-mgmt/db/scripts/projectflow-formal-test-data-cleanup.sql`

規則：
- 正式站不可匯入 acceptance sample seed
- project-scoped test data 要能清
- clean-start 要走 schema-only 初始化，不帶測試資料

---

## 9. Cloudflare / 正式對外入口

### 已成立的主線
- `kuya.tw` DNS 已由 Cloudflare 接管
- `pmis.kuya.tw` 已透過 Cloudflare Tunnel 對外提供正式站入口
- 原本主站與信箱主線（A / MX）已確認未被破壞

### 已確認保留的既有主線
#### A records
- `@` → `103.17.9.208`
- `www` → `103.17.9.208`

#### MX records
- `aspmx.l.google.com`
- `alt1.aspmx.l.google.com`
- `alt2.aspmx.l.google.com`
- `aspmx2.googlemail.com`
- `aspmx3.googlemail.com`

### 規則
- `pmis.kuya.tw` 已可視為正式站正式入口
- 不應再把 Cloudflare / Tunnel / DNS 和首頁事故混成同一個問題

---

## 10. 驗收方式（重要）

`projectflow` 的驗收不是只看 build 成功，也不是只看 deploy 成功。
必須分層驗收。

### A. 測試站驗收
至少驗：
- login
- 核心頁
- 變更涉及頁面
- DB schema 是否對齊
- migration 是否可正常 apply

### B. 正式站部署驗收
至少驗：
1. deploy 是否成功
2. runtime 是否啟動
3. 正式入口是否可達
4. DB schema 是否對齊
5. 不得帶入測試資料

### C. 正式站頁面驗收
至少驗：
- `/login`
- `/projects`
- `/vendors`
- `/quote-costs`
- `/accounting-center`
- `/`（若首頁仍是專屬獨立功能頁，也必須單獨驗）

### D. root-route 事故教訓
這次已明確證明：
- 其他頁正常，不代表 `/` 正常
- `/` 必須單獨驗
- live DB schema 缺欄可能只炸單一頁面

### E. 驗收回報格式
每次回報至少要分清楚：
1. 測試站是否驗過
2. 正式站是否已部署
3. live runtime 是否已更新
4. 哪些頁正常
5. 哪些頁異常
6. DB / migration 是否有 live 修補

---

## 11. `projectflow` 專屬上下文隔離規則

這整份操作手冊只屬於 `projectflow`。

### 只在以下情況載入
- 使用者明確提到 `projectflow`
- 任務直接涉及 `project-mgmt`
- 任務涉及 staging / production / deploy / DB / migration / handoff / runtime / Cloudflare

### 不可污染的對談
- 一般生活協助
- 與 `projectflow` 無關的專案
- 其他獨立主題

規則：
- 只有在 `projectflow` 任務，才應主動打開這整包內容
- 非 `projectflow` 任務，不應讓這些母檔、handoff、治理文檔佔據主上下文

---

## 12. 建議入口順序

未來要續接 `projectflow`，建議入口順序：

1. `MD-PACKAGE-projectflow-system-bundle-entrypoint-2026-05-12.md`
2. `MD-GOVERNANCE-projectflow-staging-production-and-context-isolation-2026-05-12.md`
3. `MD-INDEX-projectflow-system-package-and-context-boundary-2026-05-12.md`
4. `MD-OPERATIONS-projectflow-full-system-playbook-2026-05-12.md`
5. 再依任務需要讀 deployment / runtime / DB / handoff 文件

---

## 13. 一句話總結

> **這份文件是 `projectflow` 專案系統的完整操作總手冊：它定義了會用到哪些 skill、哪些 tool、如何推 GitHub、如何從測試站驗證後再進正式站、如何沿著 deploy / Cloudflare / DB / migration 路徑工作，以及未來驗收時應該怎麼分層驗證。這整包內容只屬於 `projectflow`，不可污染其他一般對談。**
