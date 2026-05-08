# MD208 — projectflow vendor package bridge async DB adoption plan — 2026-05-08

Status: ACTIVE / ADOPTION PLAN  
Parent:
- `MD198-projectflow-local-execution-readback-replacement-execution-spec-2026-05-08.md`
- `MD199-projectflow-source-of-truth-declaration-v1-2026-05-08.md`
- vendor residual chain follow-through
- `MD207-projectflow-vendor-residual-assignment-fallback-replacement-shape-2026-05-08.md`

---

## 0. 這份文件在做什麼

這份文件不是直接把 `vendor-package-adapter` 硬接進 client component。

它處理的是：

> **`workflow-vendor-package-bridge.ts` 要怎麼在不破壞目前同步 client readback 結構的前提下，正式採用 async DB package source。**

也就是把「DB provider interface 已抽出」這件事，往真正 adoption path 推進一層。

---

## 1. 現況結構

目前 `workflow-vendor-package-bridge.ts` 已經有三層 source shape：

1. local package provider
2. formal-row fallback provider
3. db provider interface stub

目前 runtime shape 已明確記為：

- `local-provider-first-formal-row-fallback-second-db-provider-stub-third`

問題不是 shape 不清楚，
而是：

> **client bridge 本體仍是同步函式，**
> **而 `vendor-package-adapter` 是 async DB source。**

所以 adoption 不能直接硬塞。

---

## 2. 為什麼不能直接硬接 async DB source

`workflow-vendor-package-bridge.ts` 目前對外 export：

```ts
getVendorPackagesForWorkflowProject(projectId): { source, packages }
```

這是同步 API。

但 `vendor-package-adapter.ts` 的正式入口是：

- `listDbVendorPackages(): Promise<VendorPackage[]>`
- `getDbVendorPackageById(id): Promise<VendorPackage | null>`

也就是：
- source shape 對齊了
- **但 call contract 還沒對齊**

所以現在不能直接：
- 在同步 bridge 裡 await DB
- 或偷偷把 async 包成假同步

這會破壞目前 consumer 預期。

---

## 3. 可行 adoption path

### 3.1 路徑 A — server-side preload（推薦）

做法：
1. 在 server route / server component / loader 先呼叫 `listDbVendorPackages()` 或 project-scoped package query
2. 先把 `VendorPackage[]` preload 到 consumer 需要的地方
3. 再讓 client bridge consume preload data，而不是自行抓 DB

適合：
- project detail shell
- quote-cost server-prepared payload
- project-scoped loader already on server

優點：
- 保持 client bridge 同步 shape
- 不需要在 bridge 層引入 fetch lifecycle
- source-of-truth 比較乾淨

### 3.2 路徑 B — loader-mediated fetch（可接受）

做法：
1. 建一層 async loader / hook / resource fetcher
2. loader 先取 DB package data
3. bridge 改 consume loader resolved package list

適合：
- 現有頁面無法快速改成 server preload
- 需要逐步導入 async package source

缺點：
- client loading / stale / hydration 風險較高
- 比 server preload 更容易變複雜

### 3.3 路徑 C — 直接在 bridge 內 async 化（不推薦）

目前不建議。

原因：
- 會把同步 consumer contract 一次打破
- 牽連 `workflow-cost-bridge.ts` / project detail / 其他同步 readback 鏈
- 不是小刀

---

## 4. 最小 adoption interface 建議

建議不要先改 `getVendorPackagesForWorkflowProject(projectId)` 的同步簽名，
而是先增加一層明確輸入：

```ts
export type WorkflowVendorPackageBridgeInput = {
  projectId: string;
  preloadedDbPackages?: VendorPackage[] | null;
};
```

然後 bridge 可演化成：

```ts
getVendorPackagesForWorkflowProject(input: WorkflowVendorPackageBridgeInput)
```

或 transitional 包法：

```ts
getVendorPackagesForWorkflowProject(projectId: string, options?: { preloadedDbPackages?: VendorPackage[] | null })
```

原則：
- 先讓 DB source 以 preload 形式進來
- bridge 只負責 source selection
- 不先把 async lifecycle 拉進 bridge 本體

---

## 5. source selection 順序建議

在正式 adoption 後，建議順序為：

1. `preloadedDbPackages`（若存在）
2. local package store（若仍需過渡）
3. formal-row fallback

也就是：

### 過渡期 runtime shape
- `db-preload-first-local-second-formal-row-fallback-third`

而不是永久停留在：
- `local-first`

---

## 6. 哪些 consumer 最適合先接 DB preload

### 6.1 `workflow-cost-bridge.ts`
最適合先接。

原因：
- 它目前已經只吃 package output
- 不再直接碰 `savedVendorAssignments`
- vendor residual consumer 已被收斂

所以如果要先做第一個 DB adoption，
最自然的 consumer 就是：

> **cost bridge 的 vendor residual segment**

### 6.2 project detail vendor section
不建議優先。

原因：
- 它仍 heavily local / UI-driven
- package create / sync / inline edit 還綁 local package store
- 若太早切，風險較高

---

## 7. adoption 前置條件

在實作 async DB adoption 前，至少要先確認：

1. consumer 是否能接收 preload package list
2. page / shell 是否已有 server-side data loading path
3. 若 local package store 與 DB package 同時存在，優先順序怎麼定
4. local package store 是不是只保留 draft / unsynced edit 角色

也就是：

> adoption 前不只要有 provider interface，
> 還要有 preload ownership 與 source precedence 規則。

---

## 8. 最推薦的下一刀

最推薦的下一步不是直接 async 化 bridge，
而是：

### B2 vendor residual next cut
**在 `workflow-cost-bridge.ts` 端先加 preload-ready input shape**

也就是先讓 cost bridge 能接受：
- optional preloaded vendor packages

如此一來：
- DB package source 可以先從 server preload 注入 cost bridge
- 不必先動 project detail vendor section
- 可以先讓 vendor residual cost side 脫 local package store

---

## 9. 本段完成條件

這份 async adoption plan 要算完成，至少要達成：

1. 明確定義為什麼不能直接把 async DB source 硬接進同步 bridge
2. 明確提出 server preload / loader-mediated 兩條可行路徑
3. 明確指出最推薦 consumer 是 `workflow-cost-bridge.ts`
4. 明確定義 adoption 前需有 preload ownership 與 source precedence

---

## 10. 直接結論

一句話版本：

> **`workflow-vendor-package-bridge.ts` 的 DB source adoption，最穩的做法不是讓 bridge 本體 async 化，而是先讓 server-side / loader 預先拿到 `vendor-package-adapter` 的 package list，再以 preload 形式餵進目前已同步化的 package-output consume 鏈；第一個最適合接這條路的是 `workflow-cost-bridge.ts` 的 vendor residual segment。**
