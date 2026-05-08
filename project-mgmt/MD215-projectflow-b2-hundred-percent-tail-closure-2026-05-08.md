# MD215 — projectflow B2 hundred-percent tail closure — 2026-05-08

Status: ACTIVE / 100% TAIL CLOSURE

Parent:
- `MD214-projectflow-b2-tail-cleanup-closure-2026-05-08.md`

---

## 1. 目的

這份文件記錄在 B2 active mainline closure 與 tail cleanup closure 之後，再把剩餘 near-active transitional 面進一步隔離，讓 active runtime 與 legacy fallback path 的界線更乾淨，作為本輪 100% 收尾。

---

## 2. 本輪要處理的最後兩塊

### 2.1 `workflow-vendor-package-bridge.ts`

雖然 active mainline 已使用 preload / DB package source，但 bridge 仍保留：
- local package store
- assignment-fallback

本輪的目標不是一次刪光 legacy string mode，而是：
- 確保 **object input mode（active runtime 使用模式）只走 preload path**
- 把 local / assignment fallback 壓縮到 legacy string mode

這代表 active runtime 與 legacy fallback 正式分離。

### 2.2 `workflow-derived-board.ts`

雖然它已不在 active quote-cost mainline 阻塞鏈中，但檔案內仍保留：
- local execution readback runtime path
- fixture fallback path

本輪目標是：
- 將其收斂成 pure formal-row mapper / record mapper 模組
- 去除 local runtime readback projection bridge 角色

---

## 3. 本輪完成的事

### 3.1 vendor package bridge：object input mode 改為 preload-only strict path

完成：
- `getVendorPackagesForWorkflowProject()` 在 object input 模式下：
  - 不再回頭看 local package store
  - 不再回頭看 assignment-fallback
  - 直接回傳 `preloadedDbPackages` 對應 project 的結果，無資料就空陣列
- local package store / assignment-fallback 僅保留在 legacy string mode

這代表：
- active runtime 使用 bridge boundary 時，正式與 legacy fallback 隔離

---

### 3.2 workflow-derived-board：收斂成 formal-row board-record mapper

完成：
- 移除 local runtime readback 邏輯
- 移除 fixture fallback / local storage dependency
- `getDesignBoardRecordsForReadback()` / `getProcurementBoardRecordsForReadback()` 改為單純吃 formal rows 並 map 成 board records
- boundary 改為：
  - `mode: formal-row-board-record-mapper`
  - `sources: formal-readback-rows-only`
  - `runtimeSourceStatus: no-local-runtime-readback-path`

這代表：
- 這個模組已不再作為 transitional local execution projection bridge
- 而是正式 mapper / adapter surface

---

## 4. 驗證

本輪 100% 收尾後再次驗證：

- `npm run build`：成功
- `/api/internal/quote-cost-preload-parity`：持續維持
  - `projectCount = 19`
  - `mismatchProjectCount = 0`

---

## 5. 完成判定

若把「100% 收尾」定義為：

> 除了 active mainline closure 完成外，再把 near-active transitional 面中，仍可能讓 active runtime 回頭踩到 legacy path 的入口隔離或移除，直到 active runtime 與 legacy fallback 的邊界清楚、主要 compatibility surface 全數收乾淨。

則本輪可判定：

# 已完成

理由：
1. active quote-cost mainline 已先前完成 closure
2. unused client fallback project assembler 已移除
3. legacy vendor financial relations helper 已退休
4. vendor package bridge 在 active object input mode 下已切成 preload-only strict path
5. workflow-derived-board 已收斂成 pure formal-row mapper，去除 local runtime readback path
6. build 與 parity 均持續通過

---

## 6. 現在真正還剩的是什麼

到這一步後，剩下的不再屬於本輪 B2 100% 收尾範圍，而是更外圍的未來優化候選：

1. 若未來要徹底刪掉 legacy string mode，可再安排完全移除 `workflow-vendor-package-bridge.ts` 內 local package store / assignment-fallback
2. 若未來要把 broader board/runtime 也完全 formalize，可再往 page-level upstream row provider 一路推到底
3. targeted acceptance / end-to-end page walkthrough 仍可再補強

但這些已不再構成本輪未完成事項。

---

## 7. 一句話總結

> **B2 這輪已完成 100% 收尾：active runtime 已與 legacy fallback 明確隔離，mainline、tail cleanup、near-active transitional 面都已收斂完畢，build 與 parity 持續正常。**
