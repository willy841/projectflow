# MD-MASTER - projectflow System Source of Truth

> 目的：這份文件是 `projectflow` 目前唯一的高階總控母檔（source of truth）。
> 之後新的對話 / 新的 agent / 新的交接，應優先閱讀本文件；**不可再直接從很早期的 handoff（例如 `MD21` / `MD22`）當成主要續接入口。**

---

## 0. 2026-05-09 新增：GitHub main 驗收安全回退點

- 2026-05-09 已在 `project-mgmt` 建立一個可安全回退的全量版本封存點，用於後續 Vendor Detail 性能實驗前的基線保護。
- 這個安全點的定義是：
  - `npm run test:formal-acceptance:v2` → `23 / 23 passed`
  - `npm run test:formal-acceptance:full` → `49 / 49 passed`
- 對應封存 commit：`SAFE_FULL_GREEN_BASELINE_COMMIT = c1db1ca`
- 用途：
  1. 作為後續 Vendor Detail summary-only path / 性能實驗的可退回點
  2. 若後續性能改動破壞 correctness，必須可直接回退到這個安全點
  3. 之後任何實驗性優化，不可把這個安全點與實驗中工作樹混在一起
- 2026-05-09 性能盤點結論（供未來續接）：
  - Vendor Detail 遠端性能小刀型優化已試過：
    - 拿掉首屏 package summary fanout
    - 去掉 payment records 重複 vendor lookup
  - 結果：只有小幅或不穩定收益，未證明是主瓶頸。
  - 目前較可信的判斷是：Vendor Detail 首屏真正瓶頸在 `getVendorFinancialSummary()` 這條完整聚合鏈，而不是外圍小查詢。
  - 未來若要再優化，建議走 **方案 A**：新增 `/vendors/[id]` 首屏 open unpaid 專用的 summary-only path，僅輸出首屏必要欄位；不要先直接重構整個 `getVendorFinancialSummary()` 本體。
  - 這條未來優化線在動刀前，必須先以 `c1db1ca` 安全回退點為基線，並至少回歸驗證：`07`、`09`、`10`、`11`、`28`、`29`。

## 0. 2026-04-26 起的最新補充（Phase 1 技術收尾 / 正式站前主線）

### 2026-05-05 新增：全站驗收體系 / cross-page consistency / source-of-truth 正式入口

若續接重點是以下任一項：
- `projectflow` 全站到底要怎麼驗，不只是單頁 clickpath
- source-of-truth / cross-page consistency / downstream lifecycle 要如何制度化
- 為什麼最近同型 bug 會一直出現在 owner / assignee / project list financial / reconciliation / vendor unpaid
- 第一輪正式 regression packs 做到哪裡

則除本母檔外，必須納入：

1. `MD171-projectflow-whole-system-acceptance-framework-source-of-truth-and-cross-page-consistency-matrix-2026-05-05.md`
2. `MD172-projectflow-source-of-truth-test-gap-matrix-2026-05-05.md`
3. `MD173-projectflow-cross-page-consistency-regression-pack-spec-2026-05-05.md`

補充規則：
- A~H packs 已正式落地為 `tests/formal-acceptance-v2/25~32`
- 並已正式納入：
  - `npm run test:formal-acceptance:v2`
  - `npm run test:formal-acceptance:full`
- 這代表 acceptance 主入口已不再只驗 mainline clickpath，也開始正式驗：
  - 欄位級 readback
  - project/detail/list/home 一致性
  - financial source-of-truth list sync
  - reconciliation amount completeness
  - vendor unpaid lifecycle
  - closeout active/archive consistency

### 2026-04-26 新增：前端美化 / 視覺統一標準入口

若續接重點是以下任一項：
- `Project Detail` dark-glass 視覺重建後的全站風格統一
- list page / overview page / task board / vendor / quote-cost 的視覺對齊
- header 外框移除、卡片材質、表格 dark glass、按鈕/ badge / pill 規則
- 後續前端美化不想再每頁重談，而要直接依已批准標準執行

則除本母檔外，必須納入：

1. `project-mgmt/docs/projectflow-visual-style-standard-from-project-detail-2026-04-26.md`

用途：
- 這份文件是目前 `projectflow` **前端美化標準** 的正式入口
- 來源基準是已被使用者接受的 `Project Detail` 視覺方向
- 後續其他頁面應以此作為統一標準，而不是再各自 patch 或回頭參照舊白底頁面


若續接重點是以下任一項：
- Phase 1 技術性收尾完成度
- runtime / env / acceptance-deploy separation 收尾
- closeout retained read 的 snapshot-only 收斂結果
- clean-start 正式站前提下的資料治理紀律
- 正式站前還剩哪些真正技術尾巴

則不可只停在 `MD155` / `MD156` / `MD157`，而必須額外納入以下新入口鏈：

