# MD15 - projectflow repo audit 總表 v1（2026-04-04）

> 用途：這份文件是以 **目前 repo 真實落地狀態** 為基礎的盤點總表。
> 與單純依靠母檔 / handoff 的進度判斷不同，本檔重點是：
> - 目前 repo 已有哪些 routes / components / stores
> - 哪些主線已達可驗收
> - 哪些東西已存在但尚未封板
> - repo 現階段暴露出的 MVP 邊界是什麼
> - 中期尚未正式展開的題目有哪些
>
> 適用情境：
> - 當使用者問「現在 repo 真的做到哪」
> - 當需要區分「已落地」與「只存在於規格」
> - 當要規劃下一階段驗收、封板或中期資料層工作時
>
> 高階產品規格仍以：
> - `MD-MASTER-projectflow-system-source-of-truth.md`
> - `MD14-projectflow-progress-review-and-next-step-handoff-2026-04-04.md`
> 為準。
>
> 本檔角色：
> **repo audit 視角的現況總表**。

---

# 1. 一句話總結

`projectflow` 目前已經是：

> **可驗收的 MVP 系統，不是 demo 骨架；但仍未完成正式產品化。**

若拆成三個層次判斷：
- **產品架構完整度：85% 左右**
- **repo 實作完整度：78%～83%**
- **正式產品化程度：55%～65%**

核心原因不是產品主線不清楚，而是：
- repo 已有多條 shared store 與主線頁
- 但仍建立在 **mock + localStorage + fallback seed** 的過渡態
- 主線大多已接通第一版
- 尚未進正式資料層 / 唯一身份模型 / 文件正式化

---

# 2. 本次 audit 實際盤到的 repo 範圍

## 2.1 主要 routes（目前存在）
- `/`
- `/projects`
- `/projects/new`
- `/projects/[id]`
- `/design-tasks`
- `/procurement-tasks`
- `/quote-costs`
- `/quote-costs/[id]`
- `/quote-cost`
- `/quote-cost/[id]`
- `/closeouts`
- `/closeouts/[id]`
- `/closeout`
- `/closeout/[id]`
- `/vendors`
- `/vendors/[id]`
- `/vendor-packages`
- `/vendor-packages/[id]`
- `/vendor-assignments`
- `/vendor-assignments/[id]`

## 2.2 audit 時看到的核心 components / stores
- `project-detail-shell.tsx`
- `execution-tree-section.tsx`
- `project-vendor-section.tsx`
- `project-workflow-store.ts`
- `quote-cost-data.ts`
- `quote-cost-list-client.tsx`
- `quote-cost-detail-client.tsx`
- `closeout-list-client.tsx`
- `vendor-store.tsx`
- `project-vendor-financial-store.ts`
- `vendor-list-page.tsx`
- `vendor-detail-shell.tsx`
- `vendor-package-store.ts`
- `vendor-package-detail.tsx`
- `vendor-package-detail-route.tsx`
- `vendor-assignment-overview.tsx`
- `vendor-assignment-detail.tsx`

## 2.3 audit 時參考的最近關鍵 commits
- `997d2a6` — `docs: record vendor financial bridge progress`
- `9b1683f` — `feat: bridge vendor financial data with quote costs`
- `7f3c2f1` — `feat: prioritize workflow task boards by action order`
- `ecf3693` — `fix: polish workflow board empty states`
- `d8d6c44` — `fix: align procurement board document status with project flow`
- `b12c022` — `fix: refresh workflow boards on local state changes`
- `deb8868` — `refactor: demote unspecified vendor costs in quote detail`
- `c8e2698` — `feat: deep-link workflow boards into project detail`
- `5207ac4` — `feat: persist quote cost workflow state`
- `5a8a24f` — `docs: update MD14 with vendor trade management`
- `19a1129` — `docs: record vendor trade management rules`

---

# 3. 已完成到可驗收的部分

這一區的意思不是「已經完美封板」，而是：

> **產品主線與 repo 實作都已存在，足以進正式驗收。**

## 3.1 Project 主體
### 範圍
- `/projects`
- `/projects/[id]`
- `Project Detail`

