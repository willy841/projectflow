# MD158 — projectflow 驗收規則、修正結果與新版正式驗收腳本整併總結 — 2026-04-26

> Status: ACTIVE / CONSOLIDATED ACCEPTANCE SUMMARY  
> Role: 整理本輪 `projectflow` 測試站驗收過程中，已拍板的正式驗收規則、已完成修正、驗收結果，以及新版正式驗收腳本（v2）方向，作為後續續接與正式站搬遷前的重要整併文件。  
> Scope:  
> 1. 本輪正式驗收判準整併  
> 2. 本輪已完成修正整併  
> 3. 本輪產品驗收結論  
> 4. 舊測試與新版驗收腳本 v2 的定位  
> 5. 後續完整度提升方向

---

## 1. 本輪背景

本輪工作不是單純修 bug，而是把 `projectflow` 測試站從「舊測試規則、舊 UI 假設、舊文案 expectation」中重新拉回到目前真正已拍板的產品主線，並據此完成：

1. 問題定位  
2. 指定修正  
3. 重新驗收  
4. 新版正式驗收腳本 v2 起建

重要的是：

> **本輪最終主判準不是舊 Playwright 腳本，而是使用者在本輪對話中正式拍板的產品規則與驗收標準。**

---

## 2. 本輪正式拍板的驗收規則（重要）

以下規則已在本輪被明確定義，後續 agent / 測試 / 驗收不得再用舊理解覆蓋。

### 2.1 驗收主線是完整專案生命週期

正式驗收主線應從：

1. 建立專案  
2. requirement  
3. execution item / Excel 匯入  
4. 任務發布  
5. 設計線  
6. 備品線  
7. 廠商線  
8. quote-cost / reconciliation / 收款  
9. closeout  
10. closeout retained / 結案文件

一路驗到最後，而不是只做單頁 smoke test。

---

### 2.2 驗收不是只驗「能不能按」，而是閉環驗收

每個重要操作都要盡量驗：

- 送出條件是否成立（gating）
- 送出後資料是否真的寫入
- refresh / 離開重進後是否仍成立
- cross-page 是否一致
- delete 後是否同步消失
- overwrite 後舊資料是否正確被替換
- field mapping 是否寫到正確欄位
- **DB write 成功後，資料是否真的出現在正確 downstream UI / read model 頁面**

也就是：

> **不是只看畫面有沒有變，而是驗證資料是否真的留存、覆蓋、同步與下游承接。**
>
> **只驗 DB write 成功但不驗 downstream UI/readback，不算正式通過。**

### 2.2-A Fresh-project 驗收必須分清兩種層級（2026-04-27 補強）

之後凡是宣稱 fresh-project「從頭到尾已驗過」，必須明確區分：

1. **core mainline passed**
   - 代表至少有一條從新建專案一路跑到下游/結案的主路徑通過
   - 這只能證明主線沒斷，不代表所有真實使用者分支都驗過
2. **all real user branches passed**
   - 代表該 fresh-project 驗收已把本輪要求的真實分支也納入 must-pass
   - 不只 happy-path

對 fresh-project end-to-end 標準，後續正式要求是：

> **不能只宣稱 core mainline passed；若要當作完整 fresh-project 驗收結論，必須把指定 real-user branches 一起驗過。**

---

### 2.2-B 本輪新增的 must-pass acceptance 補強（2026-04-27）

1. **Fresh-project from-scratch acceptance 必須含 branch-complete verification**
   - 不得只跑單一路 happy-path mainline
2. **設計任務 save/confirm 必須覆蓋兩條可達 confirm 的 save 分支**
   - `sync-plans` 分支
   - `replace-plans` 分支（含 vendor identity resolution）
3. **Vendor board confirm → quote-cost downstream readback 是正式 must-pass**
   - 正式 vendor confirmation 一旦寫入 DB
   - 就必須在 quote-cost downstream 正確出現
   - 不可因 upstream UI feature-flag / page gating 而被當成可忽略
