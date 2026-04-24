# MD134 — projectflow post-MD133 project detail / dispatch / UI closure (2026-04-14)

> Status: CLOSED / HANDOFF READY  
> Phase: post-MD133 continuation  
> Role: 承接 `MD133` 後，針對 project detail / dispatch / execution items / homepage & projects/new UI cleanup 的正式收斂文件。  
> Important: 本文件明確區分 **已完成**、**衝突 / 已修正**、**仍待處理**，並與前序 `MD130`–`MD133` 對齊，不混入 Accounting Center / Phase P4。

---

## 1. 與前序 MD 的對齊關係

### 1.1 已承接的前序主線
- `MD130` — Phase P3 work package
- `MD131` — Phase P3 progress
- `MD132` — Phase P3 status
- `MD133` — Phase P3 final closure

### 1.2 本文件承接範圍
`MD133` 已將 homepage overview / active aggregation 主線收口。  
本文件承接之後的實際工程與驗收，範圍集中在：

1. project detail upstream existence closure
2. project requirements CRUD closure
3. execution items DB truth closure
4. design / procurement / vendor dispatch closure
5. vendor matching 完整結構版
6. project detail / projects list / homepage / new project page UI cleanup

### 1.3 明確不納入範圍
- Accounting Center Phase P4 extension
- month-close / reporting extension
- closeout / archived data full-round redesign
- 全站 design system 全面重構

---

## 2. 本輪已完成（Completed）

## 2.1 Project creation / upstream existence
已完成：
- `/projects/new` 已切到正式 DB project flow
- 新建專案可正式寫入 `projects`
- 建立後可打開 project detail

結論：
- **PASS**

---

## 2.2 Project requirements closure
已完成：
- `project_requirements` schema/application 已到位
- 實測 CRUD：
  - create
  - reload readback
  - update
  - delete
  均已通過

結論：
- **PASS**

---

## 2.3 Execution items manual path closure
已完成：
- execution items 手動新增主項 / 子項可正式寫 DB
- rename 已改成正式落 DB
- delete 已改成正式落 DB
- refresh 後畫面與 `project_execution_items` 對齊

結論：
- **PASS**

---

## 2.4 Execution items Excel import closure
已完成：
- 原先 Excel import 只更新 client state、refresh 後消失
- 已修成正式寫入 `project_execution_items`
- 後續再升級成 bulk import API，降低逐筆 request roundtrip

結論：
- **PASS（correctness）**
- **PASS（第一輪 performance hardening）**

---

## 2.5 Dispatch closure（設計 / 備品 / 廠商）
已完成：
- design dispatch 實測通過
- procurement dispatch 實測通過
- vendor dispatch 實測通過
- project detail 下方分類檢視可讀回
- downstream detail / refresh 可承接

結論：
- **PASS**

---

## 2.6 Vendor matching 完整結構版
已完成：
- 三種交辦一起重構
- 移除 `狀態`
- 移除 `補充註記`
- `執行廠商` 改成匹配既有 vendor DB
- 補 schema：
  - `design_tasks.vendor_id`
  - `procurement_tasks.vendor_id`
- dispatch route / adapter / summary / downstream 已同步收斂
- 後續再升級成 searchable vendor picker

對應 SQL editor 補件：
```sql
alter table design_tasks
  add column if not exists vendor_id uuid references vendors(id) on delete restrict;

alter table procurement_tasks
  add column if not exists vendor_id uuid references vendors(id) on delete restrict;

create index if not exists idx_design_tasks_vendor on design_tasks (vendor_id);
create index if not exists idx_procurement_tasks_vendor on procurement_tasks (vendor_id);
```

結論：
- **PASS**

---

## 2.7 Project detail / dispatch UI cleanup
已完成：
- `已建立XXX` badge 移到與標題同列
- `尚未建立交辦` 同樣移到與標題同列
- 主項 / 次項右側按鈕垂直置中
- 交辦選單重做：縮窄、置中、較乾淨 popover card
- 左側 toggle 改為較乾淨 chevron button
- 側抽屜重複 header 拿掉，只留關閉按鈕
- 三條線 drawer header 系統字拿掉
- `來源項目` 移到與交辦標題同列
- 下方任務檢視區系統 helper 文案拿掉

結論：
- **PASS**

---

## 2.8 Projects list cleanup
已完成：
- `/projects` 中的 `新增專案` 按鈕樣式已重做
- `/projects` 列表已排除 `已結案` 專案
- 已結案專案應留在 `結案紀錄`

結論：
- **PASS**

---

## 2.9 Homepage overview cleanup
已完成：
- homepage 右上 `新增專案` 按鈕樣式已重做
- header badge 已與首頁標題同列
- `查看專案列表` 已移除
- 4 張 summary cards 的系統提示字已拿掉
- `近期專案` / `收款概況` 標題下方系統字已拿掉
- 頁面內 `active` wording 已收掉
- recent projects 已排除 `已結案`
- summary / collection block 文案已簡化

結論：
- **PASS**

---

