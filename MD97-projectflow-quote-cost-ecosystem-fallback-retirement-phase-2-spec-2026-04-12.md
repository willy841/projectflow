# MD97 — projectflow quote-cost ecosystem fallback retirement phase 2 spec (2026-04-12)

> Status: ACTIVE
> Follow-up: `MD96-projectflow-quote-cost-ecosystem-residual-fallback-retirement-spec-2026-04-12.md`
> Note: 本文件用來承接 `quote-cost ecosystem residual fallback retirement` 第一輪完成後，第二輪應進入的正式主線。


## 1. 文件定位

本文件用來正式定義 `quote-cost ecosystem fallback retirement` 第二輪的正確範圍，承接第一輪已完成的 source 責任收斂結果，繼續往更乾淨的 DB-first financial spine 推進。

本文件目的：
- 明確指出第一輪後仍殘留的 fallback / transition 問題
- 收斂 Phase 2 的優先順序
- 避免下一輪又跳去新功能或 unrelated 模組

---

## 2. 本文件的核心結論

> `quote-cost ecosystem residual fallback retirement` 第一輪已把 closeout list 的 seed closed fallback 拔掉，並把 reconciliation / close semantics 拉回 project financial spine；第二輪的正確入口，應聚焦在：讓 `quotation-read-model.ts` 只負責 quotation 自己的 readback、讓 `quote-cost-data.ts` 的 sample / seed 降成明確 fixture、以及讓 closeout 進一步建立更清楚的 canonical archive source。

---

## 3. Phase 1 已完成的停點

截至上一輪，已完成：
- closeout list 不再直接 fallback 到 `quoteCostProjects`
- reconciliation status 改由 `financial_reconciliation_groups` 聚合
- closeStatus 改回 DB project status
- adapter note 過渡語意降噪

正式判定：
> `quote-cost ecosystem` 的主 financial spine 已比之前更清楚，且 closeout list / reconciliation / close status 已脫離部分 seed-era semantics。

---

## 4. 目前仍殘留的核心問題

## 4.1 `quotation-read-model.ts` 責任仍偏大
雖然 quotation 已有 DB read model，但目前仍殘留：
- `reconciliationStatus`
- `closeStatus`
等非 quotation 本體的責任混在 quotation read-model 心智中。

正式判定：
> quotation read-model 下一輪應只負責 quotation 自己的 readback，不再扛其他 financial spine 狀態語意。

## 4.2 `quote-cost-data.ts` sample / seed 仍未正式退成 fixture
目前仍殘留：
- `sampleQuoteImports`
- `sampleQuoteLineItemsByProject`
- `quoteCostProjects`

正式判定：
> 這些資料雖已不再是 quotation 區正式主來源，但仍混在 domain/type 主檔心智中，下一輪應進一步降成明確 fallback fixture，而不是主線共用資料源。

## 4.3 `closeout` 仍缺正式 canonical archive source
雖然 closeout list 已更同源，但 closeout 整體仍未 fully formalized：
- canonical archive source 仍不夠清楚
- closeout detail 仍主要沿用 quote-cost detail 骨架

正式判定：
> closeout 下一輪應往 archive read-model 與 canonical source 再推一步，而不是長期停在 partial same-source。

---

## 5. Phase 2 的正式優先順序

### Priority 1 — `quotation-read-model.ts` 第二輪責任收斂
目標：
- 讓 quotation read-model 只負責 quotation 自己的 readback
- 把非 quotation 本體的 status 語意完全移出

### Priority 2 — `quote-cost-data.ts` sample / seed fixture 退場
目標：
- 把 sample arrays / seed project 從主線 domain/type 心智中降階
- 改成明確 fixture / fallback-only 資料層

### Priority 3 — `closeout` canonical archive source 收斂
目標：
- 讓 closeout 不只是列表同源，而是 archive source 也更正式

---

## 6. 本輪不做什麼

Phase 2 仍不是：
1. 不重開 UI
2. 不新增欄位
3. 不擴到其他模組
4. 不做全 repo cleanup
5. 不一次重寫整個 closeout / quote-cost architecture

正式原則：
> 第二輪仍是 focused formalization，不是全面重構。

---

## 7. 後續 CTO work package 方向（高階）

依本文件，下一輪 CTO 可拆成：
1. quotation-read-model responsibility cleanup
2. quote-cost-data fixture retirement / relocation
3. closeout archive source audit + cleanup

---

## 8. 一句話總結

> `quote-cost ecosystem fallback retirement` 第二輪的正確方向，不是再開新功能，而是把第一輪還沒清完的三個核心點收掉：讓 `quotation-read-model.ts` 回到 quotation 本體責任、讓 `quote-cost-data.ts` 的 sample / seed 正式退成 fixture、並讓 `closeout` 再往 canonical archive source 推一步，讓整條 quote-cost financial spine 更接近 fully DB-first formal system。