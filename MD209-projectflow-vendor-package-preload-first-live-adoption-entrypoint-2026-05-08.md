# MD209 — projectflow vendor package preload first live adoption entrypoint — 2026-05-08

Status: ACTIVE / ENTRYPOINT DECISION  
Parent:
- `MD208-projectflow-vendor-package-bridge-async-db-adoption-plan-2026-05-08.md`
- vendor residual chain live adoption follow-through

---

## 0. 這份文件在做什麼

這份文件要解的不是「要不要做 preload adoption」，
而是：

> **第一個真正把 `preloadedDbPackages` 餵進 `getQuoteCostProjectsForClientFallback()` 的 runtime 入口，應該選哪裡。**

這件事如果選錯頁，後面會白做。

---

## 1. 已查到的實際 routing 結構

### 1.1 legacy quote-cost route 並不是入口
以下兩個頁面只是 redirect：

- `src/app/quote-cost/page.tsx`
- `src/app/quote-cost/[id]/page.tsx`

結論：
- 不能把 preload adoption 接在這兩頁
- 這兩頁不是 live consumer

### 1.2 真正活著的 quote-cost 入口
目前 live 入口是：

- `src/app/quote-costs/page.tsx`
- `src/app/quote-costs/[id]/page.tsx`

其中：
- list page 走 `getQuoteCostProjectsWithDbFinancials()`
- detail page 走 `getQuoteCostDetailReadModel(id)`

---

## 2. 第一個最適合接 preload 的頁面

### 結論
第一個最適合接 `preloadedDbPackages` 的，不是 list page，
而是：

> **`src/app/quote-costs/[id]/page.tsx`**

原因：

### 2.1 detail page already server-side
它本來就是 async server page：
- `await getQuoteCostDetailReadModel(id)`

所以：
- 最容易追加 DB package preload
- 不需要先把 page 從 client-only 改造回 server

### 2.2 detail page scope 最小
它只處理單一 project id：
- preload package list 可直接 project-scoped
- 不需要先處理整張 list 的批量 package preload

### 2.3 detail page 對 vendor residual cost side 最直接
目前要先驗的是：
- `workflow-cost-bridge.ts` 的 vendor residual segment

而 detail page 本來就是最貼近 cost breakdown 的地方，
所以最適合作為 first live adoption entrypoint。

---

## 3. 為什麼不是 list page 先做

`src/app/quote-costs/page.tsx` 雖然也是 server page，
但目前它吃的是：

- `getQuoteCostProjectsWithDbFinancials()`

list page 的主要責任是：
- project 列表
- 狀態摘要
- attention sorting

它不是第一個驗 vendor package preload 對 cost breakdown 影響的最好地方。

若太早在 list page 做：
- 會先碰批量 preload
- 需要想 cache / fan-out / 全量 package list
- 驗證面更大

所以不建議作為第一個 live adoption 入口。

---

## 4. 最小實作建議

### B2 vendor residual first live adoption
在 `src/app/quote-costs/[id]/page.tsx` 先做：

1. 額外 fetch project-scoped vendor package preload
2. 將 preload package list 傳給 detail / downstream cost resolver
3. 讓 `getQuoteCostProjectsForClientFallback(preloadedDbPackages)` 第一次走 db-package-source branch

### 重要原則
- 先只做 detail page
- 先只做 project-scoped package preload
- 不一次推到 list page / project detail vendor section

---

## 5. adoption 後應驗什麼

第一個 live adoption 做完後，至少要驗：

1. `workflow-cost-bridge.ts` vendor residual branch 是否實際吃到 `db-package-source`
2. quote-cost detail vendor package item 是否仍可正常顯示
3. 若 local package store 有資料，source precedence 是否仍符合預期
4. build / route render / hydration 是否正常

---

## 6. 直接結論

一句話版本：

> **`preloadedDbPackages` 的第一個 live adoption 入口不該接在 legacy redirect route，也不該先接 list page；最正確的第一刀是 `src/app/quote-costs/[id]/page.tsx`，因為它已是 async server page、範圍最小、又最直接連到 vendor residual 的 cost breakdown。**
