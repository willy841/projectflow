# MD-SUMMARY — projectflow Current System One-Page — 2026-05-11

Status: ACTIVE / ONE-PAGE ENTRY  
Role: `projectflow` 新 session / 新接手者的 30 秒摘要入口。  
Goal: 用單頁方式快速說清楚：現在這個系統是什麼、做到哪裡、主線是什麼、不要再怎麼誤讀。

---

## 1. 這個系統現在是什麼

`projectflow` 現在不是早期探索中的半成品，也不是只靠 mock / local fallback 撐著的 UI 原型。

正式判讀是：

> **`projectflow` 已進入正式成熟系統階段。**

它現在的特徵是：
- 有已收斂的現行規則
- 有高成熟度產品驗收主線
- 有 source-of-truth / cross-page consistency 驗收框架
- 有正式資料治理與 confirmation / snapshot 主線
- 有正在進行的 local / fallback / bridge 殘留鏈退休工程

也就是：

> **現在的 `projectflow` 主線，不是「還要不要先把頁面做起來」，而是「如何維持成熟系統的一致性、正式 truth 與後續收斂品質」。**

---

## 2. 現在真正的治理入口

先讀：
1. `MD-MASTER-projectflow-system-source-of-truth.md`
2. `MD-INDEX-projectflow-governing-document-architecture-2026-05-11.md`
3. `MD-INDEX-projectflow-active-secondary-historical-map-2026-05-11.md`
4. 本文件 `MD-SUMMARY-projectflow-current-system-one-page-2026-05-11.md`
5. `MD-INDEX-projectflow-missing-legacy-reference-audit-2026-05-11.md`

這五份的分工：
- `MD-MASTER`：總控母檔
- `governing architecture`：文件分層架構
- `active/secondary/historical map`：分類地圖
- 本文件：最短判讀摘要
- `missing legacy reference audit`：缺失舊引用清單

---

## 3. 現在主線的四個核心

### A. 現行規則主線
以：
- `MD155`
- `MD156`
- `MD157`

為準。

關鍵包括：
- 測試站單軌優先，正式站先凍住
- 設計 / 備品確認後直接去 project-level document
- dispatch 工種 / 廠商必須來自 Vendor Data
- vendor reconciliation amount 正式來源是 `financial_reconciliation_groups`
- vendor detail performance 仍是 open task，不能亂說已解

### B. 成熟度判讀主線
以：
- `MD158`
- `MD163`
- `MD164`

為準。

這層代表：
- 主線驗收已高成熟度
- 資料治理已進入高完成度前段
- 技術尾巴已收斂成可管理清單

### C. 驗收體系主線
以：
- `MD167`
- `MD168`
- `MD171`
- `MD172`
- `MD173`

為準。

這層代表：
- 驗收不能只看單頁 clickpath
- 要驗 source-of-truth
- 要驗 cross-page consistency
- 要驗 status transition 後 downstream readback
- A~H regression packs 已落地成 `25~32`

### D. 最新工程收斂主線
以：
- `MD203`~`MD210`

為準。

這層代表：
- design / procurement / vendor 還有 local / fallback / bridge 殘留鏈要退休
- 最新工程主線是在做正式 truth 收斂，不是在重談早期產品 spec

---

## 4. 現在不要再怎麼誤讀

### 不要再把這個系統當成早期探索期
錯誤理解：
- 還在定大方向
- 還在決定要不要正式化
- 還在先做 mock 看看

現在正確理解：
- 大方向已定
- 正式治理入口已建立
- 現在是在維持成熟系統一致性，並收尾殘留 truth 分裂問題

### 不要再從早期 MD 當主入口
尤其不要直接從：
- `MD21`
- `MD26`
- 早期 UI handoff
- 單頁 spec

起手判斷現在規則。

它們可以回查，但不能主導現在。

### 不要把 200 多號 MD 當成雜訊
`MD203~210` 不是旁支討論，
而是現在成熟系統正在做的工程主線之一：

> **把 local / fallback / bridge 假扮正式 truth 的殘留鏈，逐段退出正式主線。**

---

## 5. 現在這個系統做到哪裡

若用管理語言總結：

- 產品層：已高成熟度
- 驗收層：已制度化，不再只是 clickpath
- 資料治理層：已正式化，不再只是口頭規則
- 工程層：正在把殘留 compatibility / fallback truth 鏈收乾淨

所以最準確的說法不是：
- 「這系統差不多做完」

而是：

> **這系統已經成熟，現在主線是治理、驗收、一致性與殘留鏈退休。**

---

## 6. 新 session 的最小安全讀法

如果只是要快速接上：

1. `MD-MASTER`
2. `MD-INDEX-projectflow-governing-document-architecture-2026-05-11.md`
3. `MD-INDEX-projectflow-active-secondary-historical-map-2026-05-11.md`
4. 本文件
5. `MD155`
6. `MD156`
7. `MD157`

如果要碰驗收 / source-of-truth / 工程收斂，再往下補：
- `MD158`
- `MD163`
- `MD164`
- `MD167`
- `MD168`
- `MD171`
- `MD172`
- `MD173`
- `MD203~210`

---

## 7. 一句話總結

> **`projectflow` 現在應被視為正式成熟系統；後續續接必須從治理母檔與索引進入，並以現行規則、成熟度判讀、全站驗收體系與最新正式 truth 收斂工程線來理解它，而不是再回到早期 spec / handoff 當主入口。**
