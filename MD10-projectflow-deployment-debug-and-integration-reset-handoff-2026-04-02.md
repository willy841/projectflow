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

# MD10 - projectflow 部署排查與整合方向重校正交接（2026-04-02 下午版）

> 目的：整理本輪從 GitHub / Vercel 部署排查，到 projectflow 產品整合方向重校正的完整脈絡，讓下一串可直接續接，不必重查。

---

## A. 本輪核心結論

本輪做了兩件大事：

1. **把昨天 MD8 / MD9 相關修改真正推上 GitHub 並部署排查**
2. **確認目前上線內容與產品主線錯位，正式重校正整合方向**

最重要的總結是：

> **projectflow 的主體必須以舊系統為準，MD8 / MD9 要併進去，不可用新骨架取代舊系統。**

---

## B. GitHub / Vercel 部署排查過程摘要

### 1. GitHub remote / push 問題
一開始 `project-mgmt` repo 沒有正確 remote，先補上 remote。

- HTTPS push 失敗，原因是缺 GitHub 認證
- 經查本機已有可用 SSH key：`~/.ssh/id_ed25519`
- 並可成功驗證 GitHub：`ssh -T git@github.com`

最後確認 `projectflow` repo 正確 remote 應為：
- `git@github.com:willy841/projectflow.git`

### 2. GitHub 分支錯位
排查後確認：
- Vercel Production 實際吃的是 `main`
- 但昨天主要修改一開始在 `master`

後續已把：
- `origin/main`
- `origin/master`

對齊到同一個 commit（先前對齊到 `87647a4`，後續又往前推進）。

### 3. Vercel 原專案設定問題
在原本 `projectflow-henna` / 後續 `projectflow-v2` 排查過程中，先後確認：

- 一開始 **Root Directory 設錯**，為 `/`
- 正確應為：`project-mgmt`
- 不修正時會出現：
  - `Couldn't find any 'pages' or 'app' directory. Please create one under the project root`

### 4. Vercel 最初部署缺檔
修正 branch 與 root directory 後，Vercel 又出現 `module-not-found`。

排查後發現真正原因是：
- GitHub 上先前推送的 commit 只包含 MD8 / MD9 直接修改檔
- 但它依賴的支撐檔案沒有一起上去

缺的支撐檔包括：
- `src/components/app-shell.tsx`
- `src/components/project-data.ts`
- `src/components/project-form.tsx`
- `src/app/projects/page.tsx`
- `src/app/projects/new/page.tsx`
- 以及相關首頁 / tsconfig / README 調整

後續已補上並 push。

### 5. Vercel 顯示 Ready 但整站 404
補完缺檔、重新部署後，出現更深層異常：

- Deployment 顯示 **Ready / Production / Current**
- 但實際測：
  - `/`
  - `/projects`
  - `/projects/spring-popup-2026`
  全部 404

進一步檢查後：
- Deployment Summary 曾顯示：
  - **No framework detected**
- 且只看到靜態資產：
  - `/file.svg`
  - `/globe.svg`
  - `/next.svg`
  - `/vercel.svg`
  - `/window.svg`

這代表 Vercel 雖然 build 成功，但**沒有把這個專案穩定當成 Next.js app serving deployment**。

### 6. 已補 `vercel.json`
為了強制 Vercel 明確以 Next.js app 處理，已新增：

`project-mgmt/vercel.json`

內容：
```json
{
  "$schema": "https://openapi.vercel.sh/vercel.json",
  "framework": "nextjs"
}
```

對應 commit：
- `5c25b0a` — `fix: pin vercel framework to nextjs`

但即使如此，部署 / serving 層異常是否完全解掉，仍需持續驗證。

---

## C. 本輪重要 GitHub / 部署相關 commit

按時間順序，本輪關鍵 commit 至少包括：

- `87647a4` — `feat: formalize vendor package document semantics`
- `3ecb7b9` — `fix: add missing project app dependencies for deploy`
- `5c25b0a` — `fix: pin vercel framework to nextjs`

另外 workspace 層還有記錄型 commit（不一定在 projectflow repo 本體）：
- `7d9bb71` — `docs: enforce context handoff startup rule`
- `d13bcb0` — `docs: enforce low-usage handoff rule`
- `0081639` — `docs: record github ssh push workflow`

---

## D. 本輪部署排查後的產品發現

部署問題排到後面，實際打開頁面後發現更大的產品問題：

> **昨天的 MD8 / MD9 新東西出來了，但舊專案系統主體被覆蓋掉了。**

也就是：
- 新 vendor / package / project detail vendor IA 骨架存在
- 但原本舊專案系統裡的重要頁面、資訊密度、互動能力沒有一起承接回來

使用者明確指出：
- 很多原本舊系統裡要的東西現在都沒了

這不是錯覺，而是因為當前 `main` 上線的是一條**較精簡的骨架線**，不是原本那條較完整的舊系統工作流。

---

## E. 使用者正式拍板的新整合原則

這是本輪最重要、最應優先記住的產品決策：

### 已正式拍板