4. **Downstream readback 必須頁面化驗證**
   - design/procurement document
   - vendor package / quote-cost
   - 必須驗正確頁面真的看得到，不只驗 DB
5. **UI click-path regression 需納入 acceptance**
   - 至少包含：dispatch sub-item assignment menu 可互動/可點擊
   - 不可接受「畫面有 render 但實際被蓋住、點不到」

### 2.3 設計 / 備品 / 廠商三條線的正式文件層規則

正式規則：

- 設計線正式出口：`/projects/[projectId]/design-document`
- 備品線正式出口：`/projects/[projectId]/procurement-document`
- 廠商線的正式承接，也應依目前專案文件層 / 正式承接層規則來驗

不得再把：

- `design-tasks/[id]/document`
- `procurement-tasks/[id]/document`

當成目前正式主出口。

> **task-level document 只能視為歷史殘留 / 相容頁，不可再當正式主線出口。**

---

### 2.4 Quote-cost detail 的 source family 顯示規則

正式規則：

- quote-cost detail 頁面預設先顯示 **設計** family
- 備品 / 廠商透過 family tab / source family 切換顯示
- 因此：備品資料不是首屏直接出現，**不是 bug**

後續驗收應改成驗：

- family tab 切換是否正常
- 切換後的資料是否正確
- 不可再用「首屏未直接出現備品」當產品 fail

---

### 2.5 權限規則（非常重要）

使用者已拍板：

只有以下兩個地方是 **admin-only**：

1. 帳務中心  
2. 系統設定

除此之外，其他主線皆應可由 **member** 正常操作，包括：

- project 主線
- 設計 / 備品 / 廠商
- Vendor Data
- quote-cost
- 收款
- 對帳
- closeout 主線

因此若 quote-cost / 收款 / closeout 被錯誤擋成 admin-only，應視為：

- `RBAC_BROKEN`
- `GATING_BROKEN`

---

### 2.6 Vendor unpaid / paid 規則（本輪核心之一）

正式規則如下：

#### A. 任一線已對帳，就應進入未付款區

同一個 `vendor × project` 底下：

- 設計
- 備品
- 廠商

三條線都可能對應到同一 vendor。

只要其中**任一 group 已完成對帳**，該 `vendor × project` 就應該出現在 vendor detail 的 **未付款專區**。

#### B. 未付款區顯示的是「目前已對完帳的金額」

未付款專區應顯示：

1. 已對帳幾筆  
2. 尚未對帳幾筆  
3. 目前已對完帳、可付款的金額

不是要等全部 group 都對完帳才顯示。

#### C. 沒有「部分付款」功能

本系統目前正式規則：

> **沒有「部分付款」這個功能概念。**

因此後續驗收與測試，不可再用：

- `部分付款`
- partial payment status 文案

當成正式規則或正式 UI contract。

#### D. 只有全部對完帳，才能標示已付款

正式規則：

> **只有當這個 `vendor × project` 底下所有 group 全部對完帳之後，才可以勾選成已付款。**

因此：

- 任一 group 已對帳 → 可進未付款區
- 全部 group 已對帳 → 才可標示已付款

---

### 2.7 Closeout gating 規則

正式規則：

- `確認結案` 按鈕只有在：
  - 已滿足對帳條件
  - 已收完款項
  才可點擊

- 若條件未滿足，按鈕應為 disabled

- 不需要額外系統提示文字，例如：
  - `已符合結案條件`
  - `尚未符合結案條件`

因此後續驗收應以：

> **按鈕是否正確可點 / 不可點** 作為判準，而不是檢查提示文案。

---

### 2.8 驗收文案與頁面名稱一律以「現在 UI」為準

使用者已拍板：

> **凡是驗收名稱、頁面區塊名稱、按鈕名稱，一律以現在 UI 為準。**

因此：

- 舊測試綁死的舊文案
- 舊 heading
- 舊區塊名稱

