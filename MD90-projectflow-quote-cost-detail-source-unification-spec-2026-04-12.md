# MD90 — projectflow quote-cost detail source unification spec (2026-04-12)

> Status: ACTIVE
> Follow-up: `MD87-projectflow-full-db-first-formalization-audit-spec-2026-04-12.md`, `MD88-projectflow-repo-level-db-coverage-audit-work-package-2026-04-12.md`, `MD89-projectflow-repo-level-db-coverage-audit-report-2026-04-12.md`
> Note: 本文件是 `quote-cost detail` 下一階段 source unification 的正式規格入口。


## 1. 文件定位

本文件用來正式定義 `quote-cost detail` 在 full DB-first formalization 主線中的第一批 priority 工作：把目前仍混用的 financial DB source、quotation seed、archive / 過渡來源，收斂成同一條正式資料主線。

本文件目的：
- 明確指出 `quote-cost detail` 目前哪裡已接 DB、哪裡尚未同源
- 定義 source unification 的正式目標
- 明確規定哪些 UI 不得亂動
- 為後續 CTO formalization 派工提供主 spec 入口

---

## 2. 本文件的核心結論

> `quote-cost detail` 雖然 financial / collection / reconciliation / payable readback 主鏈已接上 DB，但目前 quotation 區與 archive 區仍殘留 seed / transition source；因此下一階段的正式目標，不是再加新功能，而是把 `quote-cost detail` 收斂成 summary / detail / archive 同源、且只吃正式 DB 真值的單案財務主線。

---

## 3. 現況判斷

依 `MD89` repo-level audit，目前 `quote-cost detail` 的狀態應判定為：

> **PARTIAL DB-FIRST**

原因不是 financial 主鏈沒接上 DB，而是：
1. financial / collection / reconciliation / payable 主鏈已相對正式
2. quotation 區仍殘留 seed 來源
3. archive 區仍有過渡資料 / seed 來源
4. summary / detail / archive 尚未 fully same-source

正式語意：
> 現在的 `quote-cost detail` 不是「沒接 DB」，而是「主鏈已部分正式化，但尚未 source-unified」。

---

## 4. 已相對站穩、可視為正式主鏈的部分

目前 `quote-cost detail` 中，可相對視為已站穩的部分包括：
- financial 主鏈
- client collection
- reconciliation groups
- project-side payable / payment readback

這些區塊目前的方向應是：
> **以 DB 真值為主，後續不應回頭重開資料責任。**

---

## 5. 目前尚未同源的部分

## 5.1 quotation 區
目前 audit 已指出：
- quotation 區仍殘留 seed 來源
- 例如 `sampleQuoteImports`、`sampleQuoteLineItemsByProject` 這類來源仍參與正式顯示

正式判定：
> quotation 區目前尚未 fully DB-first。

## 5.2 archive 區
目前 audit 已指出：
- archive 區仍存在 seed / 過渡來源
- 與 financial detail 主鏈不是完全同源

正式判定：
> archive 區目前尚未 fully same-source。

## 5.3 summary / detail / archive 關係
目前 audit 已指出：
- 某些 summary 與 detail / archive 並非完全同源
- 仍可能經過不同聚合路徑或 transition adapter

正式判定：
> `quote-cost detail` 目前最需要的，不是新功能，而是 source unification。

---

## 6. source unification 的正式目標

下一階段 `quote-cost detail source unification` 必須達成：

### 6.1 單案主資料同源
- quotation
- financial summary
- collection
- reconciliation
- payable/payment readback
- archive / history panel

都必須能回到同一條正式資料責任鏈，而不是各自吃不同 seed / transition source。

### 6.2 正式顯示不得再吃 seed / sample source
任何仍屬於正式主線顯示的區塊，不得再以：
- sampleQuoteImports
- sampleQuoteLineItemsByProject
- 其他 sample / mock / seed data
作為正式資料來源。

### 6.3 archive 不得再是過渡假層
archive 區若仍保留，應承接正式資料主鏈，不得只是為了補畫面而掛一層過渡假資料。

### 6.4 summary / detail / archive 必須同源
正式原則：
> 單案財務頁中的 summary、detail、archive，不得再各自吃不同來源或不同時代的資料模型。

---

## 7. UI 鎖定規則

本輪 source unification 的重點是資料責任收斂，不是 UI 重開。

正式原則：
- 不因 source unification 順手重做版面
- 不因 source unification 順手新增欄位
- 不因 source unification 順手改資訊架構
- 若未來有必要 UI 調整，需另開主線，不得包在本輪

一句話規則：
> **本輪先統一 source，不重開 UI。**

---

## 8. 與其他模組的關係

## 8.1 與 Accounting Center
- `Accounting Center` 的 month close / active-projects / summary，後續若要 fully DB-first，必須依賴 `quote-cost detail` 先成為單案正式真值主線
- 因此 `quote-cost detail source unification` 是更上游的 prerequisite

## 8.2 與 Closeout
- `Closeout` 目前仍部分承接 `quote-cost` 的 partial DB source
- 若 `quote-cost detail` 未先完成 source unification，`Closeout` 也無法 fully formalize

## 8.3 與 Vendor Data
- Vendor payable / payment readback 已在 `quote-cost detail` 與 `Vendor Data` 之間建立主鏈
- 但若 `quote-cost detail` 其他區塊仍不同源，整體 financial ecosystem 仍會停在 partial 狀態

---

## 9. 後續 CTO work package 方向（高階）

本文件先不直接展開成 CTO 細 work package，但後續可依此拆成：
1. `quotation source retirement / DB substitution`
2. `archive source cleanup / same-source closure`
3. `quote-cost detail summary-detail-archive source unification`
4. `transition helper / sample source retirement`

---

## 10. 一句話總結

> `quote-cost detail` 下一階段最重要的工作，不是新增功能，而是正式完成 source unification：把目前已接上 DB 的 financial / collection / reconciliation / payable 主鏈，與仍殘留 seed / transition source 的 quotation / archive 區收斂成同一條正式資料主線，讓單案財務頁真正成為 summary / detail / archive 同源、且只吃 DB 真值的正式系統頁面。