# MD56 - Projectflow Accounting Center Progress and Open Tasks - 2026-04-09

## 1. 目的

本檔作為 `projectflow` 下游主線目前進度整理檔，聚焦：
- `Accounting Center` 已完成內容
- 目前仍待驗收 / 待收斂項目
- 本輪已實作但尚未正式逐區驗收的變更
- 下一步建議工作順序

本檔不取代母檔與既有 spec；用途是讓後續 session 能快速掌握：
- 哪些事情已做完
- 哪些事情已推上 `main`
- 哪些事情還不能視為完成

---

## 2. 主線狀態總結

### 2.1 已鎖版 / 不回頭區域
- `Closeout list`：已正式驗收，UI lock
- `Closeout detail`：已正式驗收，UI 與本輪功能結構 lock

### 2.2 當前下游主線
- 主線已明確切到：`Accounting Center`
- `Vendor detail` 已做深度調整，成熟度高
- `vendor list` 仍未正式宣告 lock
- `Accounting Center` 已進入持續前端收斂與驗收階段，但**尚未正式逐區完成驗收**

---

## 3. 已完成的 Accounting Center 結構性收斂

### 3.1 整體 IA / 畫面骨架
已完成並推上 `main` 的核心方向：
- 首屏改為 `營收概況` 四張摘要卡
- 時間控制已收進營收概況區塊內
- 下半部整併成 `帳務管理` 主工作區
- 第一層 tab：
  - `執行中專案`
  - `管銷成本`
- `管銷成本` 內拆為：
  - `人事`
  - `庶務`
  - `其他`
  - `管銷編輯`

### 3.2 時間控制拆分
已完成：
- 上半部 `營收概況` 時間控制，與下半部工作區月份主體切開
- 下半部月份切換只影響：
  - `執行中專案`
  - `管銷成本`
- 不再連動首屏營收概況

### 3.3 管銷成本輸入 / 輸出分離
已完成：
- `人事 / 庶務 / 其他` 三個 tab 主看記錄
- `管銷編輯` 集中處理輸入 / 編輯
- `管銷編輯` 內再有第二層子 tab：
  - `人事編輯`
  - `庶務編輯`
  - `其他編輯`

### 3.4 人事編輯區重寫成果（已落地）
目前 `main` 上的人事編輯區已不是舊的共用展開區心智，而是重寫後版本：
- `人事費用管理` header 右側保留 `新增員工`
- `正職員工 / 兼職員工` 切換卡已簡化
- 人員名單列已收成資料列
- 點整列 = `預覽 / 收合`
- 點 `編輯` = 該列下方 inline 展開編輯區
- 正職 / 兼職各自吃自己的 draft
- 送出年月保留
- 多數可輸入欄位已可編
- 合計 / 計算型欄位維持唯讀
- 已做 A 版 legacy 清理，拔除舊共用編輯區殘留依賴

### 3.5 文案 / 系統字樣第一輪清理
已完成第一輪：
- 移除 `前端 workflow 驗收版`
- 清掉一部分 header / modal / badge 的系統感字樣
- 使 `Accounting Center` 首屏與部分子區塊更接近產品畫面

---

## 4. 已推上 main 的本輪關鍵 commit（Accounting Center）

以下為本輪與 `Accounting Center` 高度相關的主要 commit：
- `a65b49b` — feat: restructure accounting center workspace
- `db1ee4f` — refactor: tighten accounting center hierarchy
- `3d50051` — refactor: tighten accounting center controls
- `88a81fa` — refactor: separate accounting center time controls
- `a651b2a` — refactor: split accounting expense views and editor
- `a35141f` — refactor: add expense editor sub tabs
- `c44ae15` — refactor: simplify accounting editor sections
- `1532db7` — refactor: add personnel preview and submit month
- `bee8147` — feat: expand personnel editor controls
- `57d8103` — refactor: polish personnel editor states
- `8342ba8` — refactor: tighten expense editor hierarchy
- `661dd7f` — refactor: simplify personnel management header
- `c018ba5` — refactor: tighten personnel list rows
- `fc17cbf` — feat: rewrite personnel editor inline expansion
- `8f3780c` — refactor: align part-time personnel inline skeleton
- `491e9c0` — refactor: remove legacy personnel editor remnants
- `75456f7` — refactor: remove accounting center system copy

---

## 5. 目前已完成但尚未正式逐區驗收的內容

### 5.1 人事編輯區
目前狀態：
- 已重寫且已在 `main`
- 已不是舊共用展開區
- 已完成 A 版 legacy 清理

但尚未正式逐項驗收：
- inline 預覽 / 編輯位置與節奏是否完全符合使用者預期
- 正職 / 兼職展開區細節是否與使用者調整過的 UI 完全一致
- 欄位命名、排序、群組標題是否需要第二輪產品化清理

### 5.2 庶務編輯 / 其他編輯
目前狀態：
- 結構已分清 tab 層級
- `庶務項目 / 其他項目` 已做第一輪層級收斂

但尚未正式逐區驗收：
- header、按鈕位置、列表密度是否最終合格
- 文案是否仍帶有系統感
- modal / drawer / 提示文案是否需第二輪清理