若與目前 UI 不一致，不得直接當成產品 fail 證據。

---

### 2.9 Login label/input 問題的定性

本輪已釐清：

- login 頁 label/input 綁定不完整，屬於**技術穩定性 / 可測性問題**
- 若不影響實際前端使用者登入，則不先列為前端 user-facing 驗收 fail
- 但若影響測試、自動化、系統穩定性，仍屬應修正項

---

## 3. 本輪已完成修正整併

以下為本輪經使用者批准後，已實際修正並 push 的項目。

---

### 3.1 Vendor detail 性能修正（第一輪）

#### 問題
vendor detail 頁面過慢。

#### 處理結果
已做低風險載入策略優化，例如：

- history 改 lazy load
- detail 改 on-demand
- 避免首屏過重 payload

#### 重要結論
此處理後，性能有改善，但後續仍做了更深入 root-cause 定位。

#### 相關 commit
- `fe895c1` — `perf: lazy load vendor detail history and details`

---

### 3.2 Vendor detail 真正慢點定位 + 修正

#### 真正根因
最主要 bottleneck 不是單一 SQL，而是：

- `listDbVendorProjectRecordsByVendorId()` 內無條件全量跑 `listDbVendorPackages()`
- 即使該 vendor / project 最後沒有 financial records，也先白做 package fanout

#### 修正
若 `financial.records.length === 0`，直接 short-circuit，不再跑 package fanout。

#### 結果
- vendor detail 首頁時間顯著下降
- history API 也顯著下降

#### 相關 commit
- `d2fe386` — `perf: trace vendor detail path and skip empty package fanout`

---

### 3.3 Quote-cost / closeout 錯誤 admin-only gating 修正

#### 問題
quote-cost / 收款 / closeout 被錯誤擋成 admin-only。

#### 修正
移除 collections create/delete 的錯誤 admin gate：

- `POST /api/accounting/projects/[id]/collections`
- `DELETE /api/accounting/collections/[id]`

#### 結果
member 不再被錯擋在 quote-cost 主線外。

#### 相關 commit
- `2f4ad06`

---

### 3.4 Vendor unpaid / paid carry logic 修正

#### 問題
vendor detail 的未付款 / 已付款承接邏輯與使用者規則不一致。

#### 修正
以 `vendor × project` 為單位聚合整個專案下同 vendor 的：

- 設計
- 備品
- 廠商

對帳群組，並調整為：

- 任一群組已對帳 → 進 unpaid zone
- 顯示：`已對帳 X 筆 / 未對帳 Y 筆`
- 只有全部群組都已對帳 → 才可成為 fully paid semantic state
- 若 `amount_total / item_count` 舊資料為 null，補 fallback，不再錯算為 0

#### 相關 commit
- `2f4ad06`

---

### 3.5 Login label / input 綁定修正

#### 問題
label / input 綁定不完整，影響可測性與穩定性。

#### 修正
- Email 欄位補 `id`
- 密碼欄位補 `id`
- label 補 `htmlFor`

可見文案完全沒改。

#### 相關 commit
- `2f4ad06`

---

### 3.6 Closeout retained / archive mismatch 修正

#### 問題
closeout 頁曾出現：

- family summary
- reconciliation groups
- item detail

三者資料不一致，甚至同頁互相矛盾。

#### 真正根因
`closeout-detail-client.tsx` 原本把 retained 成本硬改成單一 synthetic vendor-only item，且 `sourceType` 固定為 `廠商`，但同頁的 groups 又讀另一套來源。

#### 修正方向
- 統一 closeout retained read model
- 由 latest confirmed snapshots + retained manual costs 組 retained cost items
- 用同一批 retained items 重建：
  - family summary
  - reconciliation groups
  - item detail
  - vendor payment summary
- 移除 synthetic vendor-only summary

#### 結果
closeout retained 頁重新對齊，同頁不再自我矛盾。