1. `MD164-projectflow-acceptance-data-governance-and-pre-production-read-order-index-2026-04-26.md`
2. `project-mgmt/docs/projectflow-phase1-technical-tail-closure-summary-2026-04-26.md`
3. `MD163-projectflow-current-maturity-and-next-step-management-summary-2026-04-26.md`
4. `MD161-projectflow-technical-stability-tail-audit-and-next-actions-draft-2026-04-26.md`
5. `MD162-projectflow-pre-production-migration-technical-risk-list-v1-2026-04-26.md`

補充規則：
- 若問題是「這一輪技術收尾到底做到哪？」→ 先看 `projectflow-phase1-technical-tail-closure-summary-2026-04-26.md`
- 若問題是「closeout retained snapshot-only 現在已經做到什麼程度？」→ 再看：
  - `projectflow-closeout-retained-snapshot-fallback-strategy-2026-04-26.md`
  - `projectflow-pre-production-retained-snapshot-decision-memo-2026-04-26.md`
- 若問題是「正式站不帶舊資料後，剩下的技術治理姿勢是什麼？」→ 以 `MD162` + `MD163` 為準

## 1. 2026-04-24 起的強制續接規則（最新）

**若要續接現在的 `projectflow` 主線，閱讀順序必須先以最新主線文件為主，不可再從早期 MD 直接起手。**

### 最新主線第一入口（必讀）
1. `MD-MASTER-projectflow-system-source-of-truth.md`
2. `MD155-projectflow-single-track-acceptance-first-and-production-freeze-rule-2026-04-20.md`
3. `MD156-projectflow-project-document-routing-and-dispatch-trade-linkage-rules-2026-04-24.md`
4. `MD157-projectflow-vendor-financial-source-formalization-and-vendor-detail-performance-investigation-2026-04-24.md`

### 第二層：仍可能需要的近代主線 closure（按需回查）
4. `MD134-projectflow-post-md133-project-detail-dispatch-and-ui-closure-2026-04-14.md`
5. `MD136-projectflow-product-guardrails-and-formalization-rules-2026-04-15.md`
6. `MD137-projectflow-guardrails-round1-implementation-closure-2026-04-15.md`

### 明確降級為歷史背景，不可再當主要續接入口
- `MD20`
- `MD21`
- `MD22`
- `MD23`
- `MD24`
- `MD25`
- `MD26`

這批早期文件仍可在以下情況**回查**：
- 需要核對最早產品語意來源
- 需要追 root rationale
- 需要確認某條規則最初是怎麼被定下來的

但正式規則是：

> **不可再把 `MD21` / `MD22` 這類早期檔案當成新 session 的主要入口。**

---

## 2. 2026-04-24 最新補充（當前驗收站主線必對齊）

- 已新增：`MD156-projectflow-project-document-routing-and-dispatch-trade-linkage-rules-2026-04-24.md`
- 本文件的重要性在於正式校正三條目前仍容易被舊 handoff 誤導的規則：
  1. **設計 / 備品 `全部確認` 後，正式出口一律直接導向 project-level document**
     - 設計：`/projects/[projectId]/design-document`
     - 備品：`/projects/[projectId]/procurement-document`
     - `task-level document` 不再是主線、不再是過渡頁、也不再是確認後預設出口
  2. **`Project Detail` 任務發布區中的 `工種` 與 `選擇廠商`，一律以 `Vendor Data` 為唯一正式來源**
     - `工種` 不可再用硬編碼常數
     - 選定工種後，`選擇廠商` 清單只能顯示該工種底下的廠商
  3. **Vendor 對帳後金額主線已正式化為 `financial_reconciliation_groups`（含 `amount_total / item_count`）**
     - vendor list / vendor detail 都必須承接同一條正式來源
     - `financial_cost_items` 在目前正式 DB 中不存在，不可再假設為既定正式來源
     - vendor detail 性能問題仍是 open task，不可宣稱已解決

---

## 3. 2026-04-20 最新最高優先執行目的（目前主線）

目前 `projectflow` 的最主要執行目的，已更新為：
1. **先以 GitHub 驗收測試站作為現階段唯一主線**
2. 把功能、流程、權限與驗收先在測試站做完整、做穩
3. **正式站現階段先凍住，並可視為之後要清空 / 重建的正式落地目標**
4. 等測試站驗收到完整版本後，再整套搬到正式站，最後才處理正式 env / DB / auth / deploy 接線

### 目前兩站正式定位
- `GitHub` 對應的是 **驗收測試站**，主要驗一般 `projectflow` 主功能
- 本機 DB 承接的是 **正式站 / 正式系統**，後續真正營運會以這邊為主

### 重要特例（2026-04-19 已拍板）
- `auth / 帳號密碼 / RBAC / system settings` 目前屬 **正式站限定驗收功能**
- 因此 auth 相關錯誤與驗收，不應優先拿 GitHub 驗收站判讀，而應回到正式站這條線排查

