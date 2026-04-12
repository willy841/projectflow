# MD99 — projectflow closeout archive semantics extraction spec (2026-04-12)

> Status: ACTIVE
> Follow-up: `MD98-projectflow-closeout-archive-read-model-formalization-spec-2026-04-12.md`
> Note: 本文件用來承接 closeout read-model formalization 後，下一輪應進入的 archive-only semantics extraction 主線。


## 1. 文件定位

本文件用來正式定義 `closeout` 在完成 archive read-model formalization 之後，下一輪應處理的主線：把 closeout-only archive semantics 從 `QuoteCostDetailClient` 的 shared financial skeleton 中再抽離一層，讓 closeout 更接近真正的 archive / retained view。

本文件目的：
- 明確指出 source 邊界已清到哪裡
- 明確指出目前仍未 fully closeout-native 的原因在於 semantics / presenter 層
- 為後續 CTO 派工提供 closeout archive-only semantics extraction spec

---

## 2. 本文件的核心結論

> `closeout` 在完成 list / detail 的 archive source 與 read-model formalization 之後，下一輪最正確的工作，不再是 source cleanup，而是 archive-only semantics extraction：把 `QuoteCostDetailClient` 內屬於 closeout 專用的 retained / archive 語意分支抽出，讓 closeout detail 不再只是 active financial detail client 的 closed mode，而能更明確成為 closeout archive / retained shell。

---

## 3. 目前正確停點

截至目前，closeout 已完成：
- closeout list canonical archive source
- closeout detail archive read-model
- closeout-native client wrapper
- page-level archive server props 邊界清理

正式判定：
> closeout 的資料責任與 read-model 邊界已比前一輪清楚很多，source 問題已不是主阻塞點。

---

## 4. 目前仍未 fully closeout-native 的核心原因

現在 closeout 最大的未完成點，已不是資料來源，而是：

### 4.1 `QuoteCostDetailClient` 仍是 shared financial skeleton
closeout detail 雖然已透過 wrapper 與 read-model 收斂，
但真正渲染頁面的主骨架仍是 `QuoteCostDetailClient`。

### 4.2 `isClosedView` 分支仍混在 shared client 內
這表示：
- closeout-only archive semantics
- retained / closed-result 語意
- 某些 closeout-only section responsibility

仍混在 active financial page 的共用骨架裡。

### 4.3 presenter / semantics 還不夠 closeout-native
因此 closeout 雖然 source 已 formalized，
但頁面層語意仍有中間態感。

---

## 5. 下一輪正式目標

### 5.1 盤點 `QuoteCostDetailClient` 內所有 `isClosedView` 分支
目標：
- 找出哪些分支其實屬於 closeout-only archive semantics
- 找出哪些分支可繼續共用 financial skeleton

### 5.2 抽離 closeout-only presenter layer
目標：
- 讓 closeout-only archive / retained 語意有自己的 presenter 或 wrapper 層
- 不再把所有 closeout 語意都塞在 shared client 的 if-branch 裡

### 5.3 closeout retained shell 更清楚
目標：
- 不一定要重做 UI
- 但至少要讓 closeout detail 的結構責任、語意責任、section responsibility 更 closeout-native

正式原則：
> 先抽 semantics / presenter，再決定未來是否需要進一步把 shell 完整拆開。

---

## 6. 本輪不做什麼

下一輪 closeout semantics extraction 仍不是：
1. 不重開 UI 骨架
2. 不新增欄位
3. 不擴到其他模組
4. 不一次重寫整個 `QuoteCostDetailClient`
5. 不直接做大規模 closeout redesign

正式原則：
> 下一輪先 formalize semantics / presenter，不是大改版型。

---

## 7. 後續 CTO work package 方向（高階）

依本文件，後續 CTO 可拆成：
1. `isClosedView` branch audit
2. closeout-only presenter extraction
3. closeout retained shell responsibility cleanup
4. closeout semantics extraction closure

---

## 8. 一句話總結

> closeout 下一輪最正確的 formalization，不再是 source cleanup，而是 archive-only semantics extraction：把 `QuoteCostDetailClient` 內屬於 closeout 的 retained / archive 語意與 section responsibility 再抽離一層，讓 closeout detail 從「shared financial skeleton 的 closed mode」往「更明確的 closeout archive / retained shell」推進。