#### 相關 commit
- `88103a5` — `fix: align closeout retained detail with snapshot read model`

---

### 3.7 Execution Excel 重匯覆蓋修正

#### 問題
Execution Excel 第二次匯入時，系統原本會把新 tree 直接 append 在舊 tree 後面，而不是覆蓋既有 execution tree。

#### 真正根因
`src/app/api/projects/[id]/execution-items/import/route.ts` 在匯入前會讀既有 execution items，並沿用既有主項目數量續編 `sort_order`，但完全沒有先清掉舊 tree，因此第二次匯入必然 append。

#### 修正
- 在 execution import transaction 內，正式寫入前先刪除該專案舊的 `project_execution_items`
- 將 `nextMainSortOrder` 重置為 `1`
- 使同專案第二次 Excel 匯入時，以新 tree 覆蓋舊 tree，而不是追加

#### 結果
同專案連續匯入兩次 execution Excel 時：
- 第二次只保留新版 main / child tree
- 舊項目完全消失
- sort order 從 1 重新開始

#### 相關 commit
- `ef1326f` — `fix: overwrite execution import and validate quote uploads`

---

### 3.8 Quote import validation 錯誤分類修正

#### 問題
Quote import 在遇到錯誤格式 / 缺欄位 / 缺 `總金額` 這類明顯屬於使用者輸入或檔案結構錯誤時，雖然會回清楚訊息，但 HTTP status 原本被錯誤分類成 `500`。

#### 真正根因
- `src/lib/quotation-import.ts` parser 對格式錯誤直接丟一般 `Error`
- `src/app/api/financial-projects/[id]/quotation-import/route.ts` 在 catch 中幾乎把所有錯誤都當成 `500`
- 只有少數 DB conflict 才特別轉成其他 status

#### 修正
- 新增 `QuotationImportValidationError`（status = 400）
- 將 parser 中所有：
  - 檔案格式錯誤
  - 六欄標題缺失
  - 缺 `總金額`
  - Excel 無法辨識
  這類錯誤改成丟 validation error
- API route catch 時：
  - `QuotationImportValidationError` -> `400`
  - DB conflict (`23505`) -> `409`
  - 其他未預期 runtime 問題 -> `500`

#### 結果
- 使用者仍可收到清楚錯誤訊息
- 但錯誤類型已改為正確的 validation-class 4xx，而不是誤報成 500 server error

#### 相關 commit
- `ef1326f` — `fix: overwrite execution import and validate quote uploads`

---

### 3.9 Closeout retained snapshot 正式化

#### 問題背景
在前一輪修正中，closeout retained truth 已從 live/source mix 改為 retained snapshot/read model，但當時 `financial_closeout_snapshots` 仍主要仰賴 runtime auto-create，尚未正式進入 migration/schema 路徑。

#### 本輪正式決定
使用者已明確拍板：

- closeout retained 需要正式化
- reopen 不刪 snapshot
- reopen 後 active side 恢復看 live truth
- **不做多次歷史版本 archive**
- 現行正式模型為：
  - **每個 project 一筆 retained snapshot**
  - 若 reopen 後再 closeout，則覆蓋這一筆 retained row

#### 修正
1. 新增正式 migration：
   - `db/migrations/20260426_financial_closeout_snapshots.sql`
2. 將 `financial_closeout_snapshots` 正式納入 schema 路徑
3. `src/lib/db/closeout-retained-snapshot.ts` 改成：
   - migration 為正式 schema owner
   - runtime `ensureCloseoutSnapshotTable()` 只保留為 compatibility safeguard
4. 新增正式規則文件：
   - `docs/projectflow-closeout-retained-snapshot-rules-2026-04-26.md`
5. 同步補強：
   - `docs/projectflow-new-formal-acceptance-suite-spec-2026-04-25.md`
   - `README.md`