1. **主體以舊系統為準**
2. **MD8 要併進舊系統，不可獨立長成簡化版 app**
3. **MD9 要長在舊 project detail 裡，不可用簡化版 project detail 覆蓋整頁**
4. **若新舊衝突，優先保留舊系統核心功能，再調整 MD8 / MD9 的併入方式**

一句話總結：

> **不是繼續做新骨架，而是回到舊系統主體，讓 MD8 / MD9 成為整合進來的新能力。**

---

## F. 目前可明確判斷的產品問題

### 1. 目前上線主體過於骨架化
目前 `main` 上實際被追蹤、上線的頁面集合偏小，主要只有：

- `/`
- `/projects`
- `/projects/[id]`
- `/projects/new`
- `/vendor-assignments`
- `/vendor-assignments/[id]`
- `/vendor-packages`
- `/vendor-packages/[id]`

與少量支撐 component。

### 2. 舊系統高機率被覆蓋掉的能力
依 MD1 與先前脈絡，現階段高機率被覆蓋／未承接的舊系統能力包括：

- 需求溝通區塊
- 專案執行項目 / execution tree
- 樹狀子項目操作
- 設計交辦 inline 流程
- 備品採購 inline 流程
- 舊 project detail 的高資訊密度管理介面
- 先前 assignment / reply 與專案頁對齊的互動線

### 3. 當前 main 更像 vendor/package 骨架站，不像完整專案系統 MVP
這是本輪最重要的產品風險判斷之一。

---

## G. 目前已啟動但被使用者要求暫停的工作

已經開始一輪新的 CTO 整合工作，方向是：
- 以舊系統主體為準
- 把 MD8 / MD9 併回去

但在使用者要求下，已先**暫停**。

因此目前狀態是：
- 方向已拍板
- 派工已啟動過
- 但使用者後續要求先停
- 尚未收到完整 CTO 回報結果前，就轉成先打包交接

---

## H. 下一步應如何續接（非常重要）

下一串不要再從頭 debug Vercel 與 branch，而應直接從以下兩條主線接：

### 主線 1：舊系統主體 + MD8 / MD9 整合修正
應直接整理或派工：

1. **主體保留區**
   - 舊系統哪些頁面 / 區塊 / 互動必須恢復與保留

2. **MD8 併入點**
   - Package Page / Final Outgoing Document 要如何嵌回舊系統 vendor flow

3. **MD9 併入點**
   - Project Detail Vendor 區如何長回舊 project detail

4. **衝突清單**
   - 哪些檔案 / 資料結構 / UI 區塊互相衝突
   - 哪些是骨架覆蓋舊系統造成的

5. **CTO 執行順序**
   - 先恢復主體
   - 再整合 MD8 / MD9
   - 最後修衝突與驗收

### 主線 2：Vercel serving 層後續驗證
因為部署層目前仍曾出現：
- Ready 但整站 404
- Deployment Summary 顯示 `No framework detected`

所以若要繼續查部署，應直接從：
- `vercel.json` 補上後的新 deployment 是否正常識別 framework
- 最新 `main` deployment 是否不再出現 `No framework detected`
- `projectflow-v2` 的實際 routes 是否恢復正常 serving

但這條線的優先級，應低於「舊系統主體 + MD8 / MD9 整合修正」。

---

## I. 使用者偏好與工作規則（本輪再次強化）

### 1. Context / usage 規則
- 當 context 接近飽和，必須主動提醒
- 當 usage 剩餘約 10%，也必須主動收口
- 不可硬撐
- 應主動建議開新對話 / 新 session
- 必須先整理交接 MD

### 2. GitHub push 規則
- `projectflow` repo 一律優先使用 SSH
- remote：`git@github.com:willy841/projectflow.git`
- 本機 SSH key：`~/.ssh/id_ed25519`
- 不要預設 HTTPS

### 3. 每次新對話要帶入的資訊
- 相關 MD 必須先讀
- GitHub / SSH / Vercel / projectflow branch 脈絡必須帶入
- 特別是本次已拍板的：
  - **主體以舊系統為準，MD8 / MD9 併進去**

---

## J. 新串可直接引用的短版摘要

本輪先做了 projectflow 的 GitHub / Vercel 部署排查，確認並修正：
- GitHub remote / SSH push
- `main` / `master` 分支錯位
- Vercel Root Directory 設錯
- GitHub 缺少支撐檔導致 module-not-found
- 已補 `vercel.json` 強制 framework = nextjs

但在部署排查後，使用者明確指出：
- 昨天的 MD8 / MD9 新東西雖然出來了
- 但舊專案系統裡很多核心東西不見了

因此本輪最重要的新拍板是：

> **主體以舊系統為準，MD8 / MD9 要併進去，不能用新骨架取代舊系統。**

下一步應直接從：
1. 舊系統主體恢復清單
2. MD8 / MD9 併入點
3. 新舊衝突修正清單
4. CTO 下一輪整合實作順序

往下走，而不要再沿用『骨架版直接取代舊系統』的方向。