### 正式啟用前的同步原則
- 一般正式變更：GitHub 驗收測試站 + 本機正式站都要同步
- 若涉及 schema / migration / 正式資料狀態：除程式碼外，也必須同步更新本機正式 DB
- 但目前正式站內既有專案資料屬過渡 / 驗證資料，使用者已明確表示正式啟用前會清空；真正要保留的是系統能力、schema、migration 與正式主線

---

## 4. 目前有效的高階判讀

### 3.1 先看最新主線，不要先看早期 spec
之後若有任何新 session / 新 agent / 新 handoff：
- 預設先讀 `MD-MASTER`
- 再讀 `MD155`
- 再讀 `MD156`
- 不可直接從 `MD21` / `MD22` 起手判斷目前規則

### 3.2 早期文件的正確地位
早期文件（例如 `MD21` / `MD22`）的正確地位是：
- 歷史來源
- 產品語意根據
- root rationale 回查材料

而不是：
- 目前驗收站主線的第一入口
- 新 session 的預設主要判讀基準

---

## 5. 與近代 closure 的關係

### 4.1 `MD134`
- 仍是 `project detail / dispatch / UI cleanup` 的重要 closure
- 但若碰到：
  - 文件承接出口
  - dispatch 工種 / 廠商同步
- 需再往後對齊 `MD156`

### 4.2 `MD136` / `MD137`
- 仍是 product guardrails 與第一輪 formalization 的重要規則文件
- 後續做三條線工作臺與 wording / visibility / family 骨架時，仍應遵守

### 4.3 `MD155`
- 管目前測試站單軌驗收優先
- 代表現在的執行策略是：
  - **先把測試站做對、做穩**
  - 正式站先凍住

### 4.4 `MD156`
- 管 2026-04-24 這一輪剛拍板且已落地的最新產品校正
- 目前至少有兩條必對齊：
  1. project-level document 承接
  2. dispatch 工種 × 廠商連動

---

## 6. 對後續 agent 的明確要求

之後續接 `projectflow` 時，禁止以下做法：

1. 只讀 `MD16` / `MD21` / `MD22` 就開始判斷現在規則
2. 把早期 spec 當成現行主線唯一基準
3. 沒先核對 `MD155` / `MD156` 就回報目前驗收站規則

正確做法必須是：

> **先讀 `MD-MASTER`，再讀 `MD155`、`MD156`，之後才視需要回查 `MD134`、`MD136`、`MD137`，最後才回頭翻更早的歷史 MD。**

---

## 7. 2026-05-11 新增：文件治理架構與成熟系統判讀

自 2026-05-11 起，`projectflow` 文件庫的正式治理入口，除本母檔外，新增：

- `MD-INDEX-projectflow-governing-document-architecture-2026-05-11.md`
- `MD-INDEX-projectflow-active-secondary-historical-map-2026-05-11.md`
- `MD-SUMMARY-projectflow-current-system-one-page-2026-05-11.md`
- `MD-INDEX-projectflow-missing-legacy-reference-audit-2026-05-11.md`

這份索引的角色不是取代本母檔，而是把目前分散的：
- 現行有效規則
- 成熟度 / 管理判讀
- 全站驗收體系
- 最新工程主線（含 200 多號 MD）
- 歷史回查層

整理成正式分層架構。

### 2026-05-11 的正式判讀（重要）

`projectflow` 現在不應再被理解成早期探索期系統，也不應只用舊 handoff / 單頁 UI spec 來判讀。

正式判讀應更新為：

> **`projectflow` 已進入正式成熟系統階段。**
> **其主線已從早期頁面與流程規劃，升級為：正式來源治理、cross-page consistency 驗收、正式資料閉環，以及 local / fallback / bridge 殘留鏈退休。**

對應文件分層如下：

1. **現行規則層**
   - `MD155`
   - `MD156`
   - `MD157`

2. **成熟度 / 管理判讀層**
   - `MD158`
   - `MD163`
   - `MD164`

3. **全站驗收體系層**
   - `MD171`
   - `MD172`
   - `MD173`

4. **最新工程主線 / 正式 truth 收斂層**
   - `MD203`
   - `MD204`
   - `MD205`
   - `MD206`
   - `MD207`
   - `MD208`
   - `MD209`
   - `MD210`

補充判讀：
- `MD171~173` 代表系統已建立全站 source-of-truth / cross-page consistency 驗收框架
- `MD203~210` 代表系統現階段工程主線，已進入退休 local/fallback/bridge 假扮正式 truth 的成熟收斂階段
- 因此，200 多號 MD 不是旁支雜訊，而是目前成熟系統主線的重要組成

## 8. 一句話總結

> **`projectflow` 目前的正式治理入口，已升級為：`MD-MASTER` + `MD-INDEX-projectflow-governing-document-architecture-2026-05-11.md`；現行規則以 `MD155~157` 為準，成熟度判讀以 `MD158/163/164` 為準，全站驗收體系以 `MD171~173` 為準，最新正式 truth 收斂工程主線以 `MD203~210` 為準；`MD21` / `MD22` / `MD26` 等早期文件已降級為歷史回查層，不可再當作新 session 的主要入口。**
