# MD169 — projectflow UI visual sync completion status — 2026-04-27

Status: ACTIVE / STATUS SNAPSHOT
Purpose: 盤點目前 `projectflow` UI 視覺同步任務的實際完成度，只記錄已落地、可驗證、可追 commit 的內容；不把未完成項包裝成已完成。

---

## 1. 判定基準

本盤點只把以下條件都成立的項目列為「已完成」：
1. 已有實際改檔
2. 有對應 commit 可追
3. 至少有 build 或正式驗收可支撐

若只有討論過、開始過、或原本想做但未收斂交付，不列入已完成。

---

## 2. 已完成同步的頁面 / 區塊

### A. Project Detail 核心樣板頁
狀態：已完成樣板化 / 已多輪 dark-theme 視覺改造
說明：
- 本輪 UI 視覺同步的核心標準頁就是 `Project Detail`
- 後續其他頁面的同步標準，均以這頁的 dark-glass / material hierarchy / button family / card family 為準

相關代表 commit（歷史主線）：
- `942213f` — `style: finish project detail dark-theme pass`
- `8d9e318` — `style: deepen project detail assignment panels`
- `b68f310` — `style: reconstruct project detail material hierarchy`

### B. Shared primitives / global dark-glass foundation
狀態：已完成第一輪基礎共用樣式
已落地：
- `src/app/globals.css`
- 共用 dark-glass 卡片 / 表單 / 按鈕 / badge / table shell / vendor pills 等基礎樣式

相關 commit：
- `33b6001` — `style: align shared admin surfaces with detail standard`
- `36db93c` — `style: align vendor surfaces with detail standard`

### C. Auth / error / system 基礎頁
狀態：已完成第一輪同步
已完成頁面：
- `/login`
- `/reset-password`
- `/forbidden`
- global error
- not-found
- `/system-settings`

相關 commit：
- `33b6001`

### D. Vendor packages 線
狀態：已完成第一輪同步
已完成頁面：
- `/vendor-packages`
- `/vendor-packages/[id]`

相關 commit：
- `33b6001`

### E. Accounting center
狀態：已完成第一輪同步
已完成頁面：
- `/accounting-center`

說明：
- 已同步上層 shell、營收概況、帳務管理 header、active projects table 與主要切換控件

相關 commit：
- `33b6001`

### F. Vendor data 線
狀態：已完成第一輪同步，且後續已用正式驗收方法確認功能主線未回歸
已完成頁面：
- `/vendors`
- `/vendors/[id]`

已完成內容：
- vendor list header / 搜尋區 / trade pills / trade manager / cards / create modal / delete modal
- vendor detail header / profile card / tab pills / unpaid / history / dialog / fallback states
- 按鈕顏色依使用者規則分流：
  - 一般按鈕 → 交辦區按鈕系統
  - 新增類型按鈕 → 首頁 `新增專案` 按鈕色系

相關 commit：
- `36db93c`

驗證：
- `npm run build` 通過
- 後續以正式 acceptance v2 相關主線重測：PASS

### G. Execution 區 header create 斷線修復
狀態：功能修正完成（不是純視覺同步，但屬本輪 UI 變動相關收尾）
說明：
- `+ 新增主項目` header-level action 曾因 UI 結構調整斷線
- 已修回由外部 state 直接控制 create flow

相關 commit：
- `2712dbb` — `fix: reconnect execution header create action`

---

## 3. 明確未完成 / 尚未全面同步的頁面

以下頁面目前不能宣稱已全面對齊 `Project Detail` 標準：

### A. Projects 線
- `/projects`
- `/projects/new`

### B. Design 線
- `/design-tasks`
- `/design-tasks/[id]`

### C. Procurement 線
- `/procurement-tasks`
- `/procurement-tasks/[id]`

### D. Quote-cost 線
- `/quote-cost`
- `/quote-cost/[id]`
- `/quote-costs`
- `/quote-costs/[id]`

### E. Vendor assignments 線
- `/vendor-assignments`
- `/vendor-assignments/[id]`

### F. Closeout 線
- `/closeout`
- `/closeout/[id]`
- `/closeouts`
- `/closeouts/[id]`

### G. Home overview / dashboard
- `/`

說明：
- 上述有些頁面歷史上曾做過 dark-glass rollout 嘗試
- 但本文件只認列「目前可明確追到、已收斂交付」的狀態
- 因此不把它們全部算進已完成同步

---

## 4. 不建議現在動的方向

### A. 不建議再回頭用 patch 方式無限補白底
原因：
- `MD165` 已明講，這條路容易變成局部修補，不容易真正達到 premium visual quality

### B. 不建議把「尚未同步」直接包裝成「只差微調」
原因：
- 現況不是全站只剩小修，而是仍有多條頁面主線未明確收斂交付

### C. 不建議把 UI 同步與功能修正混做
原因：
- 目前正式驗收主線已穩定，UI 視覺同步應維持純視覺路線

---

## 5. 下一輪建議同步順序

若要繼續推進，建議順序如下：

### 第一優先
1. `/projects`
2. `/projects/new`
3. `/design-tasks`
4. `/procurement-tasks`

原因：
- 這幾頁與 `Project Detail` 主線最直接相連
- 也是使用者最常見、最容易感受到風格不一致的地方

### 第二優先
5. `/quote-cost`
6. `/quote-cost/[id]`
7. `/quote-costs`
8. `/quote-costs/[id]`

原因：
- financial 主線重要，但 UI 區塊較重，應在第一優先完成後再集中處理

### 第三優先
9. `/vendor-assignments`
10. `/vendor-assignments/[id]`
11. `/closeout`
12. `/closeouts`

原因：
- 功能與資料密度高，較適合在前兩批穩住後再做

### 第四優先
13. `/`

原因：
- 首頁雖顯眼，但不一定是最需要先與 `Project Detail` 完整收斂的頁面
- 可視整站節奏最後再統一

---

## 6. 一句話結論

> 目前 `projectflow` UI 視覺同步屬於「核心樣板頁已建立、部分高可見頁面已完成第一輪同步、vendor data 線已完成且正式驗收綠燈，但整體仍非全站完成版」的狀態。
