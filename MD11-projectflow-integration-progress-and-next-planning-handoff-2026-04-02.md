> ⚠️ **歷史回查文件 / 已非主入口**
>
> 本檔已被以下主幹文件大幅吸收或覆蓋：
> - `MD-MASTER-projectflow-system-source-of-truth.md`
> - `MD14-projectflow-progress-review-and-next-step-handoff-2026-04-04.md`
> - `MD15-projectflow-repo-audit-summary-v1-2026-04-04.md`
> - `MD16-projectflow-current-round-handoff-2026-04-04.md`
>
> **新續接請不要先讀本檔。**
> 正確順序是先讀：`MD16 -> MD15 -> MD14 -> MD-MASTER`。
> 本檔僅保留作為歷史脈絡 / 細節回查用途。

---

# MD11 - projectflow 整合進度與下一輪需求盤點交接（2026-04-02 下午收口版）

> 目的：承接 MD10，整理本輪最後已完成的上線狀態、已驗證結果，以及下一輪要做的『盤點所有 MD、歸納所有需求』工作起點。

---

## A. 本輪最後確認的狀態

### 1. 部署線已修到可驗收
經過 GitHub / Vercel 排查與修正後，最後已將正確整合版本推上 GitHub 並成功部署。

最終確認：
- Vercel 驗收版本已吃到 commit：`bdec797`
- 該版本狀態為：**Ready / Production / Current**
- 使用者最後確認：
  - **「好 回來了」**

這代表：
> **舊系統主體 + MD8 / MD9 第一輪整合版已成功回到可驗收狀態。**

---

## B. 本輪實際已完成的整合方向

這次不是繼續做新骨架，而是正式把方向拉回：

> **主體以舊系統為準，MD8 / MD9 併進去。**

### 已完成的第一輪整合（來自 CTO 回報，且最終版本已推上線）

1. **舊 project detail 主體已接回**
- 不再是簡化骨架版 detail page
- 舊主體元件已恢復主線

2. **MD9 已嵌回舊 project detail**
- 新增 Vendor 區塊整合進舊頁
- 不是整頁取代
- 方向為：
  - `Assignment / Reply`（pre-issue）
  - `Issued Packages`（post-issue）

3. **MD8 主線保留**
- `vendor-package-detail.tsx`
- Package Page
- Final Outgoing Document

都仍保留在可用狀態，沒有因整合而被拆掉。

4. **舊系統其他主頁也有接回**
- 較完整首頁
- 較完整專案列表頁
- `design-tasks/page.tsx`
- 側欄方向也拉回舊系統主線

---

## C. 關鍵 commit（下一串要記住）

### 部署 / 補檔 / framework 修正線
- `87647a4` — `feat: formalize vendor package document semantics`
- `3ecb7b9` — `fix: add missing project app dependencies for deploy`
- `5c25b0a` — `fix: pin vercel framework to nextjs`

### 整合回舊主體的關鍵 commit
- `bdec797` — `feat: restore legacy project detail with vendor flow`

下一串如果要盤 repo 或對照 GitHub / Vercel，這幾個 commit 必須先知道。

---

## D. 本輪最重要的產品決策（高優先級記住）

### 已正式拍板

1. **主體以舊系統為準**
2. **MD8 要併進舊系統，不可獨立長成簡化版 app**
3. **MD9 要長在舊 project detail 裡，不可用簡化版 project detail 覆蓋整頁**
4. **若新舊衝突，優先保留舊系統核心功能，再調整 MD8 / MD9 的併入方式**

一句話總結：

> **不是新骨架取代舊系統，而是舊系統主體恢復，MD8 / MD9 成為整合進來的新能力。**

---

## E. 使用者下一輪要做的事（已明講）

使用者明確表示：

> **下一輪要盤點所有 MD，並開始歸納所有需求。**

所以新對話的主題，不應再優先從部署 debug 開始，而應直接進入：

# 「盤點所有 MD → 收斂需求 → 建立整體需求地圖 / 修正清單」

---

## F. 下一輪建議工作順序

### Step 1：盤點所有 MD
至少需重新讀：
- `MD1-projectflow-handover.md`
- `MD4-conversation-context-rule-and-vendor-flow-notes-2026-03-31.md`
- `MD5-vendor-flow-context-handoff-2026-03-31.md`
- `MD6-vendor-flow-v1-cto-delivery-2026-04-01.md`
- `MD7-vendor-flow-discussion-handoff-2026-04-01.md`
- `MD8-package-page-final-outgoing-document-handoff-2026-04-02.md`
- `MD9-project-detail-vendor-information-architecture-handoff-2026-04-02.md`
- `MD10-projectflow-deployment-debug-and-integration-reset-handoff-2026-04-02.md`
- 本份 `MD11`

### Step 2：整理成需求地圖
應把所有 MD 中的需求至少分成：

1. **已拍板且已上線**
2. **已拍板但未完成**
3. **已做第一輪但需修正**
4. **尚未定稿 / 仍待討論**
5. **彼此衝突 / 已被新原則推翻的舊方向**

### Step 3：建立一份統一產品母單
理想輸出應該是一份：
- `projectflow master requirement map`
- 或類似「需求總表 / 整合修正總單」

讓後續不再靠零散 MD 追脈絡。

### Step 4：依主體優先順序切下一輪任務
優先順序應以：
1. 舊系統主體完整性
2. MD8 / MD9 併入修正
3. vendor flow 與 execution / assignment 深層串接
4. 正式資料模型 / shared state / persistence

---

## G. 本輪仍未收完、下一輪可接續的議題

### 1. 舊主體與新 vendor flow 的深層資料整合
目前第一輪整合已上線，但尚未完成：
- execution tree 與 vendor assignment 的真正資料映射
- assignment 從舊 execution 項目直接發包到 package 的串接
- package / document 與舊主體更完整的 shared state

### 2. `design-tasks` 相關頁面是否要完整接回
目前至少主頁已回來，但 detail / new / edit 等延伸頁未完整處理。

### 3. 需求總表尚未建立
這是下一輪的重點，不應再只靠個別 MD 續接。

---

## H. GitHub / Vercel 目前應記住的實務脈絡

### GitHub push 規則
- `projectflow` repo 一律優先使用 SSH
- remote：`git@github.com:willy841/projectflow.git`
- 本機 SSH key：`~/.ssh/id_ed25519`

### Vercel 部署脈絡
- 先前曾有 branch / root directory / 缺檔 / framework detection 問題
- 之後已補 `vercel.json`：
  - `framework = nextjs`
- 最終以新 deployment 成功帶到 `bdec797`
- 使用者確認「回來了」

這些脈絡下一輪只需視為背景，不要再從頭重跑，除非新的 deployment 又壞掉。

---

## I. 下一串可直接引用的短版摘要

今天已完成 projectflow 一輪重要重校正：

- 先修完 GitHub / SSH / Vercel / branch / root directory / 缺檔 / framework detect 問題
- 最後成功把整合版本 deploy 到 `bdec797`
- 使用者已確認：**舊系統主體回來了**

本輪最重要的新拍板是：

> **主體以舊系統為準，MD8 / MD9 要併進去，不可用新骨架取代舊系統。**

下一輪使用者要做的是：

> **盤點所有 MD，並開始歸納所有需求。**

所以新對話應直接從：
1. 全量盤 MD
2. 需求分類
3. 產出統一需求地圖 / 母單
4. 再切下一輪 CTO / 前端修正單

往下走，而不是再重新 debug 部署。
