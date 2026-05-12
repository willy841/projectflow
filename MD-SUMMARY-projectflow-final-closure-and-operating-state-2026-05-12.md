# MD-SUMMARY — projectflow 最終結案摘要與目前營運狀態 — 2026-05-12

Status: active
Scope: `projectflow` only
Purpose: 將 `projectflow` 的治理、操作、正式站、Cloudflare、DB schema 事故、後續注意事項整理成單一結案摘要

## 1. 結案判讀

截至 2026-05-12，可將 `projectflow` 判定為：

> **已完成正式站上線，並進入正式營運狀態。**

這不代表未來完全沒有維運工作，
但代表：
- 已有正式對外入口
- 已有正式 runtime
- 已有正式 DB 主線
- 測試站 / 正式站治理邊界已定義
- `projectflow` 已不再只是測試中系統，而是進入正式營運階段

---

## 2. 目前已成立的正式狀態

### A. 正式站已上線
已成立：
- `pmis.kuya.tw` 為正式對外入口
- 正式站已可透過 Cloudflare DNS + Tunnel 對外使用

### B. Cloudflare 接管已成立
已成立：
- `kuya.tw` DNS 已交由 Cloudflare 接管
- `pmis.kuya.tw` 子網域已建立為正式入口

### C. 原本主站與信箱主線未被破壞
已確認：
- `kuya.tw` 主站正常
- `www.kuya.tw` 正常
- 原本 2 筆 A record 與 5 筆 Google MX 記錄仍可正常工作

### D. 正式站 runtime 已可用
已確認：
- `/login`
- `/projects`
- `/vendors`
- `/quote-costs`
- `/accounting-center`
可作為正式站核心可用路徑

---

## 3. 這次最重要的事故與教訓

### live DB schema 事故
這次正式站 root route 故障，後來已被查明真正 root cause 為：

- live official DB 缺少 `projects.owner`
- 實際 live error：
  - `column p.owner does not exist`

### 重要教訓
1. 正式站事故不能先入為主只怪：
   - tunnel
   - Cloudflare
   - deploy
   - app route
2. live DB schema 與 repo migration 若脫節，會直接造成單一路徑 runtime 故障
3. `/` 這種首頁 root route 必須單獨驗，不能因為其他頁正常就假設它正常

---

## 4. 已完成的持久化修正

### A. live DB 直接救火已完成
- `projects.owner` 已在 live DB 補上

### B. repo migration 已補回
已新增：
- `project-mgmt/db/migrations/20260512_projects_owner_column_backfill.sql`

目的：
- 避免 future clean-start / rebuild / redeploy 再少一次 `projects.owner`

---

## 5. 測試站 / 正式站治理結論

這次已正式確立：

> **GitHub `main` 永遠屬於測試站主線。**

正式站治理規則：
1. 任何變更先進 GitHub `main`
2. 先在測試站驗證
3. 驗證通過後，整理成正式站候選變更
4. 最後才部署到正式站

不可再把：
- GitHub `main`
- 測試站
- 正式站
- 正式候選變更
混成同一層。

---

## 6. `projectflow` 專屬內容封裝狀態

這次已把 `projectflow` 從散亂 MD 脈絡，整理成專屬封裝：

### 已建立的核心文件
- `MD-GOVERNANCE-projectflow-staging-production-and-context-isolation-2026-05-12.md`
- `MD-INDEX-projectflow-system-package-and-context-boundary-2026-05-12.md`
- `MD-PACKAGE-projectflow-system-bundle-entrypoint-2026-05-12.md`
- `MD-OPERATIONS-projectflow-full-system-playbook-2026-05-12.md`

### 含義
未來 `projectflow` 應被視為一個專屬系統包：
- 只有在討論 `projectflow` 時才打開
- 不可污染其他一般對談或非 `projectflow` 任務

---

## 7. 目前建議的日後操作方式

### 測試站主線
- 所有新修改先進 GitHub `main`
- 先在測試站驗過

### 正式站升版
- 先整理變更檔案 / migration / runtime 差異
- 再部署到正式站
- 不可把本機已改講成正式站已生效

### deployment
- 容器內 prepare / build 不等於 live redeploy
- 若要確保正式站真更新，必須走真實 deploy 鏈並驗現場

### DB
- DB schema 變更一定要回寫 migration
- 不可只做 live 手動修補而不回寫 repo

---

## 8. 後續不是 blocker、但值得維護的項目

1. 若要恢復更完整的首頁總覽 dashboard，可再開獨立修復主線
2. 若未來正式站要再升版，應走既定 staging → candidate → production 流程
3. 定期確認 Cloudflare DNS 中主站 A / MX 紀錄不被誤刪
4. 持續把新的 `projectflow` handoff 與治理文件收進既有封裝體系

---

## 9. 一句話總結

> **`projectflow` 現在已完成正式站上線，並已建立正式治理體系：Cloudflare + `pmis.kuya.tw` 對外入口已成立，主站與信箱未被破壞，live DB 的 `projects.owner` 缺欄事故已修復且已回寫 migration；從現在起，GitHub `main` 屬於測試站主線，所有變更必須先在測試站驗證，再整理成正式站候選，最後才可部署到正式站。整套 `projectflow` 內容也已被封裝成專屬系統包，不應污染其他非 `projectflow` 對談。**
