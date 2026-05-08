# MD212 — projectflow B2 parity closure and manual cost alignment — 2026-05-08

Status: ACTIVE / CLOSURE + NEXT-STEP HANDOFF  
Parent:
- `MD199-projectflow-source-of-truth-declaration-v1-2026-05-08.md`
- `MD203-projectflow-b2-a-6-section-replyoverrides-and-design-procurement-readback-replacement-spec-2026-05-08.md`
- `MD207-projectflow-vendor-residual-assignment-fallback-replacement-shape-2026-05-08.md`
- `MD208-projectflow-vendor-package-bridge-async-db-adoption-plan-2026-05-08.md`
- `MD209-projectflow-vendor-package-preload-first-live-adoption-entrypoint-2026-05-08.md`
- `MD210-projectflow-vendor-package-live-adoption-blocker-at-detail-client-boundary-2026-05-08.md`
- `MD211-projectflow-b2-mainline-handoff-and-next-step-command-2026-05-08.md`

---

## 0. 這份文件在做什麼

這份文件用來正式記錄：

1. 本輪已完成 quote-cost preload parity 的真實驗證
2. 真 mismatch 並不在 vendor residual / design / procurement
3. 真 mismatch 落在 manual cost treatment
4. manual cost parity 已補齊並驗證歸零
5. 下一層工作不應再回頭猜 parity，而應直接往 wrapper / transitional retirement 前進

---

## 1. 本輪真正驗到的事

本輪不是只做 code cleanup，也不是只補文件。

本輪實際做了：
- 補強 parity compare 輸出
- 跑 live parity API
- 抓到真 mismatch source
- 修正 manual cost treatment
- 重跑 runtime parity
- 驗到 mismatch 歸零

---

## 2. 先前誤判被校正的地方

### 2.1 `department-store-display-2026` 並不是 formal quote-cost DB parity universe 的有效 project

當直接打：
- `/api/internal/quote-cost-preload-parity/department-store-display-2026`

回傳：
- `quote cost project not found`

結論：
- 不能再把這個 project 當作本輪 parity 驗證 target
- quote-cost parity 應以 formal DB financial project universe 為準

### 2.2 `MD210` 的 blocker 描述已部分過時

實際 repo 現況已確認：
- `src/app/quote-costs/[id]/page.tsx` 已 preload：
  - `preloadedDbPackages`
  - `preloadedFormalRows`
- `QuoteCostDetailClient` 已接：
  - `preloadedDbPackages`
  - `preloadedFormalRows`

也就是：
- detail client boundary 已不是「完全未打通」狀態
- 比較準確的說法應是：
  - **boundary 已打通**
  - 但 parity / treatment / residual logic 仍需逐段校正

---

## 3. 本輪 parity 真結果

在 runtime 刷新後，正式跑：
- `/api/internal/quote-cost-preload-parity`

第一次取得的真結果：
- `projectCount = 19`
- `mismatchProjectCount = 3`

且三個 mismatch project 的 `mismatchSourceTypes` **全部都只剩：**
- `人工`

代表：
- design / procurement preload path 已與 DB detail read model 對齊
- vendor residual preload path 已與 DB detail read model 對齊
- 真正未對齊的是 manual cost treatment

---

## 4. 真 root cause

manual cost mismatch 的根因不是 DB 讀不到，也不是 vendor residual package source 不對。

真正 root cause 是：

### 4.1 parity compare 的 preload side 只組 workflow-derived items
也就是：
- design
- procurement
- vendor

但沒有把 manual DB items 納進 preload side compare。

### 4.2 detail overlay 也存在 manual item preserve 問題
在 detail client 上：
- fallback/preload cost items 會覆蓋 costItems
- 若不明確保留 manual items，manual 資料可能被洗掉或 compare 時被漏算

---

## 5. 本輪已做的修正

### 5.1 parity compare shape 補強
檔案：
- `src/lib/db/quote-cost-preload-parity.ts`

新增：
- `dbSourceTotals`
- `preloadSourceTotals`
- `mismatchSourceTypes`

