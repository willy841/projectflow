# MD92 — projectflow quote-cost quotation DB read model spec (2026-04-12)

> Status: ACTIVE
> Follow-up: `MD90-projectflow-quote-cost-detail-source-unification-spec-2026-04-12.md`, `MD91-projectflow-quote-cost-detail-source-unification-phase-2-spec-2026-04-12.md`
> Note: 本文件用來正式定義 `quote-cost detail` 中 quotation 區的 DB read model 方向，作為後續完全退場 seed projection 的規格入口。


## 1. 文件定位

本文件承接 `MD90` 與 `MD91`，用來把 `quote-cost detail` 下一步從 adapter-level formalization，推進到 quotation 正式 DB read model 的規格定義。

本文件目的：
- 正式定義 quotation 區未來應由哪條正式資料責任承接
- 結束 quotation 長期停留在 seed projection / transition fallback 狀態
- 為後續 CTO 派工提供 read-model 層的正式 spec 入口

---

## 2. 本文件的核心結論

> `quote-cost detail` 若要 fully DB-first，單靠收斂 seed fallback 還不夠；quotation 區必須有正式 DB read model，讓 quotation import / quotation line items 不再依賴 sample / seed projection，而能與 financial / summary / archive 一起成為同一條正式資料主線的一部分。

---

## 3. 現況判斷

截至 `MD91`：
- `quote-cost detail` 的 client/page-level source split 已收掉
- adapter-level seed merge / transition responsibility 已收斂一層
- 但 quotation 區仍未 fully DB-first

目前最核心的缺口不是：
- UI
- route
- client state

而是：
> **quotation 尚未有正式 DB read model。**

也就是：
- quotation import 沒有正式 DB readback 主線
- quotation line items 沒有正式 DB readback 主線
- quotation 目前仍需由 seed projection 補位

---

## 4. quotation read model 的正式目標

後續 quotation DB read model 必須達成：

### 4.1 quotation import 正式化
- quotation import 不再由 sample / seed import 補位
- 必須有正式 DB readback 來源

### 4.2 quotation line items 正式化
- quotation line items 不再由 seed line items 補位
- 必須有正式 DB readback 來源

### 4.3 與單案 financial payload 對齊
- quotation 區不應是獨立平行世界
- 必須能被整合進單案 financial payload
- 不再由 quotation 區自己額外拼一套 seed projection

### 4.4 summary / detail / archive 同源化
- quotation 一旦有正式 read model
- `quote-cost detail` 才能真正往 summary / detail / archive 同源收斂

---

## 5. 正式資料責任原則

後續 quotation DB read model 必須遵守：

### 5.1 quotation 是正式主線資料，不是 UI 補畫面資料
正式語意：
> quotation 不是可有可無的 sample panel，而是 `quote-cost detail` 單案財務頁的一部分，必須有正式資料責任。

### 5.2 quotation 不得再由 seed projection 扮演長期 read model
正式語意：
> seed projection 只能作為過渡階段短期補位，不可成為長期 read model。

### 5.3 quotation read model 與 financial 主鏈必須可整合
正式語意：
> quotation DB read model 不能再長成另一套平行 payload；應可被整合進既有 financial detail 主 payload 或其正式衍生鏈。

---

## 6. Phase 3 不做什麼

本文件定義的是 read model spec，不是一次把整個 quotation domain 全重做。

本輪不做：
1. 不重開 UI
2. 不新增欄位
3. 不擴到其他模組
4. 不順手重寫整個 quote-cost architecture
5. 不在本文件內直接拍死最終 DB schema 細節

正式原則：
> 先定 read model 責任，再決定 schema 與工程落地細節。

---

## 7. 後續 CTO work package 方向（高階）

依本文件，後續 CTO 可拆成：
1. quotation import 現況 audit
2. quotation line items 現況 audit
3. quotation DB read model 設計
4. financial payload integration plan
5. seed projection retirement plan

---

## 8. 與其他主線的關係

## 8.1 與 `quote-cost detail source unification`
quotation DB read model 是 `MD90 / MD91` 的自然下一步，不是新分支。

## 8.2 與 `Closeout`
若 quotation 長期停留在 seed projection，`Closeout` 也很難 fully same-source。

## 8.3 與 `Accounting Center`
`Accounting Center` 更高層 formalization 雖然不直接吃 quotation 細節，但 `quote-cost detail` 若未 fully DB-first，整體 financial ecosystem 仍停在 partial 狀態。

---

## 9. 一句話總結

> `quote-cost detail` 要真正 fully DB-first，下一步不再只是收 seed fallback，而是要正式建立 quotation DB read model：讓 quotation import 與 quotation line items 從 sample / seed projection 退場，能被整合進單案 financial detail 的正式資料責任鏈，進而讓 summary / detail / archive 真正同源。