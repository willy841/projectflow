# MD14 - projectflow 進度總盤點與下一步建議交接（2026-04-04）

> 用途：把目前 `projectflow` 的整體進度、成熟度判斷、以及後續最合理的處理方向整理成一份可直接續接的 handoff。
> 適用情境：新對話 / 新 agent / 後續規劃時，若想快速理解「現在做到哪」與「接下來該往哪裡做」，應先讀本檔，再回查母檔。
> 本檔不重複所有細節規格；高階規格與正式 source of truth 仍以 `MD-MASTER-projectflow-system-source-of-truth.md` 為準。

---

# 1. 一句話總結

`projectflow` 現在已不在「還在打底」階段。

目前狀態更準確地說是：

> **核心主線大致成形，已進入正式驗收模式；接下來應從持續補 UI，轉向驗收、補真正缺口、並決定下一條產品主線。**

---

# 2. 整體進度盤點

## 2.1 專案主體：`/projects` + `Project Detail`
### 目前進度
- **約 85%～90%**

### 已完成
- `Project Detail` 已回到主體地位
- 骨架已明確：
  - 專案背景總覽
  - 基本資訊 / 需求溝通
  - execution tree
  - 任務檢視
  - vendor flow
- 首排卡片已重整成更穩的三組主卡
- 成本摘要已承接 workflow 主線
- `/projects` 已更像正式管理入口
- 專案列表搜尋 / 排序 / 欄位閱讀節奏已多輪收斂
- `/projects` 表格欄寬、數字欄對齊、進度欄節奏都已做一輪成熟度收尾

### 尚未完全完成
- `/projects` 仍有小型表格成熟度微調空間
- `Project Detail` 首排卡節奏雖已成熟，但若再往上磨，應靠正式驗收決定，而不是先主動大修
- inline 編輯與主控台閱讀模式之間，長期仍可再做更正式切分

### 判斷
- **這塊已不是優先補洞區。**
- 後續應先驗收，再決定要不要做成熟度級細修。

---

## 2.2 設計線：`/design-tasks` + Project Detail 內設計流程
### 目前進度
- **約 75%～80%**

### 已完成
- 已有設計交辦 -> 回覆 -> 確認 -> 整理 -> 文件的第一輪閉環
- confirmed reply 已可進 workflow cost
- `design-tasks` 已不是單純 mock 頁
- 工作台方向正確，已符合跨專案總表心智

### 尚未完全完成
- 卡片密度、資訊格數量、CTA 節奏仍有成熟度收斂空間
- 文件整理層 / 文件輸出層仍偏第一輪 MVP
- 若要再上升一階，未來可能需補更正式的深連結 / detail route

### 判斷
- **功能主線已成立，但成熟度還沒完全封板。**

---

## 2.3 備品線：`/procurement-tasks` + Project Detail 內備品流程
### 目前進度
- **約 75%～80%**

### 已完成
- 已有備品交辦 -> 回覆 -> 確認 -> 整理 -> 文件的第一輪閉環
- confirmed reply 已可進 workflow cost
- `procurement-tasks` 已成跨專案工作台
- 與設計線的語言、狀態、結構已逐步對齊

### 尚未完全完成
- 卡片密度與工作台成熟度仍有提升空間
- 文件整理 / 文件輸出仍偏 MVP
- 若要更成熟，未來可能需補專用 detail / 深連結心智

### 判斷
- **與設計線同級，屬於可運作但未完全封板。**

---

## 2.4 Vendor Flow：Project Detail 內廠商區 + `/vendor-packages`
### 目前進度
- **約 80%～85%**

### 已完成
- pre-issue / post-issue 主線明確
- 同專案 + 同廠商 package 規則已成立
- `vendor-packages` 列表與 detail 已從半成品頁收成正式 package 管理頁 / 發包整理頁
- CTA 語言已明確
- 導航定位 / activePath 已修好
- `vendor-packages/[id]` 已更像左主右輔的成熟整理頁

