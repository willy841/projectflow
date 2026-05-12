# MD-GOVERNANCE — projectflow 測試站 / 正式站 / 內容隔離治理規則 — 2026-05-12

Status: active
Priority: high
Scope: `projectflow` only

## 1. 目的

本文件用來正式定義 `projectflow` 的三件事：

1. 測試站與正式站的治理邊界
2. 正式站升版流程
3. `projectflow` 專屬內容與其他一般對談內容之間的隔離規則

這份文件只屬於 `projectflow`。
不可把它的內容、規則、母檔、handoff、歷史治理脈絡，無差別污染到其他非 `projectflow` 的對談或任務。

---

## 2. 核心高優先級規則

### 規則 A — GitHub `main` 永遠屬於測試站

從 2026-05-12 起：

> **GitHub `main` = `projectflow` 測試站主線**

它不是正式站主線。
不可把 `main` 的當前狀態直接等同於正式站狀態。

### 規則 B — 任何變更先進測試站

任何新的 `projectflow` 變更，必須先：
1. 進 GitHub `main`
2. 在測試站驗證
3. 驗證通過後，整理成正式站候選變更
4. 最後才部署到正式站

### 規則 C — 正式站只吃「已驗證、已整理、已批准」的變更

正式站不可無差別吃下整條測試站當前狀態。

正式站升版前，至少必須明確整理：
- 變更檔案清單
- schema / migration 變更
- runtime / env 變更
- 風險與驗證結果

### 規則 D — `projectflow` 內容不得污染非專案系統對談

所有屬於 `projectflow` 的：
- 母檔
- MD 檔
- handoff
- 治理文件
- deploy / runtime / DB / acceptance / production 脈絡

都屬於 **`projectflow` 專屬上下文**。

這些內容：
- **只有在討論 `projectflow` 時才可主動載入**
- **不可在其他主題對談中預設帶入**
- **不可把 `projectflow` 的治理脈絡當成一般全域規則**

---

## 3. 測試站與正式站的角色定義

### 測試站

用途：
- 承接 GitHub `main`
- 驗證新修改
- 驗功能、驗流程、驗 schema 變更、驗 runtime 行為

特性：
- 是變更先行區
- 是驗證主線
- 可以承接尚未正式上線的修改

### 正式站

用途：
- 提供正式入口與正式使用
- 只承接已整理且已批准的候選變更

特性：
- 不是 `main` 的鏡像
- 不是測試站即時同步副本
- 是一個受治理的部署目標

---

## 4. 正式站升版標準流程

### Phase 1 — 測試站完成驗證
- 修改先進 GitHub `main`
- 在測試站完成驗證

### Phase 2 — 正式站候選整理
在升版到正式站前，必須整理：
1. 本次變更檔案
2. 需要的 migration / schema 變更
3. runtime / env 變更
4. 驗證結果
5. 明確風險

### Phase 3 — 正式站部署
- 只部署已整理、已核准的變更
- 不可把「準備升版」講成「已升版」
- 不可把本機 code 已改講成正式站已更新

### Phase 4 — 正式站驗證
至少驗：
- 公開入口
- login
- 核心頁面
- DB schema 與 runtime 是否對齊

---

## 5. `projectflow` 專屬內容封裝規則

`projectflow` 的文件集合不應散成一般對談雜訊，而應被視為一個專屬封裝領域。

### 屬於 `projectflow` 專屬封裝的內容包括：
- `MD-MASTER-projectflow-*`
- `MD-INDEX-projectflow-*`
- `MD-SUMMARY-projectflow-*`
- `MD-HANDOFF-*projectflow*`
- `project-mgmt/docs/*projectflow*`
- 與 `projectflow` deployment / runtime / DB / acceptance / production 直接相關的規則文件

### 封裝規則
1. 討論 `projectflow` 時，才載入這套內容
2. 非 `projectflow` 任務，不主動讀取這整包治理脈絡
3. 若未來建立專屬索引 / 打包入口，應以那個入口作為最小載入面
4. `projectflow` 歷史脈絡與其他一般個人助理對談，必須分隔

---

## 6. 對未來對談的行為要求

未來只要任務不是 `projectflow`：
- 不應主動帶入 `projectflow` 的 deploy / DB / schema /治理脈絡
- 不應把 `projectflow` 規則當成全域規則
- 不應讓大量 `projectflow` 文件佔據一般對談上下文

未來只要任務是 `projectflow`：
- 應先走 `projectflow` 專屬入口文件
- 應明確區分目前在談：
  - 測試站
  - 正式站
  - 候選升版
  - 歷史資料

---

## 7. 当前已知正式事实

截至 2026-05-12：
- `projectflow` 已有正式站對外入口
- `pmis.kuya.tw` 已建立並可對外使用
- 目前正式站與測試站不得再混為同一條主線
- `projects.owner` live 缺欄事故已證明：
  - live schema / repo migration / 正式站升版流程 必須受治理

---

## 8. 一句話總結

> **`projectflow` 從現在開始採雙軌治理：GitHub `main` 永遠屬於測試站；正式站只吃經過測試站驗證、變更整理、明確批准後的候選變更。所有 `projectflow` 相關母檔、MD 檔、handoff 與治理內容，都必須被封裝為專屬上下文，不得污染其他非 `projectflow` 對談。**
