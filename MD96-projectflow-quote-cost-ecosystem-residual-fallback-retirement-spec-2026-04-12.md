# MD96 — projectflow quote-cost ecosystem residual fallback retirement spec (2026-04-12)

> Status: ACTIVE
> Follow-up: `MD89-projectflow-repo-level-db-coverage-audit-report-2026-04-12.md`, `MD90-projectflow-quote-cost-detail-source-unification-spec-2026-04-12.md`, `MD91-projectflow-quote-cost-detail-source-unification-phase-2-spec-2026-04-12.md`, `MD95-projectflow-quotation-db-read-model-implementation-closure-2026-04-12.md`
> Note: 本文件是 `quote-cost ecosystem` 下一輪 formalization 收尾回合的正式規格入口。


## 1. 文件定位

本文件用來正式定義 `quote-cost ecosystem` 在 quotation DB read-model 落地後，下一輪應進入的主線：清理 residual fallback、退場剩餘 sample / seed / transition semantics，讓 `quote-cost` 單案財務主線更接近 fully DB-first formal system。

本文件目的：
- 明確指出 quotation DB-backed 後還殘留哪些 fallback / transition 問題
- 定義 `quote-cost ecosystem` 下一輪 formalization 的正確範圍
- 避免在核心 financial spine 尚未收口前，又跳去新模組或新功能

---

## 2. 本文件的核心結論

> `quote-cost detail` 在完成 quotation DB read-model 之後，下一輪最合理的方向不是開新功能，而是進入 `quote-cost ecosystem residual fallback retirement`：把仍殘留的 sample arrays、seed fallback、transition note / close-status semantics、以及與 closeout 之間尚未 fully same-source 的部分，再收斂一輪，讓 `quote-cost` 真正成為更乾淨的 DB-first financial spine。

---

## 3. 為什麼下一輪要走這條

目前 `quote-cost detail` 已完成：
- financial DB 主鏈
- collection
- reconciliation
- payable / payment readback
- quotation DB read-model

也就是：
> 單案 financial 真值中心已經大致成形。

因此下一輪最有槓桿的，不是跳去別模組，而是：
1. 把這條 financial spine 的 residual fallback 清乾淨
2. 讓 closeout / accounting center / vendor data 後續承接更穩的同源主鏈

---

## 4. 下一輪主線的正式範圍

## 4.1 sample arrays / seed projection 殘留退場
重點包括：
- `quote-cost-data.ts` 內仍殘留的 sample arrays
- 與 quotation / quote-cost 顯示仍可能相關的 seed projection 路徑

正式原則：
> 已不再作為正式主來源的 sample / seed，不應長期留在主線有效路徑上。

## 4.2 `financial-flow-adapter.ts` residual transition semantics 清理
雖然前兩輪已做：
- client/page-level source split 收斂
- adapter-level seed fallback formalization

但仍可能殘留：
- transition note semantics
- reconciliation / close status 的 seed 時代語意
- 某些 preserved fallback 路徑

正式原則：
> adapter 層應進一步從「受控 fallback」推進到「更少 fallback、更清楚正式責任」。

## 4.3 closeout 與 quote-cost 的 same-source cleanup
目前 closeout 仍屬 PARTIAL DB-FIRST。  
下一輪應把：
- closeout canonical source
- closeout archive read-model
- closeout 與 quote-cost 的單案 financial 同源關係

再往前推一輪。

正式原則：
> closeout 不應長期承接 partial quote-cost source；應逐步收斂到同一條正式 financial spine。

---

## 5. 本輪不做什麼

下一輪雖然是 formalization 收尾回合，但仍不是：
1. 不開新 UI 大功能
2. 不擴到 unrelated 模組
3. 不直接全面大砍全 repo legacy
4. 不跳去新模組做另一條大主線

正式原則：
> 先收口 `quote-cost ecosystem`，再談更外圍的全系統 cleanup。

---

## 6. 與其他模組的關係

## 6.1 與 Closeout
`Closeout` 是下一輪 quote-cost ecosystem formalization 的直接承接對象之一。

## 6.2 與 Accounting Center
`Accounting Center` 更高層 summary / month close formalization，依賴 `quote-cost` financial spine 先更乾淨。

## 6.3 與 Vendor Data
`Vendor Data` financial same-source closure 雖可後續再做，但先讓 quote-cost spine 更正式，會讓後面成本更低。

---

## 7. 後續 CTO work package 方向（高階）

依本文件，下一輪 CTO 可拆成：
1. `quote-cost-data.ts` sample / seed retirement audit
2. `financial-flow-adapter.ts` residual transition cleanup
3. `closeout` same-source cleanup
4. `quote-cost ecosystem` fallback retirement 驗收與 closure

---

## 8. 一句話總結

> quotation DB-backed 之後，`quote-cost ecosystem` 下一輪最合理的主線，不是再加新功能，而是進入 residual fallback retirement：把 `quote-cost-data.ts` 的 sample / seed 殘留、`financial-flow-adapter.ts` 的 transition semantics，以及 `closeout` 與 `quote-cost` 尚未 fully same-source 的部分，再收斂一輪，讓 `quote-cost` 真正成為更乾淨的 DB-first financial spine。