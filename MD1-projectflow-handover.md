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

# MD1 - projectflow 專案交接紀錄

> 用途：提供後續拆出的 agent 直接閱讀後接手，不需要重新口頭交代整個專案背景。
> 更新基準：依據 `https://github.com/willy841/projectflow.git` 目前 repo 內容、workspace 內既有記錄、以及已確認的專案脈絡整理。

---

## 1. 專案是什麼

**專案名稱：** projectflow  
**Repo：** `https://github.com/willy841/projectflow.git`  
**定位：** 專案營運管理系統 MVP  
**核心目標：** 以「專案」為中心，整合以下流程：

- 專案管理
- 需求溝通
- 設計交辦
- 備品採購
- 廠商管理
- 成本 / 帳務摘要

---

## 2. 使用者合作偏好

後續 agent 請直接遵守：

- **所有溝通一律使用繁體中文**
- 以 **高階前後端軟體工程師** 的角度協作
- 使用者偏好 **先做看得到、可立即驗收的前端修改**
- UI 驗收很細，特別在意：
  - 按鈕可讀性
  - 狀態 badge 是否垂直置中
  - 桌機 100% 顯示比例下是否跑版
  - 畫布寬度 / 側欄寬度 / 表格寬度是否合理
  - 命名與資訊架構是否一致
- 不要只講抽象規劃，**要能直接落成畫面或互動**

---

## 3. 技術棧

依 repo README 與現況：

- Next.js 16
- React 19
- TypeScript
- Tailwind CSS 4

注意：repo 的 `AGENTS.md` 明確提醒：

- **這不是你訓練資料裡熟悉的舊版 Next.js**
- 寫 code 前若牽涉框架慣例，應參考對應版本文件

---

## 4. 專案目前狀態總結

### 4.1 現況本質
目前仍是 **前端互動型 MVP / 假資料驅動**，不是完整串接後端的正式產品。

也就是說：

- 已有不少頁面與互動流程
- 主要資料來源仍是本地假資料與 component state
- **尚未真正接上資料庫 / API / 全域共享狀態架構**

### 4.2 目前 branch / 最近 commit
- branch: `main`
- 最近 repo commit（讀取時看到）：
  - `622cdd6` refactor: separate design task reply actions
  - `78ec083` refactor: align design task interactions with project view
  - `d865ebd` feat: add inline editing for design task board
  - `f10db91` feat: restructure vendor assignment fields
  - `36519d0` feat: add nested reply item tree
  - `1fc3578` feat: support multi-line assignment replies
  - `97818ed` feat: add reply edit and delete actions
  - `a860310` refactor: condense assignment review list
  - `2671ec4` feat: refine assignment reply panel
  - `ed1dcc8` fix: prevent assignment form focus loss
  - `b20821f` fix: move assignment replies to category view
  - `5ee3123` feat: add assignment replies
  - `49730ed` feat: add assignment status workflow
  - `b4b0a74` style: unify assignment form layouts
  - `a92c8c1` feat: add expandable project category view

=> 可判斷最近主要工作重心在：
- 設計任務頁與專案頁互動對齊
- 回覆 / 子項目 / 多層回覆互動
- 交辦表單與檢視區塊整理

---

## 5. 已確認的資訊架構與產品方向

這一段很重要，後續 agent 不要再走回舊架構。

### 已確認的核心流程
交辦不再是獨立主入口，而是從：

**專案詳細頁 → 專案執行項目 → 次項目 → 交辦**

發起。

### 已確認的命名調整
左側選單已調整為：

- **設計任務版**
- **備品採購版**

並且：

- **需求溝通不再是左側主入口**
- 需求溝通屬於 **專案內層級**

### 交辦類型調整
依既有記錄，交辦類型曾調整為只保留：

- 設計
- 備品
- 廠商

並且曾明確移除：

- 交辦給人員的舊思路
- 截止日 / 指派人員等不必要欄位（至少在某些前端流程中已簡化）

---

## 6. 目前 repo 中已存在的主要頁面 / 元件

### App pages
- `src/app/page.tsx`
- `src/app/projects/page.tsx`
- `src/app/design-tasks/page.tsx`

### 主要 components
- `src/components/app-shell.tsx`
- `src/components/project-data.ts`
- `src/components/project-detail-shell.tsx`
- `src/components/execution-tree.tsx`
- `src/components/execution-tree-section.tsx`
- `src/components/requirements-panel.tsx`
- `src/components/design-task-form.tsx`
- `src/components/procurement-task-form.tsx`
- `src/components/vendor-task-form.tsx`
- `src/components/execution-item-form.tsx`
- `src/components/design-task-data.ts`
- `src/components/project-form.tsx`
- `src/components/copy-event-info-button.tsx`