### repo 判斷
- 主控台定位穩定
- 專案列表、專案詳情、execution tree、任務檢視與導流關係已成形
- 這塊已是整套系統穩定主體

### 狀態
- **可驗收**
- **接近封板，但仍可有小幅成熟度微調**

## 3.2 Quote-cost / Closeouts
### 範圍
- `/quote-costs`
- `/quote-costs/[id]`
- `/closeouts`
- `/closeouts/[id]`

### repo 判斷
- 成本主線、調整後成本、對帳、結案、列表與單案頁都已存在
- localStorage shared state 已開始取代單頁暫時 state
- 已與 vendors 做第一版財務承接
- `quote-cost-data.ts` 已是相對完整的本地資料模型

### 狀態
- **可驗收**
- **目前是 repo 裡最成熟的模組之一**

## 3.3 Vendor Flow 主結構
### 範圍
- Project Detail 內 vendor 區
- `/vendor-packages`
- `/vendor-packages/[id]`
- `/vendor-assignments`
- `/vendor-assignments/[id]`

### repo 判斷
- pre-issue / post-issue / final document 結構清楚
- package route、store、detail 頁皆存在
- 已不是概念稿，而是可操作流程

### 狀態
- **可驗收**
- **主流程不應再重開討論**

## 3.4 Vendors 基礎能力
### 範圍
- `/vendors`
- `/vendors/[id]`
- `vendor-store`
- 工種管理
- 未付款 / 歷史往來
- 財務承接第一版

### repo 判斷
- vendor list / detail 已存在且功能完整度不低
- quick create、編輯、刪除、工種治理、未付款管理都已具備
- 已開始承接 quote-cost / closeout 的財務 relation

### 狀態
- **可驗收**
- **但成熟度仍低於 Project / Quote-cost 主線**

---

# 4. 已存在，但尚未封板的部分

這一區不是沒做，而是：

> **產品方向已清楚，repo 也已有實作，但還沒到完全收尾。**

## 4.1 設計線
### 範圍
- `/design-tasks`
- Project Detail 內設計任務 / 回覆 / 整理 / 文件

### repo 判斷
- 已有流程閉環
- confirmed reply 已可承接成本
- board 已開始吃 workflow 主線

### 未封板原因
- 工作台成熟度仍在第一輪
- 文件整理層與文件輸出頁仍偏 MVP
- 跨專案掃描效率與卡片密度仍可再收

## 4.2 備品線
### 範圍
- `/procurement-tasks`
- Project Detail 內備品流程

### repo 判斷
- 已有第一輪閉環
- confirmed reply → cost 已接通
- 工作台心智與設計線逐步對齊

### 未封板原因
- 同樣仍是第一輪成熟度
- 工作台、整理頁、文件頁還有收尾空間

## 4.3 Vendors 模組最終成熟度
### repo 判斷
- 現在 vendors 已經不是功能不足，而是成熟度待驗收
- 尤其是：
  - vendor list 是否足夠像高密度管理台
  - vendor detail 主次是否完全穩定
  - 財務承接後是否仍有殘留 seed / mock 感

### 未封板原因
- 已不是結構問題
- 是正式驗收與最後 UI/UX 收尾問題

## 4.4 Vendor package / assignment 細節成熟度
### repo 判斷
- 主流程已穩
- 但 package detail、assignment detail、文件預覽成熟度仍可再收

### 未封板原因
- 細節成熟度與長資料量情境仍待驗收

---

# 5. repo 已暴露的 MVP 邊界

這一區不是缺點，而是 repo 已明確顯示：

> **系統仍處在「共享主線開始建立，但仍是 MVP 過渡態」**

## 5.1 多個 localStorage / shared store 並存
目前 repo 裡可看到多條資料線：
- workflow store
- vendors store
- vendor trades store
- quote-cost storage
- vendor financial relation store
- vendor package store

### 意思
- 主線已開始共享
- 但還不是單一正式資料層

## 5.2 seed / fallback 仍存在
repo 仍保留：
- `quoteCostProjects`
- `vendorProjectRecords`
- `vendorPackages`
- board seed data

