# MD123 — projectflow post-MD108 Phase P1 validation hardening fix progress (2026-04-13)

> Status: ACTIVE / FIX-PROGRESS  
> Phase: post-MD108 / Phase P1  
> Role: 補記 `MD122` 之後已經開始進行的實際修補、重新驗收與目前仍未完全綠燈的剩餘缺口。  
> Important: 本文件不是最終 closure；是「已從純 probe 進到實際修補」的進度紀錄。

---

## 1. 本輪已實際修補的內容

### 1.1 closeout retained read-model schema gap 已修正
已發現：
- `src/lib/db/closeout-list-read-model.ts`
- 原本使用錯誤表名：`financial_manual_cost_items`
- 但 repo / migration / API / adapter 實際正式表名為：`financial_manual_costs`

已修正：
- `financial_manual_cost_items` -> `financial_manual_costs`

已驗證：
- `npm run build` 通過

正式意義：
- closeout retained 這條從「schema gap 明確阻塞」往前推了一步
- 這不是測試調整，而是實際 runtime/schema 對齊修復

---

### 1.2 vendor group route 正式格式已被再次確認
已確認：
- vendor group route id 不是 `projectId::vendorId`
- 正式格式為：
  - `projectId~vendorId`

已實測：
- 使用 `~` 可正常進入 group page
- 使用錯格式會 404

正式意義：
- vendor Phase P1 的 route/source-map 風險已被具體定位，不再模糊

---

### 1.3 quote-cost detail selector 已完成第一輪收斂
已發現：
- `quote-cost` 頁面存在文案重複命中
- `成本管理` 同時命中 banner 與 section heading

已修正：
- Phase P1 financial 測試從 `getByText('成本管理')`
- 收斂為 `getByRole('heading', { name: '成本管理' })`

正式意義：
- quote-cost 這條已從「頁面對不上」往前推到「submit -> DB truth」層級

---

## 2. 重新驗收後的最新判斷

### 2.1 design line
目前狀態：
- probe 已存在
- confirm/snapshot 主線仍未完全 closure
- 仍屬 latest confirmation / DB truth 驗收穩定性問題

### 2.2 procurement line
目前狀態：
- DB 實查已證明 overwrite snapshot 可寫入
- 問題主要落在 Playwright 驗收層如何穩定抓到最新 confirmation

### 2.3 vendor line
目前狀態：
- route/source-map 已更清楚
- group -> package 可走
- 但 latest snapshot 的穩定 readback 驗收仍未綠燈

### 2.4 quote-cost / closeout retained
目前狀態：
- schema gap 已修正一條
- selector/source-map 已收斂一條
- 現在剩下的核心問題與 execution lines 相似：
  - UI submit / create 後
  - DB truth poll 的穩定性仍需再收斂

---

## 3. 本輪後，Phase P1 真正剩餘的核心問題類型

經過 probe + fix-progress 兩輪後，P1 的主要問題已高度收斂為三類：

### A. latest confirmation / latest snapshot 驗收穩定化
涉及：
- design
- procurement
- vendor

### B. UI submit -> DB truth poll 驗收穩定化
涉及：
- quote-cost collection
- execution lines confirm
- vendor group confirm

### C. route / selector / schema source-map 對齊
目前已部分處理，但仍需在剩餘測試中持續收斂

---

## 4. 下一步建議（延續）

### 優先順序
1. procurement 驗收穩定化
2. design 驗收穩定化
3. vendor latest snapshot 驗收穩定化
4. quote-cost collection DB truth 驗收穩定化
5. 最後再做 closeout retained timing baseline

### 原因
- procurement 已有最明確的 DB truth 正向證據
- closeout retained baseline 已不再是 schema 完全阻塞，可延後到前面幾條穩定後再量

---

## 5. 一句話總結

> `MD123` 的重點不是再做一次盤點，而是明確記錄：Phase P1 已從 probe 進到實際修補。到目前為止，已修掉 closeout retained 的錯表名、已鎖定 vendor group route 正式格式、已收斂 quote-cost selector；剩下未完全綠燈的問題，主要集中在最新 confirmation/snapshot 與 UI submit -> DB truth 的驗收穩定化。