用途：
- 讓 parity 不只知道總數不對
- 還能直接知道是哪個 sourceType 不對

對應 commit：
- `9100628` — `refactor: expose quote cost parity source totals`

---

### 5.2 parity compare source key / numeric normalization
檔案：
- `src/lib/db/quote-cost-preload-parity.ts`

處理：
- sourceType key normalization：
  - `design -> 設計`
  - `procurement -> 備品`
  - `vendor -> 廠商`
  - `manual -> 人工`
- preload / db 兩邊 `adjustedAmount` 轉為 number 後再 compare

用途：
- 排除命名差異 / 型別差異造成的假 mismatch

對應 commit：
- `2f344b6` — `refactor: normalize quote cost parity source comparison`

---

### 5.3 manual cost treatment alignment
檔案：
- `src/lib/db/quote-cost-preload-parity.ts`
- `src/components/quote-cost-detail-client.tsx`

處理：
- preload parity side 改成：
  - manual items 直接沿用 DB detail read model 既有 manual items
  - workflow preload 只提供非 manual items
- detail overlay merge 改成：
  - preserve manual items
  - preload/fallback 僅覆蓋非 manual items

用途：
- 讓 manual 不再被誤當成 workflow preload 本來就該提供的 source
- 也避免 detail overlay 把 manual item 洗掉

對應 commit：
- `39e250d` — `fix: align quote cost parity manual cost treatment`

---

## 6. 最終驗證結果

在刷新 `project-mgmt` runtime 後重跑：
- `/api/internal/quote-cost-preload-parity`

最終結果：
- `projectCount = 19`
- `mismatchProjectCount = 0`

這代表：
- preload path vs DB detail read model
- 在目前 formal quote-cost project universe 內
- 已經正式對齊

---

## 7. 本輪完成定義

本輪可視為完成，因為已達成：

1. 不再猜 mismatch 在哪
2. 已用 runtime parity 找到真 source
3. 已證明不是 vendor residual / design / procurement mismatch
4. 已修 manual cost treatment
5. 已 build 通過
6. 已 runtime parity 驗到歸零

---

## 8. 對下一輪的明確影響

既然 parity 已歸零，下一輪就**不應再重跑同一輪診斷當主要工作**。

下一輪應直接前進到：

### Priority A
退休下一層 local transitional wrapper / compatibility surface

### Priority B
鎖定仍留在主線裡但已不再需要當正式 truth 的 transitional 函式，例如：
- `getMockFormalReadbackRowsForCost()`
- `workflow-vendor-package-bridge.ts` 內 formal-row fallback / assignment fallback 殘留
- `workflow-derived-board.ts` 內 local transitional path

### Priority C
在 parity 已歸零前提下，再做小刀 retirement，且每刀都要：
- build
- 必要時重跑 parity
- 若有 runtime consume path 變動，再跑 targeted formal acceptance

---

## 9. 不要再做的事

下一輪不要：
- 再把 `department-store-display-2026` 當 parity 主 target
- 再把 `MD210` 的舊 blocker 描述當現況真相
- 再花一輪時間只重複確認 manual mismatch 是否存在

因為這些都已經在本輪被驗清楚了。

---

## 10. 下一輪最推薦的起手式

下一個 session / 下一輪若要接，建議直接：

1. 先讀：
   - `MD211-projectflow-b2-mainline-handoff-and-next-step-command-2026-05-08.md`
   - `MD212-projectflow-b2-parity-closure-and-manual-cost-alignment-2026-05-08.md`
2. 直接挑一個 transitional wrapper retirement target
3. 每切一刀後：
   - `npm run build`
   - 必要時重跑 `/api/internal/quote-cost-preload-parity`
4. 若 parity 被打壞，優先修回 parity，再繼續 retirement

---

## 11. 一句話總結

> **B2 本輪已正式把 quote-cost preload parity 驗到歸零；真 mismatch 只在 manual cost treatment，且已修正完成。下一輪不該再停在 parity 診斷，而應直接前進到 transitional wrapper / compatibility surface retirement。**
