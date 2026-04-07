# MD34 - projectflow 系統整體進度盤點與下階段主線地圖（2026-04-07）

> 目的：整理 `projectflow` 截至 2026-04-07 的整體系統完成度、模組位置、正式可用範圍、主要風險與下階段建議優先序，作為後續續接與主線判斷依據。
>
> 本檔不是單頁 handoff，而是整體架構盤點文件。若之後要判斷系統目前做到哪、哪些屬於已穩定主體、哪些屬於下游待建主線，應優先參考本檔。

---

# 1. 整體系統一句話判斷

截至目前為止，`projectflow` 的整體狀態可正式收斂為：

> **上游專案主檔與執行流 phase 1 已可用，且 `MD29 phase 1` 已驗收通過；下游帳務中心 / 結案紀錄 / Closeout domain 已有明確主線 spec，但尚未完成正式資料閉環。**

換句話說：
- 已經不是只剩前端草稿或零散 demo
- 但也還不是全域收口完成的正式系統
- 目前系統正處於：
  - **上游骨架已站穩**
  - **下游財務與 closeout 主線待落地**
  的階段

---

# 2. 系統模組地圖

目前 `projectflow` 可拆成以下七個核心層：

1. Project Master（專案主檔）
2. Execution / Responsibility Flow（執行項目與責任流）
3. Design / Procurement / Vendor Task Operations（三條作業流）
4. Quotation / Cost / Financial Base（報價與成本基底）
5. Accounting Center（帳務中心）
6. Closeout / 結案紀錄 Domain
7. DB-first Architecture（正式資料化與一致性）

---

# 3. 各模組完成度盤點

## 3.1 Project Master（專案主檔）

### 範圍
- `/projects`
- `/projects/[id]`
- `/projects/new`

### 完成度判斷
> **高**

### 已完成
- 專案列表可正式使用
- 專案新增可正式寫入 DB
- 專案 detail 可正式讀 DB
- 專案可刪除
- 刪除前需手動輸入專案名稱
- 客戶資料與活動資訊已可正式編輯與儲存
- `projects` table 已補：
  - `event_type`
  - `contact_name`
  - `contact_phone`
  - `contact_email`
  - `contact_line`

### 近期重要工程成果
- 已完成 DB-backed project delete flow
- 已完成 `project detail` 正式編輯儲存
- 已修正 project delete 的 route cache 殘影
- 已修正 detail 儲存後被舊 props 回蓋
- 已修正活動日期只顯示日期、不顯示 ISO 時間尾巴

### 判斷
這一層已可視為：
> **正式主檔層已站穩**

---

## 3.2 Execution / Responsibility Flow（執行項目與責任流）

### 範圍
- `Project Detail` 內 `ExecutionTreeSection`
- execution items
- 三線 upstream dispatch

### 完成度判斷
> **高**

### 已完成
- execution tree 主骨架可運作
- upstream dispatch 已回到原本已驗過的 `ExecutionTreeSection / ExecutionTree`
- `MD29 phase 1` 已驗收通過
- 三線（設計 / 備品 / 廠商）可從 upstream 正式交辦

### 重要已知規則
- 不可在 `ExecutionTreeSection` 再做 assignment payload 重組
- 不可再把 `replyOverrides` 注回 assignment `data.replies`
- 若後續要合併資料，需經單一資料源或明確 adapter / selector，不可在 section callback 層硬 merge

### 判斷
這一層是：
> **系統目前最穩的核心骨幹之一**

---

## 3.3 Design / Procurement / Vendor Task Operations（三條作業流）

### 範圍
- `/design-tasks`
- `/procurement-tasks`
- `/vendor-assignments`
- 各 detail / plans / confirm / replace / sync APIs

### 完成度判斷
> **中高**

### 已完成
- 三條 flow 都已有頁面與 detail
- 已有 plans / replace-plans / sync-plans / confirm API
- confirmation / 文件承接結構已存在
- 設計線 / 備品線 / vendor 線都已能承接 upstream

### 目前狀態
- 這三條線不是空殼
- 但不同線的成熟度與驗收完成度不完全一致
- 與 financial / closeout 的正式閉環尚未全部完成

### 判斷
這一層是：
> **可運作，但仍屬需要產品化收口的作業流層**

---

## 3.4 Quotation / Cost / Financial Base（報價與成本基底）

### 範圍
- `/quote-cost`
- `/quote-costs`
- financial adapters
- manual cost sync

### 完成度判斷
> **中**

### 已完成
- quote-cost / quote-costs 路由與 detail 主體已存在
- financial adapter 已存在
- manual cost sync 已存在
- 成本資料基底已開始走正式資料源

### 目前狀態
- 這一層已具備財務資料基底
- 但還不是完整的正式帳務中心
- 對帳、收款、結案條件與 closeout 承接還在下一階段主線內

### 判斷
這一層目前應理解為：
> **Financial base 已建立，但未完成 domain 收口**

---

## 3.5 Accounting Center（帳務中心）

### 範圍
- `/accounting-center`
- 帳務摘要 / 收款 / 對帳 / 月份視角

### 完成度判斷
> **低到中**

### 已有
- 路由存在
- financial base 可作為資料承接前提
- `MD28` 已將對帳 / 收款 / 結案條件整理成正式規則

### 尚缺
- 帳務中心完整 IA
- 對帳視角頁面
- 收款狀態與金額主視覺
- 專案級帳務工作台
- 與首頁帳務摘要的正式入口關係

### 判斷
這一層是：
> **domain 已定義，但實作仍待正式落地**

---

## 3.6 Closeout / 結案紀錄 Domain

