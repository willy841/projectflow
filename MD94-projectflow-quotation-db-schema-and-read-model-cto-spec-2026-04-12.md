# MD94 — projectflow quotation DB schema and read-model CTO spec (2026-04-12)

> Status: ACTIVE
> Follow-up: `MD92-projectflow-quote-cost-quotation-db-read-model-spec-2026-04-12.md`, `MD93-projectflow-quotation-db-read-model-gap-and-phase-1-implementation-2026-04-12.md`
> Note: 本文件用來承接 quotation read model 的 gap 判斷，正式收斂下一步 CTO 應直接執行的 schema + read-model 主線。


## 1. 文件定位

本文件承接 `MD92` / `MD93`，用來把 quotation 區目前缺少正式 DB schema / read model 的問題，收斂成一條可直接派給 CTO 執行的正式主線。

本文件目的：
- 明確規定 quotation schema 缺口就是下一步主工作
- 定義 quotation import / line items 的正式資料責任
- 定義 `quotation-read-model.ts` 下一步應如何由 seed fallback 過渡到正式 DB query
- 為後續 CTO 派工提供明確工程 spec

---

## 2. 本文件的核心結論

> quotation 區目前尚未 fully DB-first 的根因，不在 UI、不在 route，而在於缺少正式 DB schema 與正式 read-model contract；因此下一步不應再只是收 seed fallback，而是直接補 quotation import / quotation line items 的正式 DB schema，並讓 `quotation-read-model.ts` 改承接正式 DB query，最後才能退掉 seed projection。

---

## 3. 現況判斷

截至 `MD93`：
- quotation fallback 已從 `financial-flow-adapter.ts` 抽成獨立 `quotation-read-model.ts`
- 目前 quotation source 責任比以前清楚
- 但 quotation 仍未 fully DB-first

根因已被正式確認為：
1. 缺 quotation import table
2. 缺 quotation line items table
3. 缺 project -> quotation import -> line items 的正式 readback contract

正式判定：
> 目前若不補 schema，quotation 永遠只能停留在 seed projection 補位狀態。

---

## 4. quotation 正式資料責任

後續正式資料責任應切成兩層：

### 4.1 quotation import
承接：
- 某專案目前有效 quotation import 主體
- quotation 版本 / metadata / 匯入結果識別

### 4.2 quotation line items
承接：
- 屬於某 quotation import 的逐列明細
- 作為 quotation 區顯示與後續 financial payload integration 的正式細項來源

正式原則：
> quotation import 與 quotation line items 不應再由 sample arrays / seed project 欄位扮演長期正式來源。

---

## 5. 建議 schema 方向（高階）

本文件先定責任，不在這裡拍死最終欄位細節，但高階方向應至少包括：

### 5.1 quotation imports table
建議命名方向：
- `financial_quotation_imports`

責任：
- 專案層 quotation import 主體
- 承接 import metadata / 版本識別 / 有效 import 狀態

### 5.2 quotation line items table
建議命名方向：
- `financial_quotation_line_items`

責任：
- quotation import 底下的逐列明細
- 承接正式 quotation line items readback

正式原則：
> 命名可再微調，但資料責任不可漂移。

---

## 6. read-model 正式目標

### 6.1 `quotation-read-model.ts` 轉型目標
目前它仍是：
- fallback boundary
- gap wrapper

後續應轉成：
> **正式 quotation DB read-model entry point**

### 6.2 readback contract
後續應能穩定回答：
1. 某 project 目前有效 quotation import 是哪一筆？
2. 該 import 底下有哪些 line items？
3. quotation 區顯示值應如何從正式資料組出？

### 6.3 與 financial payload 整合
正式原則：
> quotation read model 不應長成平行 payload；應可被整合進既有單案 financial detail 正式資料鏈。

---

## 7. 本輪仍不做什麼

雖然這份文件是 CTO spec，但仍不代表要一次全做完所有延伸功能。

本輪不做：
1. 不重開 UI
2. 不新增欄位
3. 不擴到其他模組
4. 不一次重寫整個 quote-cost architecture
5. 不在本文件內直接拍死最終 migration 細節

正式原則：
> 先讓 quotation schema 與 read-model 成立，再談更完整 quotation lifecycle。

---

## 8. 後續 CTO work package 方向

依本文件，下一步 CTO 應直接拆成：
1. quotation schema draft
2. migration + DB read-model implementation
3. financial payload integration
4. seed projection retirement
5. 驗收：quotation 區不再靠 seed projection 當正式主來源

---

## 9. 一句話總結

> quotation 區下一步最正確的 CTO 主線，不是再多收一層 fallback，而是正式建立 `quotation import + quotation line items` 的 DB schema 與 read-model contract，讓 `quotation-read-model.ts` 從 gap wrapper 變成正式 DB query 入口，之後才能真正退掉 seed projection，完成 `quote-cost detail` 的 quotation fully DB-first。