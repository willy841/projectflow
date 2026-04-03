# MD13 - projectflow UI Polish Handoff - 2026-04-03

本檔為本輪 `projectflow` 前端 UI 收斂工作的正式交接檔。
用途：讓下一個對話 / 下一個 agent 可以直接續接，不必重新猜目前做到哪裡。

---

# 1. 本輪工作主軸

本輪幾乎都在做 `projectflow` 的前端 UI / 互動收斂，沒有碰後端、資料庫、API、server action。

主要收斂區塊：
- 專案列表
- Project Detail 頁首與區塊 header
- 需求溝通
- 專案執行項目
- 專案分類檢視
- Vendor Flow / 廠商需求 / 廠商發包清單
- 任務發布區 -> 交辦 -> 廠商交辦

重要背景：
- 本輪仍嚴格遵守既有總母檔規則
- 不重談已拍板規格
- 以現有已落地 UI 為基礎做精修

---

# 2. 已完成且已收斂的區塊

## 2.1 專案列表（已完成）

已完成：
- 活動日期欄位可點擊排序
- 預設排序為「最新日期在上」
- 搜尋已接通，可搜：
  - 專案名稱
  - 客戶
  - 地點
  - 專案代碼
- 多餘說明文已移除
- `全部專案`、搜尋欄、筆數資訊、header 基準線已多輪收斂

這塊目前可視為已完成，除非再抓到細部視覺 bug，否則不建議回頭打開。

---

## 2.2 Project Detail 頁首（已完成）

已完成：
- 頁首只留主標題
- 移除：
  - 專案代碼
  - 專案狀態
  - 頁首說明文
- 右側按鈕群已統一高度與間距
- header padding / 留白已做過收斂

這塊目前可視為已完成。

---

## 2.3 需求溝通（已完成）

已完成：
- header 說明文移除
- `需求溝通` 標題與 `+ 新增紀錄` 已對齊
- 新增後最新一筆放最上面
- 編輯後會更新修改時間，並自動浮到最上面
- 卡片 spacing 已和左側基本資訊做過一輪節奏收斂

這塊目前功能與排序規則已定稿。

規則：
- 新增 -> 最上面
- 編輯 -> 更新時間並移到最上面

---

## 2.4 專案執行項目（邏輯已驗收通過）

### A. 展開 / 收合邏輯
已完成且使用者已明確驗收通過：
- 主項目為單一展開邏輯
- 切到下一個主項目時，前一個自動收合
- 交辦按鈕 / 表單 / 焦點切換已同步互斥
- 不應再回頭亂改這段邏輯

### B. UI 收斂
已完成：
- `專案執行項目` 標題已與 `新增主項目 / 匯入 CSV` 合併為同一列工具列
- helper copy / 匯入規則已移除
- 主項目卡：
  - 狀態 badge 已移除
  - `幾個次項目` 改為標題旁 icon + 數字
  - 類型 / 數量 / 單位摘要列已移除
  - `主卡摘要` 已淡化
- 次項目卡：
  - 節奏已往主項目靠攏
  - 摘要盒更淡
  - 按鈕高度與寬度已有多輪統一

### C. 任務發布區 -> 交辦 -> 廠商交辦
已完成：
- 刪除 `來源項目：...`
- 刪除 `廠商交辦主層欄位已依 spec v1 收斂`

最新相關 commit：
- `c61817b` — `refactor: simplify vendor assignment saved header`

---

## 2.5 專案分類檢視（大致收斂）

已完成：
- 上方說明文移除
- 三張分類卡（專案設計 / 專案備品 / 專案廠商）各自說明文移除
- 三張分類卡標題已改成水平 + 垂直置中
- `目前檢視` 已移到標題下方
- 展開區的 `共 x 筆` 已移到標題右邊

這塊目前已接近完成。

---

# 3. Vendor Flow / 廠商需求：目前狀態

這是本輪最後仍在來回細修、最容易再打開的一區。

## 3.1 已完成

### A. Vendor 區塊 copy 收斂
已移除：
- `廠商需求` 下方說明文
- `廠商發包清單` 下方說明文

### B. Package 列表 CTA
已完成：
- `查看 Package` 已從藍底改為中性白底描邊風格

### C. 快速建立廠商入口
已多輪調整，最新狀態：
- 由文字按鈕改為小圓形 `+` icon
- 放在 `選擇廠商` 左邊
- 目的：縮到盡量不影響第一列欄位對齊

### D. 欄位對齊（已做很多輪，但仍可能要再修）
目前已做過：
- `任務標題 / 工種 / 選擇廠商`
- `需求說明 / 廠商報價 / 送出`
這兩排的表單節奏重排

也做過：
- `快速建立` 從大文字按鈕 -> 小按鈕 -> 小圓形 `+`
- `送出` 區塊多輪重排

## 3.2 目前仍需留意

使用者多次指出：
- 最右欄 `選擇廠商` 容易被 `快速建立` 影響
- `送出` 容易看起來像亂插進來，不像在同一排格線上
- 所以這塊若再修，不建議再靠微調 padding 補位

### 建議下一步（非常重要）
若下一串要繼續修這塊，建議：

> 直接把 `廠商需求` 卡右欄做成明確的固定 row template，不要再用局部補位。

具體建議：
- 固定三欄兩列
- 第一列：
  - 任務標題
  - 工種
  - 選擇廠商（`+` icon 為附屬，不得破壞 label 基線）