#### 結果
- closeout snapshot 不再只是 runtime 臨時 auto-create
- closeout / reopen 語意已正式文件化
- 明確鎖定：
  - closeout 寫 retained snapshot
  - closeout detail/list 讀 retained snapshot
  - reopen 不刪 snapshot
  - reopen 恢復 active/live truth
  - **不做 versioned archive**

#### 相關 commit
- `c3db583` — `docs: formalize closeout retained snapshot rules`

---

## 4. 本輪產品驗收結果整併

本輪最終主判準：

> **以使用者在本輪正式拍板的產品規則為準，不再以舊測試腳本與舊 wording expectation 當主判準。**

---

### 4.1 已驗通的產品主線

以下主線，依本輪正式驗收標準，已驗通：

#### 專案主線
- 首頁 / dashboard
- project list
- project detail
- project creation
- project list 搜尋 / 排序 / 狀態篩選 / pagination

#### Requirement / Execution
- requirements CRUD
- execution item Excel import
- execution item Excel 重匯覆蓋（不再 append）
- 真前台 xlsx upload preview / import

#### Project detail / dispatch / family routing
- `專案設計 / 專案備品 / 專案廠商` 導流正確
- dispatch 工種來源與 vendor filtering 正確
- 切換工種會清空不相容 vendor 值

#### 設計線
- save 不等於正式 truth
- `全部確認` 才推進 confirmation
- 正式出口是 project-level design document
- 最新確認內容覆寫 project-level document truth

#### 備品線
- save 不等於正式 truth
- `全部確認` 才推進 confirmation
- 正式出口是 project-level procurement document
- 最新確認內容覆寫 project-level document truth

#### Vendor 線
- 單筆儲存不成立 group truth
- group `全部確認` 會覆寫 latest package truth
- package detail 承接 latest confirmed payload
- 複製內容 / 匯出 TXT / 文件承接可用
- vendor payment create/delete lifecycle 通過

#### Quote-cost / Financial
- 三家族成本可讀回
- collection writeback 正常
- reconciliation groups 與正式來源對齊
- member 可操作 quote-cost 主線
- malformed quote import 會回清楚 validation message，且 status 已正確分類為 4xx（不再誤回 500）

#### Closeout / Retained
- closeout gating 正常
- retained readback 正確
- reopen 後回 active views
- closeout retained / archived readback 對齊
- closeout retained snapshot 已正式化進 migration/schema 路徑
- closeout / reopen 規則已文件化並鎖定（不做 versioned archive）

---

### 4.2 使用者本輪指定重點驗收項判定

- project lifecycle：**PASS**
- project-level docs：**PASS**
- overwrite semantics：**PASS**
- field mapping：**PASS**
- refresh persistence：**PASS**
- delete propagation：**PASS**
- vendor unpaid / paid rules：**PASS**
- quote-cost operability：**PASS**
- family tabs：**PASS**
- closeout gating：**PASS**
- closeout retained correctness：**PASS**

---

### 4.3 本輪排除掉的誤判 / 過時紅燈

以下不應再當成產品 fail：

#### A. Procurement item 首屏未直接可見
原因：
- 現行規則是 family tab 切換
- 非資料遺失

#### B. 舊測試期待 `部分付款`
原因：
- 本輪已正式拍板：系統無「部分付款」功能概念

#### C. 舊測試硬綁 `28000`
原因：
- payable 應看當前真實 current payable，不可再寫死舊固定值

#### D. 舊 heading / 舊 wording / 舊區塊名稱
原因：
- 驗收名稱一律以現在 UI 為準

#### E. closeout 缺少提示文字
原因：
- 正式規則只看按鈕可點 / disabled，不需要額外提示文案

#### F. login label/input 問題被當成前端主流程 fail
原因：
- 這條屬技術穩定性 / 可測性問題，不先列為前端 user-facing fail

---

## 5. 新版正式驗收腳本（v2）整併結果

本輪已決定：

> **之後不再以舊、過時、混雜 task-level 假設的驗收腳本當主判準。**
> **改以新版正式驗收腳本 v2，對齊本輪新拍板的正式驗收規則。**

