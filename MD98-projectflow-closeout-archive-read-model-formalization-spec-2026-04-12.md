# MD98 — projectflow closeout archive read-model formalization spec (2026-04-12)

> Status: ACTIVE
> Follow-up: `MD96-projectflow-quote-cost-ecosystem-residual-fallback-retirement-spec-2026-04-12.md`, `MD97-projectflow-quote-cost-ecosystem-fallback-retirement-phase-2-spec-2026-04-12.md`
> Note: 本文件是 `closeout` 下一輪 archive read-model formalization 的正式規格入口。


## 1. 文件定位

本文件用來正式定義 `closeout` 在當前 `quote-cost ecosystem` formalization 進度下，下一輪應進入的主線：從已有的 closeout list canonical archive source，進一步推到 closeout detail / archive-only semantics / server props 的正式 read-model 收斂。

本文件目的：
- 明確指出 closeout 目前已完成與尚未完成的 formalization 停點
- 定義下一輪應收斂的核心範圍
- 為後續 CTO 派工提供 closeout 主線 spec 入口

---

## 2. 本文件的核心結論

> `closeout` 目前已完成第一輪 canonical archive source 邊界收斂，但仍未 fully formalized；下一輪的正確方向，不是改 UI，而是補 `closeout detail` 專屬 archive read-model、讓 closeout detail 不再只是沿用 `QuoteCostDetailClient` 的中間態，並把 archive-only semantics 與 server props 資料責任再切清楚一層。

---

## 3. 目前正確停點

截至 `quote-cost ecosystem fallback retirement Phase 2`：
- closeout list 已不再直接 fallback 到 seed closed source
- 已新增 `closeout-archive-source.ts`
- `closeout` list / detail 已開始透過 archive source 邊界承接資料

正式判定：
> closeout 已經從「頁面自行 filter quote-cost source」前進到「有第一輪 archive source 邊界」，但尚未 fully closeout-native。

---

## 4. 目前仍未 fully formalized 的核心原因

目前 closeout 仍未 fully formalized，主因不是列表，而是：

### 4.1 closeout detail 仍沿用 `QuoteCostDetailClient`
這代表：
- closeout detail 雖然 source 較乾淨
- 但 detail page 的語意仍偏 quote-cost financial detail 骨架
- 尚未完全成為 archive-only view

### 4.2 archive-only semantics 尚未抽離
closeout 應逐步理解為：
> **已結案專案 archive / retained view**

但目前 detail 心智仍部分停留在 active financial page 的延伸。

### 4.3 server props / read-model 還不夠 closeout-native
目前 closeout detail 雖已開始承接 archive source，
但 read-model 與 server props 還未完全形成 closeout 自己的正式責任邊界。

---

## 5. 下一輪 formalization 正式目標

### 5.1 closeout detail 專屬 archive read-model
- closeout detail 應有自己更清楚的 archive read-model 邊界
- 不再只是共用 quote-cost detail 的中間態

### 5.2 closeout detail server props 專屬化
- server props 應明確標示自己承接的是 closeout archive source
- 不再混成一般單案 financial detail payload 的延伸

### 5.3 archive-only semantics 抽離
- closeout detail 的語意應更明確偏 archive / retained / closed-result
- 不再混帶 active financial page 的過渡語意

正式原則：
> 不一定要立刻長出另一套全新 UI，但資料責任與語意責任必須先切清楚。

---

## 6. 本輪不做什麼

下一輪 closeout formalization 仍不是：
1. 不重開 UI 骨架
2. 不新增欄位
3. 不擴到其他模組
4. 不一次重寫整個 closeout architecture
5. 不把這輪變成 closeout 新功能回合

正式原則：
> 這輪先 formalize read-model 與 archive-only semantics，不是做新功能頁。

---

## 7. 與其他主線的關係

## 7.1 與 quote-cost ecosystem
closeout 這輪 formalization 是 `quote-cost ecosystem` 後半段的自然承接，不是新分支。

## 7.2 與 Accounting Center
closeout 若更 fully formalized，後續 `Accounting Center` higher-level summary / overview 也會更容易 same-source。

## 7.3 與 Vendor Data
這輪不直接處理 Vendor Data，但 closeout formalization 完成後，整體 financial ecosystem 的 spine 會更穩。

---

## 8. 後續 CTO work package 方向（高階）

依本文件，後續 CTO 可拆成：
1. closeout detail archive read-model audit
2. closeout detail server props source cleanup
3. closeout archive-only semantics extraction
4. closeout implementation closure

---

## 9. 一句話總結

> closeout 下一輪最正確的 formalization 主線，不是改 UI，而是補 archive read-model 與 closeout-native data boundary：讓 closeout detail 不再只是 `QuoteCostDetailClient` 的延伸中間態，而能更明確承接 archive-only source、archive-only semantics 與 server props，逐步成為真正的 closeout archive / retained view。