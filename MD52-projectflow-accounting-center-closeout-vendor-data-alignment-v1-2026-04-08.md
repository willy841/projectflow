# MD52 - projectflow Accounting Center × Closeout × Vendor Data 對齊規則 v1（2026-04-08）

> 目的：整理 `Accounting Center`、`Closeout`、`Vendor Data` 三條下游主線之間的正式視角、主體、承接範圍與邊界規則，避免後續續接時再次把三者混成同一條資料主線。
>
> 本檔承接：
> - `MD38-projectflow-vendor-data-module-v1-spec-2026-04-08.md`
> - `MD39-projectflow-vendor-data-upstream-midstream-alignment-v1-2026-04-08.md`
> - `MD40-projectflow-closeout-module-v1-spec-2026-04-08.md`
> - `MD44-projectflow-accounting-center-operating-expense-module-v1-spec-2026-04-08.md`
> - `MD49-projectflow-accounting-center-revenue-overview-v1-spec-2026-04-08.md`
> - `MD50-projectflow-accounting-center-master-spec-and-downstream-alignment-2026-04-08.md`
>
> 本檔目前先不碰 DB、API、persistence，只定義產品層的對齊語意與模組邊界。

---

# 1. 一句話總結

> `Accounting Center`、`Closeout`、`Vendor Data` 不是同一份資料的三個重複入口，而是承接同一批專案關聯結果的三種不同視角：`Accounting Center` 看進行中與經營管理、`Closeout` 看已結案專案結果、`Vendor Data` 看 vendor 視角的未付款與合作紀錄。

---

# 2. 三模組正式視角

三個模組的正式視角先定為：

1. **Accounting Center = 進行中 / 經營管理視角**
2. **Closeout = 已結案 / 專案結果視角**
3. **Vendor Data = 廠商主體 / 應付款視角**

正式原則：
- 三者不是互相取代關係
- 三者也不是同一份資料的重複呈現頁
- 三者承接的是不同層級、不同主體、不同管理目的

---

# 3. 三模組正式主體

三個模組的主體正式定為：

1. **Accounting Center = 月份 / 進行中管理主體**
2. **Closeout = 已結案專案主體**
3. **Vendor Data = 廠商主體**

正式原則：
- `Accounting Center` 不以單一已結案專案作為主體
- `Closeout` 不以月份統計作為主體
- `Vendor Data` 不以專案總覽或月份摘要作為主體

---

# 4. 三模組承接範圍

## 4.1 Accounting Center 承接範圍
`Accounting Center` 承接：
- 進行中專案帳務管理
- 管銷成本（= 營運支出）
- 營收概況摘要

## 4.2 Closeout 承接範圍
`Closeout` 承接：
- 已結案專案的最終收入
- 已結案專案的最終成本
- 已結案專案的唯讀留存資料

## 4.3 Vendor Data 承接範圍
`Vendor Data` 承接：
- 廠商主檔
- vendor 未付款
- vendor 合作紀錄
- 以 `專案 × 廠商` 為單位的 payable / 歷史承接

---

# 5. Accounting Center 與 Closeout 的對齊規則

正式規則：

> **Closeout 承接單一已結案專案的最終結果本體；Accounting Center 只承接這些結果的摘要統計，不取代 Closeout 作為單案 archive 主頁。**

## 5.1 Closeout 的責任
- 承接單一已結案專案的完整結果
- 作為 archive / retained / 唯讀主頁
- 讓使用者回看專案最終活動資訊、最終文件結果、最終財務結果

## 5.2 Accounting Center 的責任
- 承接進行中帳務管理
- 承接時間範圍下的收入 / 成本 / 營運支出 / 利潤摘要
- 不取代 `Closeout` 作為單一已結案專案詳情頁

正式原則：
> `Accounting Center` 是 summary / management layer；`Closeout` 是 closed-project archive layer。

---

# 6. Vendor Data 與另外兩模組的邊界

正式規則：

> **Vendor Data 不承接專案級營收摘要，也不承接已結案專案 archive；Vendor Data 只承接 vendor 視角的未付款與合作紀錄。**

## 6.1 Vendor Data 不承接的內容
- 不承接 `Accounting Center` 的月份摘要
- 不承接 `營收概況` 的收入 / 成本 / 利潤摘要
- 不承接 `Closeout` 的專案 archive 主頁角色

## 6.2 Vendor Data 應承接的內容
- 廠商主檔資料
- 與該廠商有關的未付款專案
- 與該廠商有關的合作紀錄
- 該廠商在各專案中的 payable / 已付款 / 歷史狀態

正式原則：
> Vendor Data 是 vendor-side management / lookup layer，不是 project-side archive，也不是 business summary layer。

---

# 7. `專案 × 廠商` 的正式承接地位

正式規則：

> **`專案 × 廠商` 是 Vendor Data 的核心承接單位，但不是 Closeout 或 Accounting Center 的核心主體。**

## 7.1 Vendor Data
- 以 `專案 × 廠商` 為單位承接 payable / 未付款 / 合作紀錄
- vendor detail 中的未付款與歷史往來，都應以此粒度理解

## 7.2 Closeout
- 以 `專案` 為主體承接最終結果
- 不以 `專案 × 廠商` 作為頁面主體

## 7.3 Accounting Center
- 以月份 / 經營摘要為主體
- 不以 `專案 × 廠商` 作為統計主體

正式原則：
> `專案 × 廠商` 是 vendor 視角的關係單位，不可反過來拿它重塑 `Closeout` 或 `Accounting Center` 的主體結構。

---

# 8. 已結案後的 vendor 合作紀錄如何理解

正式規則：

> **專案結案後，Closeout 承接的是專案結果本體；Vendor Data 仍可保留該 vendor 與該專案的合作紀錄，但這只是 vendor 視角的歷史承接，不等於 Closeout archive 本體。**

## 8.1 Closeout 的歷史承接
- 承接已結案專案的最終結果
- 是專案層級的 archive
- 專案為主體，不是廠商為主體

## 8.2 Vendor Data 的歷史承接
- 保留該 vendor 曾參與哪些專案
- 保留該 vendor 在各專案中的付款 / 往來紀錄
- 是 vendor 視角的歷史承接

正式原則：
> 同一個已結案專案，可以同時存在於 `Closeout` 與 `Vendor Data`，但兩者角色完全不同：前者是專案結果 archive，後者是 vendor 合作歷史。

---

# 9. 三模組不可再混用的地方

後續續接時，以下幾件事不可再混：

1. 不可把 `Accounting Center` 當作 `Closeout` 的單案 archive 詳情頁
2. 不可把 `Closeout` 當作月份統計或經營摘要主頁
3. 不可把 `Vendor Data` 當作專案結果 archive
4. 不可把 `Vendor Data` 當作營收 / 利潤摘要頁
5. 不可把 `專案 × 廠商` 關係單位錯當成 `Accounting Center` 的核心統計主體
6. 不可再把 `Vendor Data` 與 `Accounting Center` 混成同一條線

---

# 10. 一句話定稿

> `Accounting Center`、`Closeout`、`Vendor Data` 三條下游主線應正式理解為：`Accounting Center` 以月份與進行中經營管理為主體，承接進行中專案帳務、管銷成本與營收概況；`Closeout` 以已結案專案為主體，承接單一專案的最終收入、最終成本與唯讀留存結果；`Vendor Data` 則以廠商為主體，承接 vendor 主檔、未付款、合作紀錄與 `專案 × 廠商` 的 payable 關係。三者可以承接同一批關聯結果，但不可互相取代，也不可再混成同一條資料主線。