---

### 5.1 v2 新 suite 方向

新 suite 放在：

- `tests/formal-acceptance-v2/`

並以：

- `test:formal-acceptance:v2`

作為新 formal acceptance 主執行入口。

---

### 5.2 v2 已完成的內容（截至本文件）

#### Scaffold / helper
- `tests/formal-acceptance-v2/helpers.ts`
- `package.json` 新增 `test:formal-acceptance:v2`

#### 已落地的 v2 核心檔案
1. `00-baseline-and-project-lifecycle.spec.ts`
2. `01-project-detail-dispatch-and-family-routing.spec.ts`
3. `02-design-project-document-mainline.spec.ts`
4. `03-procurement-project-document-mainline.spec.ts`
5. `04-vendor-package-mainline.spec.ts`
6. `05-quote-cost-mainline.spec.ts`
7. `06-closeout-retained-readback.spec.ts`
8. `07-vendor-unpaid-history-and-payment-reversal.spec.ts`
9. `08-closeout-list-and-manual-cost-freeze.spec.ts`
10. `09-cross-flow-formal-mainline-smoke.spec.ts`
11. `09-boundary-batch3-regressions.spec.ts`
12. `10-boundary-batch4-product-completeness.spec.ts`
13. `11-boundary-batch5-product-completeness.spec.ts`
14. `12-boundary-batch6-lifecycle-crossovers.spec.ts`
15. `13-boundary-batch7-reopen-payment-freeze.spec.ts`
16. `14-boundary-batch8-manual-cost-reopen-readback.spec.ts`
17. `15-boundary-batch9-second-closeout-overwrite.spec.ts`
18. `16-boundary-batch10-manual-cost-toggle-second-closeout.spec.ts`
19. `17-boundary-batch11-reconciliation-fallback-second-closeout.spec.ts`
20. `18-boundary-batch12-closeout-list-second-closeout.spec.ts`

#### 已驗證結果
- `npm run test:formal-acceptance:v2`
- 主 blocker suite 持續綠燈通過
- batch3 / batch4 / batch5 / batch6 / batch7 / batch8 / batch9 / batch10 / batch11 / batch12 邊界驗收已補進 v2，並完成本輪新增問題修正後重跑通過

---

### 5.3 v2 已對齊的規則

v2 目前已正式對齊：

- project lifecycle
- family routing
- dispatch trade/vendor filtering
- design project-level document mainline
- procurement project-level document mainline
- save ≠ formal truth
- confirm 才推進正式 truth
- vendor latest package truth
- quote-cost mainline
- closeout retained readback

---

### 5.4 舊測試在後續的定位

後續舊測試不應再當主 blocker。  
應採：

- archive legacy
- rewrite stale expectations
- 保留少數仍可沿用的 helper 與測試邏輯

---

## 6. 系統現況整體判定

若以本輪正式驗收標準來看：

> **目前 `projectflow` 測試站主線可以視為驗收通過。**

本輪最終沒有再確認到新的產品 blocker。

因此目前系統可判定為：

- 主線可用
- 規則已重新對齊
- 重點問題已收斂
- closeout retained 這種尾端資料一致性也已驗通

---

## 7. 仍應持續關注但不列本輪 blocker 的項目

### 7.1 Vendor detail performance
本輪已做過性能改善與定位，體感已有改善；但若要宣稱完全結案，仍可在後續持續觀察。

### 7.2 正式站搬遷前的環境整理
使用者已明示：
之後會把測試站搬到目前主機上的正式站位置。

屆時才適合一起整理：

- env / runtime
- deploy / startup
- 非標準環境 warning
- 正式站穩定性收尾

目前不列為產品主線驗收問題。

### 7.3 2026-04-26 後續邊界驗收補充（batch4）
本輪在主線通過後，繼續補做以「產品完整度提升」為目標的 batch4 邊界驗收，新增確認與修正如下：

