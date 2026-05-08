# MD210 — projectflow vendor package live adoption blocker at detail client boundary — 2026-05-08

Status: ACTIVE / BLOCKER DECISION  
Parent:
- `MD208-projectflow-vendor-package-bridge-async-db-adoption-plan-2026-05-08.md`
- `MD209-projectflow-vendor-package-preload-first-live-adoption-entrypoint-2026-05-08.md`

---

## 0. 這份文件在做什麼

這份文件要釘死一件事：

> **為什麼我們雖然已經找到第一個 live adoption entrypoint 在 `quote-costs/[id]/page.tsx`，但目前仍不能誠實宣稱 vendor package DB preload 已 live。**

---

## 1. 已查證的事實

### 1.1 第一個正確入口已確定
已確定第一個最適合的入口是：
- `src/app/quote-costs/[id]/page.tsx`

原因：
- 它是 async server page
- scope 最小
- 最直接連到 vendor residual cost breakdown

### 1.2 但 detail page 現在只做這件事
目前它只：
- `await getQuoteCostDetailReadModel(id)`
- 把 `project` / `initialPayload` 傳進 `QuoteCostDetailClient`

也就是：
- 它沒有 preload vendor package list
- 也沒有把 preload package list 往下傳

### 1.3 `QuoteCostDetailClient` 目前也沒有 package preload input
目前 client props 只有：
- `project`
- `mode`
- `presenter`
- `initialProject`

沒有：
- `preloadedDbPackages`
- `vendorPackagePreload`
- `costBridgeInput`

結論：

> **雖然 `workflow-cost-bridge.ts` 已有 preload-ready input shape，**
> **但 detail route/client 邊界還沒有把 preload 資料真正餵進去。**

---

## 2. 真正的 blocker 在哪裡

現在 live adoption 沒完成，不是卡在：
- `workflow-vendor-package-bridge.ts` shape
- `workflow-cost-bridge.ts` preload-ready input
- entrypoint 判斷

而是卡在：

> **`quote-costs/[id]/page.tsx` → `QuoteCostDetailClient` 這條 detail client boundary 還沒承接 package preload。**

這是目前最真實、最直接的 blocker。

---

## 3. 這代表什麼

### 已完成的
- DB provider interface 已有
- package-level shape 已對齊
- preload-ready cost bridge input 已有
- first live entrypoint 已選定

### 還沒完成的
- detail page 沒 fetch preload packages
- detail client 沒接收 preload packages
- cost detail render path 沒把 preload package list 傳進 fallback cost resolver

所以：

> **目前只能誠實說是 preload-ready，不能說 preload-supplied，更不能說 db-package-source 已 live。**

---

## 4. 下一個真正的實作刀

若要讓 live adoption 成立，至少要補這三步：

### 4.1 server page 先抓 project-scoped vendor packages
在 `src/app/quote-costs/[id]/page.tsx`：
- 額外 preload package list

### 4.2 detail client props 新增 preload package input
在 `QuoteCostDetailClient`：
- 新增 `preloadedDbPackages` 或等價 props

### 4.3 cost detail render path 實際把 preload 傳到 cost resolver
也就是真的讓：
- `getQuoteCostProjectsForClientFallback(preloadedDbPackages)`
走到 `db-package-source` branch

---

## 5. 直接結論

一句話版本：

> **我們已經找到了第一個正確的 live adoption 入口，也已經讓 cost bridge preload-ready，但真正卡住 live adoption 的地方，是 `quote-costs/[id]/page.tsx` 到 `QuoteCostDetailClient` 之間還沒有 package preload 邊界；在這條 boundary 打通前，不能誠實宣稱 vendor package DB preload 已 live。**
