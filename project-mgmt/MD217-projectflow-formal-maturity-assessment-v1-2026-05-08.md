# MD217 — projectflow formal maturity assessment v1 — 2026-05-08

Status: ACTIVE / ASSESSMENT

Parent:
- `MD216-projectflow-formal-maturity-criteria-v1-2026-05-08.md`
- `MD213-projectflow-b2-active-mainline-retirement-closure-2026-05-08.md`
- `MD214-projectflow-b2-tail-cleanup-closure-2026-05-08.md`
- `MD215-projectflow-b2-hundred-percent-tail-closure-2026-05-08.md`

---

## 0. 評估範圍與排除項

本評估嚴格依 `MD216` 執行。

### 明確排除

以下 **不納入** 成熟度判定：
- 是否新增系統指引文字
- 是否再調整 UI
- 是否補頁面說明文案

本評估只看：
- 資料 truth source
- active mainline
- cross-page consistency
- 修改可控性
- 驗證可重複性
- legacy/fallback 受控程度
- 後續擴充可維護性

---

## 1. 總結判定

### 1.1 先講結論

**目前的 `projectflow`，不建議直接對外整體宣稱為「已全面成熟的正式系統」。**

但同時也必須明確指出：

> **在本輪處理的核心主線（尤其是 active quote-cost preload / bridge / detail mainline）上，已可評為「正式主線水準」甚至「接近成熟主線」。**

換句話說：
- **整體系統：接近正式化，但不建議一口氣蓋章為全面成熟**
- **核心主線：已正式收斂，成熟度高**

---

## 2. 依 MD216 八大標準逐條評估

## 2.1 Truth source 單一且穩定

### 評估
**部分達標，核心主線達標，整體系統未完全達標。**

### 證據
- `quote-costs/[id]` active mainline 已明確走：
  - `getQuoteCostDetailReadModel()`
  - `listDbVendorPackages()`
  - `listDbProjectFlowFormalReadbackRowsByProject()`
- quote-cost preload parity 已驗到：
  - `projectCount = 19`
  - `mismatchProjectCount = 0`
- vendor financial relations 正式路徑已走 DB adapter：
  - `src/lib/db/vendor-financial-relation-adapter.ts`

### 仍未完全達標的理由
- 系統整體仍存在部分 DB flow toggle 機制：
  - `shouldUseDbDesignFlow()`
  - `shouldUseDbProcurementFlow()`
  - `shouldUseDbVendorFlow()`
- `execution-tree.tsx` / `workflow-local-storage.ts` 仍然存在 local persistence 生態，雖然已不再是本輪 active quote-cost 主線 truth source

### 判定
- **核心主線：達標**
- **整體系統：接近達標，但未全面達標**

---

## 2.2 Active mainline 不再依賴 transitional chain

### 評估
**核心主線達標。**

### 證據
- `workflow-cost-bridge.ts` 已從 legacy compatibility bridge 收斂成 preload-based active cost assembler
- local formal-row fallback 已退休
- `QuoteCostDetailClient` 已改為直接從 preloaded sources derive cost items
- active runtime 已與 legacy fallback 隔離：
  - object input mode 下 `workflow-vendor-package-bridge.ts` 僅走 preload path
- `getQuoteCostProjectsForClientFallback()` 已移除
- legacy vendor financial relations helper 已退休

### 判定
- **本輪主線：達標**

---

## 2.3 Cross-page consistency 穩定成立

### 評估
**接近達標，但整體仍需更完整的實際 acceptance 執行證據。**

### 證據
- repo 內已有大規模 formal acceptance suite：
  - `test:formal-acceptance:v2`
  - cross-page consistency、quote-cost、closeout、vendor unpaid lifecycle 等 suite 都存在
- parity 已對 quote-cost preload/detail read model 做到閉環
- 本輪文件與 code 收斂已明確針對 downstream consistency 前進

### 尚未完全達標的原因
- 本次評估雖確認測試套件存在，但**本回合沒有逐一執行完整 formal acceptance 全套並附完整通過證據**
- 因此不能把「有測試」直接等同於「整體 cross-page consistency 已完整驗證完成」

### 判定
- **有強證據顯示接近達標**
- **若要對外宣稱整體成熟，仍建議補完整 acceptance run 證據**

---

## 2.4 修改影響可預期、可控

### 評估
**明顯改善，接近達標。**

### 證據
- 本輪能連續切掉多層 bridge / fallback / wrapper，而 build 與 parity 持續穩定
- 代表依賴邊界已比過去清楚很多
- legacy compatibility consumer 已一路縮減到退休
- `workflow-vendor-package-bridge.ts`、`workflow-cost-bridge.ts`、`quote-cost-detail-client.tsx` 的責任比過去清晰