#### A. closeout gating 邊界補強
正式規則再次確認：
- **0 個 reconciliation groups** 時，不可結案
- **已收款但未全部對帳** 時，不可結案

本輪修正內容：
- 前端 `quote-cost detail` 的結案按鈕 gating，不再把「0 groups」誤當成可結案
- `reconciliation-groups/sync` route 與 DB constraint 正式放寬為三態：
  - `未對帳`
  - `待確認`
  - `已對帳`
- 使「2/3 已對帳、1/3 回退未完成」這種真實邊界可被正確表達與驗證

#### B. vendor unpaid 回退邏輯修正
正式規則再次確認：
- `vendor × project` 只要不是 fully reconciled，就不應繼續留在目前完成承接結果中
- 換句話說：若原本 `3/3` 全對帳，後來回退成 `2/3`，就不應再被下游當成 `3/3` 完成態

本輪修正內容：
- `vendor-financial-adapter` 不再以「只要有任一已對帳 group」就保留 record
- 改為：**只有 fully reconciled records 才承接進目前完成承接結果**
- 使 vendor unpaid / history 在 partial unreconciled 回退後，不再錯留舊完成態

#### C. duplicate React key 穩定性風險修正
本輪另確認一條非 blocker、但屬真穩定性風險的問題：
- vendor detail / history 明細列原本存在 duplicate React key warning
- 根因是 render key 使用了可能重複的顯示內容（如 item label / source detail text）
- 已在：
  - `vendor-detail-shell-db.tsx`
  - `vendor-detail-shell.tsx`
  將 key 改為同一 list 內穩定不重複的組合鍵

#### D. batch4 產品驗收結果
以下邊界情境已驗證通過：
1. 無收款但全部對帳時，closeout 仍被正確擋下
2. 已收款但未全部對帳時，closeout 仍被正確擋下
3. vendor 已 fully reconciled 後，若其中一組回退成未完成，該專案會自 vendor unpaid 完成承接結果中正確退場

### 7.4 2026-04-26 後續邊界驗收補充（batch5）
本輪再往下補做 batch5，聚焦 fully reconciled → partial fallback 後的 history / closeout write barrier。

#### A. 驗收基線補正
在 batch5 過程中，確認兩個驗收基線問題並已補正：
- vendor payment 驗收前需先 reset 該 sample `project × vendor` 的付款基線
- `syncAllReconciliationGroups()` 需帶完整 group payload：
  - `reconciliationStatus`
  - `amountTotal`
  - `itemCount`

否則會把 payable 測試資料錯誤壓成 0，造成付款 API 被髒基線干擾。

#### B. batch5 產品驗收結果
以下邊界情境已驗證通過：
1. vendor 已進 fully-paid history 後，若其中一組回退成未完成，該專案會從 history 正確退場
2. fully reconciled 回退成 partial 後，closeout write 仍會被正確擋下

### 7.5 2026-04-26 後續邊界驗收補充（batch6）
本輪再往下補做 batch6，聚焦 payment lifecycle 與 closeout / reopen lifecycle 的交界。

#### A. 驗收 runtime / 啟動方式補正
在 batch6 過程中，正式確認 acceptance 驗收不應再使用：
- `npm run dev`
- `reuseExistingServer: true`

原因：
- 這會讓 browser-facing page 有機會吃到不乾淨的 dev runtime / cache state
- 不利於保證 request-side 與 page-side 驗收站在同一 acceptance runtime

因此正式改為：
- Playwright `webServer.command` → `./scripts/start-acceptance.sh`
- `reuseExistingServer` → `false`

#### B. batch6 驗收判準收斂
本輪也確認：
- `vendor detail > 往來紀錄 > 過往紀錄` 的特定畫面呈現，不應在目前證據不足時直接升格為本輪 blocker 驗收主判準
- batch6 應回到已拍板且證據穩定的產品主判準：
  1. 已付款 history API 在 closeout / reopen 前後仍正確保留
  2. unpaid 區不應錯誤重新出現該專案

