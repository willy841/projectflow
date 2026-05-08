# MD220 — projectflow performance audit and page classification v1 — 2026-05-08

Status: ACTIVE / PERFORMANCE AUDIT

Parent:
- `MD216-projectflow-formal-maturity-criteria-v1-2026-05-08.md`
- `MD219-projectflow-formal-maturity-closure-2026-05-08.md`

---

## 0. 目的

這份文件不是在談 correctness，也不是在談 UI。

它要回答的是：

> **在 `projectflow` 已完成成熟封關之後，哪些核心頁面的慢，還可以靠工程優化繼續救；哪些頁面的慢，其實已經是結構性重頁，若想再快，必須動產品層級的頁面結構切法。**

本文件同樣排除：
- UI 調整
- 系統指引文字
- 頁面文案

只從：
- server data path
- aggregation weight
- payload structure
- page architecture
- engineering optimization feasibility

來分類。

---

## 1. 本輪可信性能基線

使用 Playwright 受控 webServer 路徑量測 `tests/perf-vendor-quote-project.spec.ts` 後，得到多輪可重複基線。

### 1.1 較早可信基線
- Vendor Detail：`~2287ms`
- Quote-cost Detail：`~1563ms`
- Project Detail：`~2184ms`

### 1.2 經過多輪優化後的代表數字
- Vendor Detail：`~1270ms`
- Quote-cost Detail：`~1700–2200ms`（波動存在）
- Project Detail：`~2170–2820ms`（波動且在某些錯誤切法下更慢）

注意：
- Quote-cost / Project Detail 的數字在本輪測試中仍有波動，因此本文件不把單一數字當唯一真相，而是以**優化趨勢與結構特徵**做判斷。

---

## 2. 頁面分類：哪些能靠工程優化救

## A 類：可透過工程優化明顯改善的頁面

### A1. Vendor Detail

#### 結論
**Vendor Detail 已證明可以靠工程優化顯著變快。**

#### 證據
本輪已做過多刀優化，且成功把：
- `~2287ms`
壓到
- `~1270ms`

約快了：
- `~1017ms`

#### 有效的優化類型
1. 把不必要的首屏 blocking 資料移出：
   - 例如 `tradeOptions`
2. 不在首屏組不必要的 cost item / fallback 補算
3. 把 vendor detail 的 package 依賴改成 summary-scoped 思維，而不是 full-package path
4. 首屏只保留：
   - vendor base
   - payment records
   - open vendor project records

#### 為什麼它可救
因為 Vendor Detail 原本慢，主要是：
- 非必要資料也卡在首屏
- 有些資料只需要 summary，卻先做 full assembly
- 所以拔掉不必要的 blocking path 後，速度立刻有感下降

#### 判定
- **屬於工程可救型頁面**
- 後續若還要再壓，仍值得繼續在 data-path / summary-path 上做優化

---

## B 類：部分可優化，但收益可能有限 / 波動較大

### B1. Quote-cost Detail

#### 結論
**Quote-cost Detail 可以工程優化，但目前收益沒有 Vendor Detail 那麼穩定明顯。**

#### 已觀察到的現象
- 原始慢點與 `vendor-packages` 重型 aggregation 高度相關
- 先做結果 filter 沒什麼用
- 真正應做的是把 package path 變成 project-scoped build

#### 本輪狀況
- 方向上已切到 project-scoped / preload-based 路徑
- 但量測環境曾受 runtime 混雜影響，導致某些數字不穩
- 後期再量時，Quote-cost Detail 約落在 `~1.5s ~ 2.2s` 區間

#### 為什麼它屬於「部分可優化」
- 它確實有明顯的工程型重點（例如 `vendor-packages`）
- 但它不像 Vendor Detail 那樣，拔掉幾個 blocking path 就立刻穩定大幅下降
- 若還要再壓，必須更進一步處理重 aggregation 本身，而不是只修外層 consume path

#### 判定
- **屬於工程可再救，但需要更深資料路徑優化的頁面**

---

## 3. 頁面分類：哪些其實是結構性重頁

## C 類：結構性重頁，靠小刀優化不太會有感

### C1. Project Detail

#### 結論
**Project Detail 目前看起來是結構性重頁，不適合再用小刀試錯。**

#### 本輪已驗過、但效果不佳的方向
1. routeId resolve 優化
   - 效果極小
2. vendor name lookup 合併
   - 效果極小
3. requirements 不 preload
   - 無效，甚至變差
4. design / procurement / vendor tasks 不 preload
   - 幾乎無效
5. 直接把 `ExecutionTreeSection` 延後掛載
   - 對整頁完成時間反而更差

#### 這些結果說明了什麼
這說明 Project Detail 的慢，不是來自單一附加查詢，而是：
- **整個頁面的主體本身就重**
- 也就是：
  - execution structure
  - project shell
  - detail overview
  - workflow / execution section
  - communication / requirements side panel
  - 都被設計成同一頁的主要承載內容

#### 為什麼它不是工程小刀型問題
因為小刀已經試過很多輪，而且都沒有穩定、明顯收益。
這通常代表：
- 不是某個 query 慢
- 不是某個輔助資料慢
- 而是頁面本身的「首屏承載定義」太重

#### 真正要再救它，該怎麼做
不是再修小 query，而是：
1. 重新定義 Project Detail 首屏一定要看到什麼
2. 把 execution / workflow / communication 分層
3. 讓 overview 與 heavy execution section 明確切開
4. 把這頁從「一頁吃整包」改成「主層 + 分段進入」

#### 判定
- **屬於產品結構重切型頁面**
- 不建議再持續用小刀工程優化試錯

---

## 4. 總分類結論

### A 類：工程可救型
- `Vendor Detail`

### B 類：工程可再救，但需更深資料路徑優化
- `Quote-cost Detail`

### C 類：結構性重頁，應考慮頁面層級重切
- `Project Detail`

---

## 5. 後續建議順序

### Priority 1
若目標是短期內繼續讓系統變快，先做：
- `Quote-cost Detail` 的更深 package aggregation 優化

### Priority 2
若目標是中長期把整個系統 UX 再往前推，則應啟動：
- `Project Detail` 的結構重切規劃

### Priority 3
Vendor Detail 已有明顯成果，可暫時停止，等更大效益目標再回頭。

---

## 6. 一句話總結

> **Vendor Detail 已證明能靠工程優化有效變快； Quote-cost Detail 仍可再救，但要打更深的 aggregation；Project Detail 則不是再修小查詢就能解，已屬於需要重切首屏結構的重頁。**