### 保留意見
- repo 中仍可見一些更外圍 local persistence / toggle / broader runtime surfaces
- 表示整個 projectflow 不一定所有子領域都已達同樣可控程度

### 判定
- **核心主線：達標或非常接近達標**
- **整體系統：接近達標**

---

## 2.5 驗證可重複，不靠感覺

### 評估
**達標。**

### 證據
- 本輪反覆使用：
  - `npm run build`
  - `/api/internal/quote-cost-preload-parity`
- repo 中存在完整 formal acceptance / Playwright 套件
- 驗證方法不是靠肉眼臆測，而是可重複重跑的檢查

### 判定
- **達標**

---

## 2.6 資料修正、功能修正、顯示修正分層明確

### 評估
**接近達標。**

### 證據
- 本輪主要改動集中在：
  - adapter
  - bridge
  - mapper
  - preload/runtime chain
- 並未靠新增 UI 提示文字補洞
- manual cost mismatch 最終也是在 parity compare / detail merge / cost source treatment 層修正，而不是 UI 補字

### 保留意見
- 更廣義整體系統是否所有歷史問題都已完全分層清楚，還需更多領域確認

### 判定
- **本輪主線：達標**
- **整體系統：接近達標**

---

## 2.7 Legacy / fallback 存在但必須受控

### 評估
**達標，但屬受控存在，不是完全消失。**

### 證據
- legacy vendor financial relations helper 已退休
- unused fallback project assembler 已移除
- `workflow-vendor-package-bridge.ts` 的 legacy fallback 已隔離到 string mode
- `workflow-derived-board.ts` 已收斂為 pure formal-row mapper，不再承擔 local runtime readback path

### 殘留項
- legacy string mode 仍存在於 vendor package bridge
- `execution-tree.tsx` / workflow-local-storage 生態仍存在，但目前不再是本輪 active mainline 阻塞

### 判定
- **受控達標**
- 但若追求「全面無歷史包袱」，仍可再優化

---

## 2.8 新需求加入時，不需要重做真相收斂

### 評估
**核心主線接近達標，整體系統仍不能百分之百保證。**

### 證據
- 對本輪 active quote-cost mainline 而言，truth source、bridge boundary、preload chain 已大幅清楚
- 後續若在這條主線上加需求，不太需要再重做整條 transitional chain 考古

### 保留意見
- 對整體 projectflow 而言，仍有其他 domain / broader runtime path / toggle-based areas
- 新需求若剛好打到那些範圍，仍可能需要再做局部真相收斂

### 判定
- **核心主線：接近達標**
- **整體系統：未完全達標**

---

## 3. 分級總結

## 3.1 已達標

1. active quote-cost preload / bridge / detail mainline closure
2. active runtime 與主要 legacy fallback 的隔離
3. build / parity 類驗證可重複性
4. 本輪主線不靠 UI 或說明文字補洞
5. legacy / compatibility surface 已明顯收斂並可追蹤

---

## 3.2 接近達標

1. 系統整體的 truth source 單一化
2. 系統整體的 cross-page consistency
3. 系統整體的修改可控性
4. 新需求加入時，不再需要做大規模真相收斂

這些項目之所以是「接近」，不是因為 UI 或文案，而是因為：
- 評估範圍目前已有主線強證據，但尚未把整個 projectflow 所有 domain 一次性驗滿

---

## 3.3 尚未適合直接對外宣稱的部分

### 不建議直接對外說：
- **整個 projectflow 已全面成熟**

### 較準確說法是：
- **核心主線已正式收斂**
- **active mainline 已達正式化水準**
- **系統整體接近成熟，但尚待更全面的跨 domain 驗證與擴散式 formalization 證據**

---

## 4. 最終判定

### 最嚴格判定

依 `MD216` 標準：

> **目前 projectflow 不宜直接被判定為「整體已全面成熟的正式系統」。**

### 但同時必須明確承認

> **目前 projectflow 的核心主線，尤其是本輪處理的 active quote-cost preload / bridge / detail runtime chain，已可視為正式主線水準，成熟度高。**

---

## 5. 下一步若要把「接近成熟」推到「可宣稱成熟」

不是去改 UI，也不是去補頁面指引文字。

真正下一步應該是：

1. 以現有 formal acceptance suite 為主，跑出更完整整體證據
2. 對整體核心 domain 做一次 cross-domain maturity closure
3. 確認其他非本輪主線 domain 也已不再依賴大型 transitional chain
4. 將「核心主線已成熟」推進成「系統整體已成熟」

---

## 6. 一句話總結

> **現在的 projectflow，已不是靠 patch 撐住的半成品主線；核心主線已達正式化水準。但若嚴格依標準看，整個系統還比較接近「高成熟度、接近全面成熟」，而不是已經可以無保留對外宣稱全面成熟。**