#### C. batch6 產品驗收結果
以下 lifecycle crossover 邊界情境已驗證通過：
1. vendor fully-paid history 在 closeout 後仍正確保留
2. reopen 後，vendor fully-paid history 仍正確保留
3. reopen 後，該專案不會錯誤回到 unpaid 區

### 7.6 2026-04-26 後續 deeper crossover 邊界驗收補充（batch7 ~ batch12）
本輪繼續往 closeout / reopen / payment / manual cost / reconciliation 的更深交界補驗，目的不是重跑主線，而是確認已拍板規則在多次切換、回退、再 closeout 情境下不會鬆脫。

#### A. batch7 — reopen × payment lifecycle
已驗證通過：
1. valid closeout 後 reopen，不會靜默刪掉 vendor paid history 或 payment records
2. 若先已付款、已結案，再刪除 payment record 後 reopen，系統不會殘留 stale fully-paid history，而會正確回到 unpaid semantics

#### B. batch8 — retained manual-cost snapshot × reopen
已驗證通過：
1. closeout 後 retained manual-cost snapshot 會保留
2. reopen 不會改壞 retained snapshot
3. retained-only totals 不會錯誤回灌污染 active truth

#### C. batch9 — second closeout overwrite
已驗證通過：
1. reopen 不會清掉前一次收款紀錄
2. reopen 後修改 manual cost，再第二次 closeout 時，系統會覆蓋單一 retained snapshot
3. retained snapshot 不會殘留第一次 manual cost 內容

#### D. batch10 — manual cost included/excluded toggle × second closeout
已驗證通過：
1. 第一次 closeout 若將 manual cost 納入成本，retained totals 正確
2. reopen 後將同一筆 manual cost 改成 `includedInCost = false`
3. 第二次 closeout 會正確覆蓋 retained totals，不會殘留第一次的 included total

#### E. batch11 — reconciliation fallback × second closeout barrier
已驗證通過：
1. 第一次 closeout 成功後，若 reopen 再把其中一組 reconciliation 改回 `待確認`
2. 第二次 closeout 會再次被正確擋下
3. 不會出現「第一次過了，以後就一路放行」的 gating 漏洞

#### F. batch12 — closeout list × second closeout overwrite readback
已驗證通過：
1. 第一次 closeout 後，closeout list 會顯示第一版 retained totals
2. reopen 後修改 manual cost、再第二次 closeout
3. closeout list 會正確顯示覆蓋後的新 retained totals
4. 不會殘留第一版舊數字

#### G. 本輪 deeper crossover 結論
在 batch7 ~ batch12 這一串更深交界驗證中，目前仍未打出新的產品 blocker。
本輪已拍板規則下，以下交界已驗證穩定：
- closeout / reopen
- payment create / delete / reversal
- retained snapshot 單筆覆蓋
- manual cost included/excluded toggle
- reconciliation fallback after reopen
- closeout list readback after second closeout overwrite

---

## 8. 後續建議

### 立即可做
1. 持續補齊 v2：
   - vendor unpaid / history
   - manual cost frozen behavior
   - closeout list / reopen 回切
2. 封存 legacy acceptance 腳本，避免舊規則繼續混淆驗收

### 中期可做
1. 把本輪拍板規則再整理進正式驗收規範 / 文件
2. 讓 v2 正式成為唯一 blocker acceptance suite

### 之後搬正式站時再做
1. 正式站 runtime / env / deploy 整理
2. 正式資料治理與 closeout archive persistence 策略
3. 性能與環境穩定性收尾

---

## 9. 一句話總結

> **本輪已把 `projectflow` 的產品驗收主判準，從舊測試與舊文案 expectation，正式收斂到使用者拍板的新規則；並完成必要修正、重新驗收與新版正式驗收腳本 v2 起建。以目前主線來看，系統可視為驗收通過。**