### 尚未完全完成
- `vendor-packages/[id]` 文件預覽區仍可再做成熟度級排版精修
- pre-issue 卡片欄位密度仍偏重，若資料量大，仍需靠實際驗收再判斷
- 目前仍屬 workflow / local state MVP，不是正式資料層

### 判斷
- **主結構已可用，不應再重開主流程討論。**

---

## 2.5 報價成本：`/quote-costs` / `/quote-costs/[id]`
### 目前進度
- **約 85%～90%**

### 已完成
- 三條線成本已開始承接進來
- seed / workflow 主從與去重已收斂
- 主成本區 / 次成本區 / 例外項有清楚分層
- 進行中頁與結案頁已開始拉開人格
- 成本主線與 `Project Detail` 頂部摘要已對齊

### 尚未完全完成
- 目前仍是 localStorage MVP
- 若未來要正式升級，還要決定是否完全放棄 seed，或定義更正式的唯一資料源
- 長期看，這是最值得正式產品化的模組之一

### 判斷
- **目前是系統裡最成熟的模組之一。**

---

## 2.6 結案：`/closeouts` / `/closeouts/[id]`
### 目前進度
- **約 80%～85%**

### 已完成
- 路由與 activePath 已統一
- archive / 留存語氣已開始與進行中頁分開
- 列表與 detail 已有清楚的結案池心智

### 尚未完全完成
- 頁面人格雖已分開，但若未來再收，應偏向 archive 感與資訊保留感，而不是補更多功能

### 判斷
- **已從系統破口變成可驗收頁。**

---

## 2.7 廠商模組：`/vendors` / `/vendors/[id]`
### 目前進度
- **約 70%～75%**

### 已完成
- vendor list / detail 已存在
- 搜尋 / 工種篩選 / 未付款總額 / detail / quick create / 編輯 / 刪除 / 未付款專案管理都已具備
- vendor detail 主線已算清楚：
  - 主檔
  - 未付款
  - 歷史往來

### 尚未完全完成
- 這塊是目前最像「功能夠、但管理台成熟感還不足」的模組之一
- vendor list 還不夠像高密度管理頁
- vendor detail 還有一些工程語言與 CTA 層級可再收
- 與 quote-cost / vendor flow 相比，成熟度仍有落差

### 2026-04-04 補充更新：工種可管理化已落地
本輪已完成一個重要補強：
- 工種不再是寫死常數
- 已改成 vendors 模組內可管理的共用來源
- 管理入口放在 `/vendors` list 頁的輕量區塊內
- `/vendors/[id]` 與 vendor 建立流程已同步吃同一份工種清單
- 新增工種已支援 trim / 禁止空值 / 禁止重複
- 已被任何 vendor 使用中的工種禁止刪除

正式判讀：
> vendors 模組目前已從「只能用固定工種」提升到「具備基本工種治理能力的 MVP」。

但仍需記住：
- 目前仍是 local state / localStorage MVP
- 這次補的是工種治理能力，不代表整體 vendors 模組已完全封板

### 判斷
- **這仍是接下來很值得集中處理的一塊，但成熟度已比前一版再往上一步。**

### 2026-04-04 中午補充更新：Vendor 財務承接第一版已落地
本輪 vendors 模組又往前補了一段關鍵主線：
- `quote-costs / closeouts` 與 `vendors` 已開始共用 `projectId + vendorId` 的共享財務 relation
- vendor list 未付款總額已改吃共享 relation
- vendor detail 的未付款區 / 歷史往來區已改吃共享 relation
- `標記為已付款` 已可寫回共享 relation
- `quote-costs / closeouts` 也已開始承接同一份付款狀態結果

正式判讀：
> vendors 模組目前已不只是 vendor 主檔與工種管理頁，而是開始承接真正的「專案 × 廠商」財務關係。

但仍需記住：
- 目前仍是 localStorage MVP
- vendor identity 與正式主檔 id 仍未完全對齊
- 這是第一版閉環，不代表財務資料層已完全封板

---

# 3. 整體狀態總判斷

## 3.1 現在整體可怎麼描述
目前整個系統可以這樣定義：