### 意思
- 現在是 shared data 與 fallback seed 共存
- 還沒完全轉成唯一資料源

## 5.3 vendor identity 仍未完全正式對齊
這是 repo audit 很明顯看到的點。

在共享 financial relation 裡，仍有：
- vendorName fallback
- 名稱轉 id 的兼容邏輯
- `vendor-name:xxx` 這種過渡型 key 心智

### 意思
- 現在關聯已能運作
- 但還不是全系統統一 identity model

## 5.4 文件仍偏 MVP 生成心智
雖然三條線都已有文件主線，但目前仍偏：
- 頁面內生成
- 狀態 badge
- 本地資料承接

### 尚未到的層次
- 正式匯出標準
- 正式檔案保存
- 正式版本治理

---

# 6. 尚未正式討論完的中期題

這些不是「還沒做完 UI」，而是：

> **其實還沒真正展開成正式產品規格。**

## 6.1 正式資料層 / 唯一資料模型
這是最大題。

目前 repo 顯示你已經有：
- workflow data
- quote-cost project
- vendor store
- project-vendor relation
- package store

但還沒有：
- 全系統統一正式 schema
- 單一 persistence 層
- 明確 migration 策略

## 6.2 vendor identity 正式化
目前系統已開始需要它，但還沒完全解決：
- vendors 主檔 id
- quote-cost 裡的 vendor 關聯
- package / assignment / cost item 的 vendor 關聯
- 所有流程裡的同一實體識別

## 6.3 文件正式化
還沒完全討論到：
- 匯出格式
- 檔案保存策略
- route / link / copy / print 邏輯
- 單一有效版本如何正式治理

## 6.4 Excel 報價匯入正式規格
方向有了，但還沒完全產品化：
- 欄位 schema
- 驗證規則
- 錯誤處理
- 覆蓋流程
- 匯入後檢查機制

## 6.5 付款管理更深層模型
目前只做到：
- `專案 × 廠商`
- 未付款 / 已付款

還沒展開：
- 分批付款
- 付款日期
- 匯款資訊對帳
- 付款流水
- 帳款歷史

## 6.6 權限 / 多使用者 / 稽核
repo 幾乎看不出正式討論痕跡：
- 權限角色
- 協作衝突
- 操作歷史
- 回復 / restore
- audit trail

目前仍是單人 MVP 心智。

---

# 7. 建議下一步排序

## 7.1 第一優先：正式驗收
建議優先驗：
1. `/projects`
2. `/projects/[id]`
3. `/design-tasks`
4. `/procurement-tasks`
5. `/vendor-packages`
6. `/vendors`
7. `/vendors/[id]`
8. `/quote-costs/[id]`
9. `/closeouts`

### 原因
- 目前最大的風險已不是需求不清楚
- 而是哪些真的過關、哪些只是還沒被點到

## 7.2 第二優先：封板尚未封板的工作台 / vendor 頁
若驗收後再修，優先應是：
1. `design-tasks`
2. `procurement-tasks`
3. `vendors`
4. `vendor-packages`

### 原因
- 這些是目前最像「主線已成立，但成熟度還沒完全收乾淨」的地方

## 7.3 第三優先：開中期規格題
等驗收後，再決定是否正式展開：
1. 正式資料層
2. vendor identity 全系統對齊
3. 文件正式化
4. Excel 匯入正式規格
5. 付款管理深化

---

# 8. 最終判斷

## 8.1 這套系統現在是什麼
- **不是 demo**
- **不是空殼**
- **不是只有零散頁面**
- 已經是有主線、有資料承接、有模組關係的 MVP 系統

## 8.2 但它還不是什麼
- 還不是正式產品化完成
- 還不是正式資料層完成版
- 還不是多使用者 / 稽核級系統

## 8.3 一句話結論
> `projectflow` 現在已經完整到足以進正式驗收；未完成的主體不是功能空白，而是「尚未封板的成熟度」與「尚未正式化的資料層 / 身份模型 / 文件規格」。
