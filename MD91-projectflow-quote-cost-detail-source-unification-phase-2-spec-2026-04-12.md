# MD91 — projectflow quote-cost detail source unification phase 2 spec (2026-04-12)

> Status: ACTIVE
> Follow-up: `MD90-projectflow-quote-cost-detail-source-unification-spec-2026-04-12.md`
> Note: 本文件用來承接 `quote-cost detail` 第一輪 source unification 完成後，第二輪進入 adapter-level formalization 的正式規格。


## 1. 文件定位

本文件承接 `MD90` 與第一輪 `quote-cost detail source unification` 已落地成果，用來正式定義第二輪應進入的主線：從 client/page-level source split 清理，往 `financial-flow-adapter.ts` 內部的 seed merge / transition responsibility 正式退場推進。

本文件目的：
- 把 `quote-cost detail` 下一步工作從抽象方向收斂成明確 Phase 2
- 明確指出目前仍殘留的 adapter-level 過渡責任
- 定義 Phase 2 的正式目標與邊界
- 為後續 CTO 派工提供 spec 入口

---

## 2. 本文件的核心結論

> `quote-cost detail` 第一輪 source unification 已收掉 client-side / page-level 的 sample 與 seed fallback；第二輪的正確入口，不再是 UI 或 route，而是 `financial-flow-adapter.ts` 內部仍殘留的 quotation seed merge、note / preservedSeedItems 過渡責任，以及 quotation 正式 DB read model 缺口。

---

## 3. Phase 1 已完成的停點

截至目前，已完成：
- quotation 區不再由 client 端 `sampleQuoteImports` / `sampleQuoteLineItemsByProject` 當正式主顯示
- archive 區不再從 client fallback 到 `project-workflow-store`
- closeout detail 不再 fallback `seedProject`
- page-level seed 殘留讀取已清掉

正式判定：
> `quote-cost detail` 的 client/page-level source split 已完成第一輪收斂。

---

## 4. 目前仍未 fully DB-first 的核心原因

目前尚未 fully DB-first 的原因，已不再是頁面本身，而是 adapter-level 過渡責任仍存在於：

> **`financial-flow-adapter.ts`**

目前仍殘留的核心問題包括：
1. quotation seed merge
2. note / preservedSeedItems 等過渡責任
3. quotation 尚未有正式 DB read model

正式語意：
> 現在真正卡住 `quote-cost detail` fully formalized 的，不是 UI、不是 route，而是 adapter 內部仍在幫舊資料模型兜過渡責任。

---

## 5. Phase 2 的正式目標

Phase 2 必須聚焦在：

### 5.1 quotation seed merge 退場
- 把 quotation 顯示與資料責任，從 seed merge 轉向正式主鏈
- 不再讓 adapter 同時扮演正式真值與舊 seed 補丁層

### 5.2 note / preservedSeedItems 過渡責任退場
- 清掉 adapter 中為了兼容舊資料模型而保留的過渡責任
- 避免 financial payload 仍混入歷史 patch semantics

### 5.3 quotation 正式 read model 方向收斂
- 明確定義 quotation 未來應由哪條正式資料來源承接
- 不再長期停留在 seed merge 狀態

### 5.4 summary / detail / archive 進一步 same-source 化
- 在 adapter 層把 financial 主鏈、quotation、archive 再往同一條正式責任鏈收斂

---

## 6. 本輪仍不做什麼

Phase 2 雖然進到 adapter 層，但仍不是全面大改。

本輪不做：
1. 不重開 UI
2. 不新增欄位
3. 不擴到其他模組
4. 不順手做全系統 cleanup
5. 不在沒有明確 read model 前硬做大範圍 schema redesign

正式原則：
> Phase 2 是 `quote-cost detail` 的 adapter-level formalization，不是全 financial ecosystem 一次重寫。

---

## 7. 與其他主線的關係

## 7.1 與 Accounting Center
`Accounting Center` 的更高層 fully DB-first formalization，仍依賴 `quote-cost detail` 成為穩定單案真值主線。

## 7.2 與 Closeout
`Closeout` 的 archive read-model cleanup，也依賴 `quote-cost detail` 先完成 adapter-level source unification。

## 7.3 與 full DB-first formalization 主線
Phase 2 屬於 `MD87~MD89` 中第一批 formalization priority 的延續，不是新開分支。

---

## 8. 後續 CTO 派工方向（高階）

依本文件，後續 CTO 可拆成：
1. `financial-flow-adapter.ts` quotation seed merge audit
2. note / preservedSeedItems transition responsibility audit
3. quotation 正式 read-model replacement plan
4. adapter-level same-source closure implementation

---

## 9. 一句話總結

> `quote-cost detail` 第一輪 source unification 已經把 client/page-level 的 sample 與 seed fallback 收掉；下一輪真正要處理的核心，不再是頁面層，而是 `financial-flow-adapter.ts` 內部仍殘留的 quotation seed merge、note / preservedSeedItems 過渡責任，以及 quotation 正式 DB read model 缺口，因此 `Phase 2` 的正確定位是：`quote-cost detail` 的 adapter-level formalization。