1. **核心主線已建立**
   - Project Detail 主控台
   - 設計 / 備品工作台
   - Vendor Flow
   - Quote Cost
   - Closeouts
   都已不只是概念，而是可操作系統

2. **目前最大的風險不再是 UI 崩壞**
   - 接下來如果再一直補 UI，很容易進入邊際效益遞減
   - 應開始把注意力放到：
     - 驗收
     - 補真正缺口
     - 決定下一條產品主線

3. **整體仍是 MVP**
   - 多數主線仍是 mock / local state / localStorage MVP
   - 不是正式後端產品
   - 這是接下來中期最重要的戰略判斷點

---

# 4. 接下來應該往哪邊繼續處理

## 4.1 路線 A：正式驗收主線頁（最建議）
### 適用情境
如果現在的目標是：
- 確認這波收斂到底夠不夠
- 先把成果變成可交付 / 可展示 / 可進下一階段狀態

### 原因
現在最缺的不是再多修一點 UI，
而是：

> **確認哪些頁真的已過關，哪些只是還沒被實際點到。**

### 驗收頁面優先順序
1. `/projects`
2. `/projects/[id]`
3. `Project Detail` 內 vendor 區
4. `/design-tasks`
5. `/procurement-tasks`
6. `/quote-costs`
7. `/quote-costs/[id]`
8. `/closeouts`
9. `/closeouts/[id]`
10. `/vendor-packages`
11. `/vendor-packages/[id]`
12. `/vendors`
13. `/vendors/[id]`

### 判斷
- **這是現在最建議的下一步。**

---

## 4.2 路線 B：集中補 `vendors` 模組成熟度
### 適用情境
如果現在更在意的是：
- 整個系統裡哪個模組成熟度最落後
- 想補一塊相對弱的管理模組

### 優先指向
- `/vendors`
- `/vendors/[id]`

### 原因
目前它是：
- 功能已具備
- 但管理台感不足
- 和主線模組相比，成熟度落差最明顯

### 若走這條線，建議處理內容
1. vendor list 進一步收成高密度管理頁
2. 刪除動作降權
3. vendor detail 去掉工程語言 / demo 語氣
4. 主檔 / 未付款 / 歷史區的主次再拉開
5. 補強 vendor 模組與 quote-cost / vendor flow 的關係感

### 判斷
- **如果不先驗收，這是最值得開下一輪的模組。**

---

## 4.3 路線 C：進入正式資料層規劃（中期重要，但不建議立刻開）
### 適用情境
如果現在已經開始在意：
- 這些資料不能永遠只放 localStorage
- 成本、回覆、package、結案、vendor 之間未來要怎麼正式連動

### 這條線會碰到的事
- 設計 / 備品 / vendor / quote-cost 的正式資料模型
- package / document / cost item 關係
- closeout 狀態切換
- vendor 未付款關係
- 從 localStorage MVP 過渡到正式 persistence

### 判斷
- **這條是中期最重要，但不一定是現在立刻要做的下一步。**

---

# 5. CPO 最後建議

## 5.1 我現在最推薦的順序
### 第一優先
- **先正式驗收**

### 第二優先
- 驗收後，集中補 `vendors` 模組

### 第三優先
- 再來才討論正式資料層

## 5.2 原因
因為現在核心主線已經夠成熟，
你最需要的是：
- 確認哪些真的過關
- 哪些還只是看起來差不多
- 哪些值得開下一輪

而不是無止境再補 UI。

---

# 6. 若下次要續接，建議怎麼叫回來

可直接這樣說：
- `請先讀 MD14-projectflow-progress-review-and-next-step-handoff-2026-04-04.md，幫我決定下一步。`
- `請以 MD14 為準，直接進正式驗收模式。`
- `請以 MD14 為準，直接開 vendors 模組下一輪收斂。`
- `請先讀 MD14，再幫我規劃正式資料層。`

---

# 7. 一句話交接

> `projectflow` 現在核心主線已大致成形，最佳下一步是先正式驗收；若不先驗收，最值得開下一輪的是 `vendors` 模組；更中期的關鍵才是正式資料層。