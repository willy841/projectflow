# MD39 - projectflow Vendor Data 上下游對齊規則 v1（2026-04-08）

> 目的：整理 `Vendor Data` 模組與上游 `Project Detail`、中游 `報價成本 / Financial Detail` 的正式對齊規則，明確定義 vendor 模組在整個 `projectflow` 系統中的位置與責任。
>
> 本檔承接：
> - `MD38-projectflow-vendor-data-module-v1-spec-2026-04-08.md`
>
> 本檔目前先不碰 DB，只定義功能架構、來源邊界與承接規則。

---

# 1. 目的

目前 `Vendor Data` 模組在系統中的角色，不再只是下游付款承接模組。
它同時也與上游 `Project Detail` 有正式關聯。

因此需要先明確定義：
1. `Vendor Data` 與上游的對齊點
2. `Vendor Data` 與中游的對齊點
3. `Vendor Data` 自身模組責任邊界

---

# 2. 一句話總結

> `Vendor Data` 模組同時扮演兩種角色：一方面它是上游 `Project Detail` 可選 vendor 的來源池，另一方面它也是下游承接報價成本確認對帳後正式成立 vendor 金額的管理模組。

---

# 3. 與上游 `Project Detail` 的對齊規則

## 3.1 上游對齊點
`Vendor Data` 與上游的正式對齊點目前有兩個：

### 對齊點 A：vendor source
> **當廠商建立完成後，在上游專案 `Project Detail` 頁面裡，使用者就必須選得到該廠商。**

### 對齊點 B：trade source
> **當工種已在「廠商資料」模組中建立完成後，在上游專案 `Project Detail` 頁面裡，使用者就必須選得到該工種。**

## 3.2 正式規則
- `Vendor Data` 建立出的 vendor
- 必須能回流到上游 `Project Detail`
- 成為上游 vendor selector / 廠商選擇欄位的正式可選來源
- `Vendor Data` 中已建立的工種
- 也必須能回流到上游 `Project Detail`
- 成為上游 trade selector / 工種選擇欄位的正式可選來源

## 3.3 語意定義
這代表：
> **`Vendor Data` 不只是 archive / payable 承接模組，同時也是上游專案可選 vendor 與 trade 的來源池。**

## 3.4 產品層次的對齊方式
目前先對齊的是：
- 建立完成後，上游可選到該 vendor
- 已建立的工種，上游也可選到該 trade
- 上游 vendor selector 與 `Vendor Data` 的 vendor list 應來自同一份來源池
- 上游 trade selector 與 `Vendor Data` 的 trade list 應來自同一份來源池

目前先不定：
- DB key / FK
- persistence schema
- API contract

---

# 4. 與中游 `報價成本 / Financial Detail` 的對齊規則

## 4.1 中游對齊點
`Vendor Data` 與中游的正式對齊點是：

> **vendor 的未付款 / 合作紀錄金額，不承接自帳務中心，而承接自報價成本中完成確認對帳後正式成立的金額。**

## 4.2 正式規則
- 未確認對帳的金額，不進 `Vendor Data`
- 暫估 / 草稿中的 vendor 金額，不進 `Vendor Data`
- 任務回覆中的未確認數字，不進 `Vendor Data`
- 只有在 Financial / 報價成本裡完成 `確認對帳` 後，該 vendor 金額才正式成立
- 成立後才可承接到：
  - `Vendor Detail` 的未付款專案區
  - `Vendor Detail` 的合作紀錄區

## 4.3 語意定義
這代表：
> **報價成本負責讓 vendor 金額正式成立；Vendor Data 負責承接成立後的 payable 與合作紀錄。**

## 4.4 承接單位
目前正式承接單位為：
- **`專案 × 廠商`**

不是：
- task 粒度
- 單筆回覆粒度
- account-center client 收款粒度

---

# 5. `Vendor Data` 自身模組責任邊界

## 5.1 `Vendor Data` 應承接的責任
1. vendor 主檔管理
2. vendor 建立入口
3. vendor 作為上游可選來源池
4. trade / 工種來源池管理
5. vendor 未付款專案承接
6. vendor 合作紀錄查閱

## 5.2 `Vendor Data` 不承接的責任
1. client 收款管理
2. 帳務中心主控台
3. project level 結案主頁
4. 報價成本金額正式成立邏輯

## 5.3 模組位置總結
`Vendor Data` 目前在整個 `projectflow` 裡的正確位置應理解為：

> **上游 vendor source + 下游 vendor payable / archive 的中間樞紐模組**

也就是：
- 向上游提供 vendor 可選來源
- 向中游 / 下游承接已成立金額與合作紀錄

---

# 6. 對齊後的系統理解

## 6.1 上游
- `Project Detail` 選擇 vendor
- vendor 來源來自 `Vendor Data`
- `Project Detail` 選擇工種
- trade 來源也來自 `Vendor Data`

## 6.2 中游
- `報價成本 / Financial Detail` 完成確認對帳
- vendor 金額正式成立

## 6.3 下游
- `Vendor Data` 承接未付款與合作紀錄
- `Closeout` 則承接 project view 的歷史 archive

這代表：
> **Vendor Data` 並不是被動歷史庫，而是貫穿上游選擇、下游承接的橋接模組。**

---

# 7. 正式結論

> `Vendor Data` 模組已適合開始與上游 / 中游做功能架構與語意對齊；其中與上游的正式對齊點有兩個：一是「建立完成的 vendor 必須能在 `Project Detail` 中被選到」，二是「在廠商資料模組中已建立的工種，也必須能在 `Project Detail` 中被選到」；與中游的正式對齊點則是「vendor 未付款與合作紀錄只承接報價成本中完成確認對帳後正式成立的金額」；但目前仍不應直接進入 DB / API / persistence 級別的對齊。