---

## 7. 現有功能盤點（依 repo 實際內容 + 已知記錄整理）

### 7.1 專案資料層
檔案：`src/components/project-data.ts`

目前可看出：
- 使用 `projects` 陣列作為主要假資料來源
- 有完整 `Project` 型別與下列欄位：
  - 專案基本資訊
  - requirements
  - executionItems
  - designTasks
  - procurementTasks
- `executionItems` 支援巢狀 children
- item / subitem 已含：
  - title
  - status
  - category
  - quantity
  - unit
  - amount
  - note
  - assignee（子項目）

=> 代表資料模型已朝「專案 > 執行項目 > 次項目」的方向整理。

---

### 7.2 專案列表頁
檔案：`src/app/projects/page.tsx`

目前已有：
- 專案總數 / 執行中 / 待發包採購中 / 平均進度 的統計卡片
- 專案列表 table
- 搜尋 input（目前偏展示用途）
- 日期排序按鈕（目前偏展示用途）
- 新增專案按鈕
- 專案名稱可點入詳細頁

使用者先前很在意：
- table 寬度
- badge 對齊
- 100% 顯示比例下的排版穩定度

---

### 7.3 專案詳細頁
檔案：`src/components/project-detail-shell.tsx`

目前已有：
- header 顯示專案代碼、狀態 badge、名稱、備註
- 返回列表
- 編輯專案按鈕
- 可同頁編輯專案資訊（前端 state）
- 專案 KPI 卡片（活動日期 / 地點 / 進場時間 / 預算 / 成本）
- 專案基本資訊區塊
- 需求溝通區塊 `RequirementsPanel`
- 專案執行項目區塊 `ExecutionTreeSection`
- 複製活動資訊按鈕 `CopyEventInfoButton`

這頁是目前的產品核心。

---

### 7.4 需求溝通（已內嵌到專案頁）
檔案：`src/components/requirements-panel.tsx`

目前已有：
- 在專案內同頁記錄需求溝通內容
- 新增紀錄
- 編輯紀錄
- 刪除紀錄
- 自動記錄儲存當下時間戳

現況性質：
- 資料存在 component local state
- 重新整理後不會真正持久化

但就 UX 驗收角度，這一版已可展示流程。

---

### 7.5 專案執行項目 / 交辦互動區
檔案：`src/components/execution-tree.tsx`
與 `src/components/execution-tree-section.tsx`

目前已存在或可推定已完成的能力：

#### 執行項目樹狀邏輯
- 專案執行項目有主項目 / 次項目結構
- 支援樹狀顯示
- 支援子項目概念
- 先前記錄顯示曾支援 expand / collapse、inline 編輯、新增、刪除

#### 交辦流程
- 可由執行項目衍生出交辦
- 分成類別切換：
  - design
  - procurement
  - vendor
- 各類別都有對應 draft 結構：
  - `DesignAssignmentDraft`
  - `ProcurementAssignmentDraft`
  - `VendorAssignmentDraft`

#### 表單 / 已儲存摘要
- 交辦表單支援同頁編輯
- 儲存後會顯示摘要卡片
- 可再編輯 / 刪除

#### 回覆機制（最近開發重點）
從最近 commit 與程式內容可確認：
- 已有 assignment replies 機制
- 支援多行回覆
- 支援巢狀 reply item tree
- 支援 reply 新增 / 編輯 / 刪除
- 支援主項目 + 子項目式回覆內容組合
- 設計任務頁與專案頁的 reply 互動已在對齊

也就是說，目前 repo 的一個重點能力是：
**交辦建立後，可以在同頁繼續做結構化回覆，而不是只停在單次表單提交。**

---

### 7.6 設計任務版
檔案：`src/app/design-tasks/page.tsx`
與 `src/components/design-task-data.ts`

目前可確認：
- 設計任務版頁面已存在
- 使用前端 state 管理任務列表
- 可編輯 task
- 可修改狀態
- 可新增 reply
- reply 支援：
  - 主項目 / 子項目
  - 多行文字組合
  - 展開 / 收合

最近 commit 也顯示：
- 設計任務頁互動正在向專案頁的交辦互動對齊
- 已新增 inline editing for design task board

---

## 8. 已知曾完成但需再次驗證的功能（來自既有記錄）

以下功能曾在記錄中被標示為已完成或已部署成功，但後續 agent 仍應以 repo 與實機驗收再次確認：