### 範圍
- `/closeout`
- `/closeouts`
- 結案紀錄 list / detail

### 完成度判斷
> **低到中**

### 已有
- closeout / closeouts 路由存在
- list / detail 頁殼存在
- `MD31` 已定義結案紀錄 list / detail 的正式規格

### 尚缺
- 以專案為主體的正式結案紀錄 list 落地
- 年份篩選正式化
- detail 唯讀歷史庫內容承接
- 三條線文件區列表記錄承接
- 與 financial closeout 的正式交棒流程

### 判斷
這一層是：
> **目前最明確的下游主戰場之一**

---

## 3.7 DB-first Architecture（正式資料化與一致性）

### 範圍
- phase1 repositories
- adapters
- DB mode / mock mode 切換
- route dynamic / cache control

### 完成度判斷
> **中**

### 已完成
- `/projects` 已 DB only
- `/projects/[id]` 已 DB only
- project delete / project edit 已走正式 DB
- project routes 已改 `force-dynamic`
- `projects` schema 已新增 contact / eventType 欄位 migration

### 仍需持續盤點
- 其他頁面是否仍有 mock / seed fallback
- 首頁與下游頁面是否已完全 DB-first
- financial / closeout 是否仍有過渡層混合資料源

### 判斷
這一層是：
> **正在從混合 prototype 走向正式資料系統**

---

# 4. 已驗收 / 已穩定 / 待建主線總表

## 4.1 已驗收或已穩定可用
- `MD29 upstream phase 1`
- 專案新增（正式寫 DB）
- 專案列表
- 專案 detail
- 專案刪除（名稱確認 + 正式 DB delete）
- 客戶資料 / 活動資訊正式編輯儲存
- execution tree 主骨架

## 4.2 已有主體，但仍需收口
- 設計作業流
- 備品作業流
- vendor 作業流
- quote-cost / financial base
- vendor package / 文件層主線

## 4.3 主線已定，但尚未正式落地完成
- 帳務中心（Accounting Center）
- 結案紀錄 list / detail
- Financial closeout loop
- closeout archive domain
- project → accounting → closeout 的完整閉環

---

# 5. 目前重大成果摘要

## 5.1 `MD29` upstream phase 1 已驗收通過
這代表：
- 專案建立 → DB 寫入 → 進 `Project Detail` → upstream dispatch 三線
  這條主線已不再只是文件規劃
- 上游主體可以視為正式進入下一階段

## 5.2 Project Master 已跨過 prototype 階段
目前 project master 層已具備：
- 正式建立
- 正式刪除
- 正式編輯
- 正式 detail
- 正式 DB mode

這代表它已不是「示意主檔」，而是系統穩定底座。

## 5.3 DB-first 收斂已開始成形
目前已知最明確的收斂包括：
- project routes DB-only
- project routes force-dynamic
- project schema 補 contact / event fields
- project delete / edit 都已走正式 DB 路徑

---

# 6. 目前主要風險

## 6.1 下游 domain 尚未真正閉環
目前最大風險不在專案主檔，而在於：
- 帳務中心
- 結案紀錄
- financial closeout
- closeout archive

還沒有正式落成一條完整閉環。

## 6.2 系統可能仍殘留混合資料源
雖然 project master 已大幅收斂，但整個 repo 不一定已完全 DB-first。
這表示：
- 某些頁面仍可能混用 mock / seed
- 某些 adapter 仍可能保留 fallback
- 下游頁面還需要整體盤清

## 6.3 closeout 與 financial 之間仍缺正式交棒規則落地
目前 spec 已定，但系統尚未真正執行：
- 哪些條件滿足才允許結案
- 結案後資料凍結到哪個層級
- closeout detail 要承接哪些最終資料

---

# 7. 下一階段正式優先順序

## Priority 1：帳務中心 domain 落地
需要先正式完成：
- 對帳主視角
- 收款狀態與金額
- 本月已收 / 未收
- 專案帳務明細
- 與首頁摘要的角色分工

## Priority 2：Closeout record list / detail 落地
需要把 `MD31` 實作成正式系統：
- 以 project 為主體的 closeout list
- 年份篩選
- 唯讀 detail
- 活動資訊 + 三線文件結果 + 最終報價 / 實際成本

## Priority 3：定義 project → accounting → closeout 的交棒規則
需明確落地：
- 何時可結案
- 結案後哪些資料凍結
- 哪些頁面變唯讀 archive
- 哪些資料可補記

## Priority 4：全系統 DB-first 一致性回查
在下游正式開工前後，都應再做一輪：
- 哪些頁仍讀 mock
- 哪些 adapter 仍有 fallback
- 哪些 route 需 dynamic / revalidate 控制

---

# 8. 目前整體進度的管理判斷

若用較高層產品進度判斷，目前可大致估為：

## 上游專案主體
> **約 75% 完成**

原因：
- 主檔層已站穩
- upstream dispatch 已驗收
- execution tree 主骨架穩定

## 下游 financial / closeout 主線
> **約 30% 完成**

原因：
- spec 已明確
- 部分頁殼 / 路由已存在
- 但正式資料閉環尚未落地

## 全系統正式收口度
> **約 50% 左右**

原因：
- 已跨過 prototype 階段
- 但離完整 production-grade 系統仍有明顯差距

---

# 9. 正式結論

目前 `projectflow` 最正確的戰略位置，不是再做零碎補洞，而是：

> **上游骨架已站穩，應開始把下游帳務中心與 Closeout domain 做成真正的資料閉環。**

因此後續若要續接主線，應以：
1. 帳務中心
2. Closeout record list / detail
3. Financial closeout loop
4. DB-first 全域一致性

作為正式下階段主軸。