## 2.10 New project page cleanup
已完成：
- header 下方系統文字拿掉
- 表單區塊標題下方系統文字拿掉
- `專案編號預覽` 拿掉
- `填寫建議` 拿掉
- `表單狀態` 拿掉
- 新建頁只保留乾淨表單本體

結論：
- **PASS**

---

## 3. 本輪衝突 / 問題 / 已修正（Conflicts / Resolved）

## 3.1 Execution items truth conflict
衝突：
- UI 顯示的 execution items 與 DB `project_execution_items` 不一致
- Excel import 當下可見，但 refresh 後消失

根因：
- import 僅更新 client state，未正式寫 DB

處理：
- 已修成 DB persistence
- 再補 bulk import

狀態：
- **RESOLVED**

---

## 3.2 Execution item edit/delete conflict
衝突：
- create 落 DB，但 edit / delete 只改 local state

處理：
- 已新增 per-item PATCH / DELETE route
- execution tree 已改成 edit/delete 正式落 DB

狀態：
- **RESOLVED**

---

## 3.3 Dispatch vendor source conflict
衝突：
- design / procurement / vendor 各吃不同 vendor source：
  - design → `outsourceTarget`
  - procurement → `buyer`
  - vendor → `vendorName`

處理：
- 已統一成 vendor DB matching 主線
- design / procurement 結構層補 `vendor_id`

狀態：
- **RESOLVED**

---

## 3.4 Homepage / projects / new page helper-copy conflict
衝突：
- 多處仍保留開發期 / 驗收期系統文字，破壞正式 UI 完整度

處理：
- homepage / projects / new project / project detail 大量 helper copy 已拿掉

狀態：
- **RESOLVED（本輪範圍內）**

---

## 3.5 Homepage recent projects vs test data conflict
衝突：
- homepage recent projects 仍可能顯示既有 DB 驗收樣本
- 容易被誤認為刪除流程未生效

處理：
- recent projects 已排除 `已結案`
- 但 DB 內既有測試資料治理仍需持續處理

狀態：
- **PARTIALLY RESOLVED**
- UI / query 規則已改善；資料治理未完全制度化

---

## 4. 仍待處理（Open / TODO）

## 4.1 測試資料治理
目前仍建議建立更正式規則：
- 驗收樣本何時刪除
- 驗收樣本何時轉為 `已結案`
- 哪些樣本允許保留但不進 active / overview

狀態：
- **TODO**

---

## 4.2 Closeout / 已結案主線更完整收斂
目前已完成：
- active list 與 active overview 初步分流

但尚未完成：
- active / closeout / archive 全站一致性全面收口

狀態：
- **TODO**

---

## 4.3 搜尋式選廠商的進一步 UX polish
目前已完成 searchable picker。  
仍可補：
- keyboard up/down
- Enter confirm
- Esc close
- blur 行為精修

狀態：
- **TODO（非 blocker）**

---

## 4.4 全站 UI polish round
目前已大量 cleanup，但尚未做全站統一風格回合。

狀態：
- **TODO（次優先）**

---

## 5. 最終管理結論

### 5.1 本輪是否完成？
是。

### 5.2 本輪是否可正式收口？
可以。

### 5.3 最準確的完成描述
- **Project Detail / Dispatch / Homepage / Projects / New Project first full closure complete**
- 若保守表述，也可寫成：
  - **核心主線可驗收版本已完成**

### 5.4 目前系統完成度判斷
- 約 **75–80% 可用產品完成度**
- 核心主線已可用
- 尚未到 100% 全站正式版

---

## 5.5 2026-04-24 後續校正（補記）

本文件記錄的是 2026-04-14 當下的 closure；其後測試站主線又新增了兩條重要校正，若續接 `project detail / dispatch / 文件承接`，不可只停在本文件判斷：

1. **設計 / 備品確認後的正式文件出口已改成 project-level document**
   - 設計：`/projects/[projectId]/design-document`
   - 備品：`/projects/[projectId]/procurement-document`
   - `task-level document` 不再是主出口
2. **`Project Detail` 任務發布區中的工種 / 廠商規則已再往前收斂**
   - `工種` 必須與 `Vendor Data` 同步
   - 選定工種後，`選擇廠商` 清單只能顯示該工種底下的廠商

以上補記以：
- `MD156-projectflow-project-document-routing-and-dispatch-trade-linkage-rules-2026-04-24.md`
為準。

## 6. 下一步建議

### 第一優先
1. 測試資料治理
2. Closeout / 已結案主線正式收斂

### 第二優先
3. 搜尋式選廠商 UX polish
4. 全站 UI polish round

### 文件面
5. 後續若開新輪，應以本文件作為 `MD133` 之後的主 handoff / closure 入口

---

## 7. 一句話總結

> `MD134` 代表在 `MD133` 之後，projectflow 已將 project detail upstream existence、requirements、execution items、三種 dispatch、vendor matching 完整結構版、以及 homepage / projects / new project 的主要 UI cleanup 一起收成可驗收版本；目前最適合的下一輪方向，不再是零碎補功能，而是 **測試資料治理** 與 **Closeout / 已結案主線正式收斂**。