### 5.3 記錄頁（人事 / 庶務 / 其他）
目前狀態：
- 可用
- 仍有不少系統感標題與說明文殘留

尚未正式逐區驗收：
- `查看詳情` 是否應改更產品化語言
- `記錄區 / 區 / 查看區 / 摘要區` 等命名是否應全面重命名
- drawer 標題與內容群組是否需第二輪清理

### 5.4 營收概況區
目前狀態：
- 骨架正確
- 首屏權重已建立

尚未正式逐區驗收：
- 四張卡 hint 是否全部改為產品語言
- 是否仍殘留 `Closeout / 承接 / 對齊 / 公式型說明`
- 首屏文案與卡片密度是否需要第二輪收斂

### 5.5 執行中專案區
目前狀態：
- 主結構已在正確層級
- 表格與 summary 已可用

尚未正式逐區驗收：
- `查看詳情` 文案是否應更具體
- summary 與 table 權重是否合理
- 與整體帳務中心調性是否一致

---

## 6. 已確認存在的系統感 / 待清文案群

已盤點出仍可能殘留或需要第二輪清理的方向：
- `記錄區` / `查看區` / `摘要區` / `區`
- `drawer` / `modal` / `workflow`
- `編輯頁` / `預覽頁` / `模式` / `結構`
- `Closeout` / `承接` / `正式對齊` 這類偏規格語言
- `查看詳情` 這類過度通用的系統文案
- 某些互動提示仍帶有開發階段口吻

---

## 7. 目前待完成任務清單

### 高優先
1. 正式驗收 `人事編輯區`
   - inline 展開互動
   - 預覽 / 編輯切換
   - 送出後收合
   - 正職 / 兼職完整檢查

2. 第二輪清理 `Accounting Center` 系統文案
   - 主抓：Header 周圍、tab、記錄頁、modal、drawer、提示文案

3. 逐區驗收 `庶務編輯 / 其他編輯`
   - 結構
   - 文案
   - 名稱
   - 互動節奏

### 中優先
4. 驗收 `人事 / 庶務 / 其他` 記錄頁
5. 驗收 `營收概況` 四卡與時間控制
6. 驗收 `執行中專案` summary + table

### 低優先 / 後續
7. 若全部 UI 驗收通過，再討論更深層文案一致性
8. 若使用者要求，再做 `Accounting Center` 的正式 UI lock 文件

---

## 8. 下一步建議順序

建議後續主線順序：
1. 先驗 `人事編輯區`（因為這區剛完成重寫）
2. 再驗 `庶務編輯 / 其他編輯`
3. 再收第二輪系統文案清理
4. 再回頭驗 `營收概況`
5. 最後驗 `執行中專案`

---

## 9. 風險提醒

1. `Accounting Center` 仍在持續收斂中，不能誤判為已全線 lock
2. `Closeout list/detail` 已 lock，不應回頭修改 UI
3. `vendor list` 尚未正式 lock，不應誤記為已封版
4. 人事編輯區雖已重寫，但仍需使用者正式驗收後，才可視為穩定版本

---

## 10. 與母檔 / MD55 / MD54 對齊確認

### 10.1 與 `MD-MASTER` 的對齊判斷
目前方向**未偏離母檔主線**。

理由：
- 母檔已明確指出 2026-04-08 後下游主線集中在 `Closeout / Vendor Data / Accounting Center`
- 目前實際工作重心確實放在 `Accounting Center`
- 本輪並未把主線拉回上游，也未另開新的資料層主線
- 仍維持前端 / mock / local state 邊界，未偷跑 DB / persistence

### 10.2 與 `MD55` 的對齊判斷
目前方向**與 MD55 完全一致**。

理由：
- `Closeout list / detail` 仍被視為 UI lock，未回頭重改
- `Vendor detail` 成熟度高但 `vendor list` 未正式 lock，這一判斷未變
- `Accounting Center` 仍是目前下游剩餘最大驗收主體

### 10.3 與 `MD54` 的對齊判斷
目前方向**與 Accounting Center 母 spec 一致**。

理由：
- 仍維持 `營收概況 / 執行中專案 / 管銷成本` 三大主區塊
- `營收概況` 仍作為 summary layer
- `執行中專案` 仍作為逐案收款追蹤層
- `管銷成本` 仍作為營運支出管理層
- 未把三大區塊混成單一頁面責任，也未與 `Closeout` / `Vendor Data` 混線

### 10.4 目前真正需要警覺的事
目前風險**不是偏航**，而是：
- 容易停留在持續微修 / 持續 polish
- 若沒有正式驗收節奏，容易一直細修卻不宣告完成

因此後續主線應強化為：
1. 逐區驗收
2. 驗收後再決定 lock
3. 不再無限制擴張新需求

---

## 11. 一句話總結

`Accounting Center` 已從雜亂的長頁平鋪版本，收斂成有主次、可切換、可驗收的管理頁；其中人事編輯區已完成重寫並清理第一批 legacy 殘留。當前主線不再是做新功能，而是：**逐區驗收 + 第二輪系統文案清理 + 最終收斂與鎖版判定。**