- 第二列：
  - 需求說明
  - 廠商報價
  - 送出
- 固定 label 高度
- 固定 row 高度
- `+` icon 要視為 label 附屬入口，不可視為獨立主按鈕

也就是：
- 下一輪若再修這塊，應視為「右欄版型重構」
- 不要再做零碎的 1~2px 補丁

---

# 4. 部署 / Vercel 事件（重要）

本輪中途曾發生：
- GitHub `main` 已有新 commit
- 但 Vercel deployment list 沒有出現對應新 deployment

## 4.1 已確認過的事
使用者已協助確認：
- Git 連線正常
- Root Directory = `project-mgmt`
- Skip deployments = Disabled
- Ignored Build Step = Automatic
- GitHub `main` 上確實有最新 commit

## 4.2 真正現象
現象是：
- GitHub `main` 更新正常
- 但 Vercel 一度沒有自動收到新 deployment

## 4.3 已採取的處理
為了重觸發 Vercel，已建立空提交：
- `c5ed775` — `chore: trigger vercel redeploy`

這筆空提交成功重新觸發 deployment。

## 4.4 之後若再發生
若之後再次出現：
- GitHub 有最新 commit
- Vercel 卻沒出現新 deployment

建議第一時間：
1. 不要再懷疑是否已 push
2. 先確認 GitHub `main` 上是否有 commit
3. 若 GitHub 有而 Vercel 沒 deployment，可直接做一筆空提交重觸發，驗證 webhook / auto deploy 機制

---

# 5. 系統訊息 `Edit ... failed` 的溝通規則

本輪多次出現：
- `⚠️ 📝 Edit: in ... failed`

已向使用者明確解釋：
- 這代表某次精準 patch 沒命中
- 不代表 repo 壞掉
- 也不代表最後沒改成

之後若再出現這類訊息：
- 應主動翻譯成人話
- 不要讓使用者自己猜

---

# 6. 本輪重要 commit 索引（重點版）

## 專案列表
- `c25e0f1` — `feat: add event date sorting to project list`
- `38d4368` — `feat: enhance project list date sorting and search`
- `759cd68` — `refactor: tighten project list header copy`
- `d453064` — `refactor: simplify project list sorting status copy`
- `944c0a3` — `fix: align project list header content`

## 專案執行項目 / 交辦 / 自動收合
- `355f428` — `fix: keep only one execution item expanded`
- `1c4aead` — `fix: sync execution item panels and forms`
- `b0683ac` — `feat: add collapsible assignment sections in execution tree`
- `6ee61dc` — `refactor: merge execution tree heading into toolbar`
- `a778a37` — `refactor: simplify execution item title metadata`
- `c0733d6` — `refactor: remove execution item meta row`
- `55f8c59` — `refactor: soften execution item summary styling`
- `f9740da` — `refactor: unify execution item badge hierarchy`
- `2f53861` — `refactor: clarify execution item hierarchy`
- `d8395d7` — `fix: unify execution action button widths`
- `2eff1f4` — `fix: match child assignment button sizing`
- `c61817b` — `refactor: simplify vendor assignment saved header`

## Project Detail / requirements / section spacing
- `6ee768c` — `refactor: tighten project detail header`
- `d784313` — `refactor: tighten project detail header actions`
- `2d3d72e` — `refactor: simplify project detail section headers`
- `9972def` — `refactor: tighten project info section header`
- `2655b15` — `refactor: align project detail card spacing`
- `d7ef0e2` — `fix: show newest requirement notes first`
- `2e7a336` — `fix: move edited requirement notes to top`
- `4e525bb` — `fix: align requirements panel header with project info`
- `eecbe6e` — `fix: align project detail card content rows`

## 分類檢視
- `ec0a83c` — `refactor: simplify category board headers`
- `f4944ca` — `refactor: center category titles and move active badge`
- `6dd90e5` — `fix: fully center category card titles`

## Vendor Flow / 廠商需求 / Package
- `353442c` — `refactor: simplify vendor section copy and actions`
- `48de85e` — `refactor: align vendor quick create action`
- `672eb2a` — `fix: align vendor form columns and actions`
- `044e29b` — `fix: align vendor form rows horizontally`
- `bc7d1a5` — `fix: align vendor form labels and submit row`
- `144ab18` — `fix: stabilize vendor field and submit alignment`
- `c2e1f87` — `refactor: use compact vendor quick create icon`
- `fd672d1` — `refactor: minimize vendor quick create icon impact`

## 部署重觸發
- `c5ed775` — `chore: trigger vercel redeploy`

---

# 7. 下一串最建議的續接方式

若下一串要繼續：

## 優先續接點
1. `Vendor Flow / 廠商需求` 右欄欄位與 `送出` 的最終定稿

## 不建議回頭重開的區塊
除非抓到明確 bug，否則不要優先重打開：
- 專案列表排序 / 搜尋
- Project Detail 頁首收斂
- 需求溝通排序規則
- 專案執行項目單一展開 / 自動收合邏輯

## 續接工作方式建議
- 先以此檔作為 handoff 入口
- 不要重談已拍板規格
- 若繼續修 vendor 卡，應直接當成版型重構，而不是碎修 spacing

---

# 8. 一句話總結

本輪已把 `projectflow` 大多數主畫面的 UI 節奏收斂到可驗收狀態；
目前唯一仍值得集中火力收尾的，是 **Vendor Flow / 廠商需求卡右欄的最終格線與對齊**。