- 需求溝通改為同頁互動紀錄
- 專案執行項目樹狀 inline 操作
- 左側選單改名為設計任務版 / 備品採購版
- 專案詳細頁區塊命名為專案設計 / 專案備品
- Vercel build 鏈路修復成功
- Production / Current 曾更新到最新版本
- 曾加入 **CSV 匯入 execution tree** 功能
- 規則曾記錄為：
  - `1.` / `2.` → 主項目
  - `1-1` / `2-2` → 次項目
  - 並帶入名稱、數量、單位、金額、備註

### 重要提醒
本次快速盤點 repo 時，**尚未直接重新驗證 CSV 匯入功能是否仍存在於目前 HEAD**。  
後續 agent 若要接匯入功能，請先實際搜尋並驗證對應實作仍在不在。

---

## 9. 目前尚未完成 / 明顯缺少的部分

### 9.1 真正的資料持久化
目前大多數內容仍是：
- 假資料
- component local state
- 頁面內前端互動

尚未確認完成：
- 真實資料庫
- API route / server action 持久化
- 專案 CRUD 落地
- execution tree / requirement / assignment 真正儲存

### 9.2 前端共享狀態架構
使用者有提過「前端共享狀態」這個概念，但：

- 記錄中沒有保留完整討論結論
- 目前 repo 快速盤點 **沒有明顯看到 Zustand / React Context 全域 store 已落地**
- 現況比較像是 **各頁各自維護 local state**

所以後續 agent 不要預設這塊已做完。

### 9.3 後端資料模型
先前建議方向是：
- Prisma + PostgreSQL

但目前尚未看到已真正串接完成。

### 9.4 權限 / 登入
README 的下一步提到登入與權限管理，但目前應尚未落地。

---

## 10. 後續 agent 接手時的建議工作順序

### 如果使用者要繼續做前端驗收 / 快速改版
優先順序：
1. 先跑起來看目前畫面
2. 對照 repo 現況確認哪些互動仍可用
3. 修使用者眼前正在挑的 UI/UX 問題
4. 小步提交，讓使用者快速驗收

### 如果使用者要開始做資料落地
建議順序：
1. 先盤點目前前端資料模型
2. 定義 Project / Requirement / ExecutionItem / ExecutionSubItem / Assignment / Reply schema
3. 再決定 Prisma + PostgreSQL 的落地方式
4. 先把最核心的專案詳細頁資料流打通

### 如果使用者要做「共享狀態」
建議先釐清是以下哪一種：
1. 專案資料跨頁共用
2. execution tree 與設計任務頁狀態同步
3. 交辦表單暫存共享
4. 全站 store 重構（例如 Zustand）

因為目前 repo 並沒有明確顯示這塊已經完成。

---

## 11. 後續 agent 啟動時，建議先檢查的檔案

接手後優先讀：

1. `README.md`
2. `src/components/project-data.ts`
3. `src/components/project-detail-shell.tsx`
4. `src/components/execution-tree.tsx`
5. `src/components/execution-tree-section.tsx`
6. `src/components/requirements-panel.tsx`
7. `src/app/design-tasks/page.tsx`
8. `src/components/design-task-data.ts`

如果使用者提到匯入，再額外找：
- execution tree import / csv import / upload 相關實作

---

## 12. 可直接給下一個 agent 的接手摘要

你現在接的是 `projectflow`，一個 **以專案為核心的專案營運管理系統 MVP**。  
技術棧是 **Next.js 16 + React 19 + TypeScript + Tailwind 4**。  
使用者要求 **全程繁體中文**，而且偏好 **先做可視、可驗收的前端**。

目前系統核心不是傳統獨立交辦頁，而是：

**專案詳細頁 → 專案執行項目 → 次項目 → 交辦**

左側命名方向已調整為：
- 設計任務版
- 備品採購版

需求溝通已內嵌進專案頁。  
目前 repo 已有大量前端互動：
- 專案列表
- 專案詳細頁
- 需求溝通紀錄
- 執行項目 / 子項目互動
- 設計 / 採購 / 廠商交辦 draft
- 交辦後的 reply / 巢狀回覆互動
- 設計任務頁與專案頁互動逐步對齊

**但多數資料仍是假資料 + local state，尚未真正後端落地。**

如果使用者要你繼續做：
- UI 就直接改畫面、改互動、快速驗收
- 狀態同步 / 共享狀態先別假設已完成，先重新盤點
- 後端就從 Project / Execution / Assignment / Reply schema 開始

---

## 13. 本文件目的

這份 `MD1-projectflow-handover.md` 的目的是：

- 讓後續 agent **不用再重新聽一次整包背景**
- 直接依 repo 與既有脈絡接手
- 避免重走錯的資訊架構
- 避免把已收斂好的交辦流程再做回舊版

如後續專案再推進，請持續覆寫或補充本文件。
