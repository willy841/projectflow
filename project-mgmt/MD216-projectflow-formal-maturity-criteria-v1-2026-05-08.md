# MD216 — projectflow formal maturity criteria v1 — 2026-05-08

Status: ACTIVE / GOVERNANCE CRITERIA

---

## 0. 目的

這份文件不是在討論 UI，要排除以下因素：

1. **不以是否新增系統指引文字作為成熟度判定依據**
2. **不以是否再調整 UI 作為成熟度判定前提**

使用者已明確要求：
- UI 不再被動到
- 頁面上不要加任何系統指引文字

因此，`projectflow` 是否屬於「正式、成熟的系統」，之後應只從：
- 資料
- 主線
- 一致性
- 驗證
- 可維護性

來判定。

---

## 1. 正式成熟系統的核心定義

對 `projectflow` 來說，「正式、成熟的系統」定義如下：

> **在不修改 UI、也不依賴頁面指引文字的前提下，核心流程仍能依靠單一穩定的 truth source 正確運作，跨頁結果一致，修改影響可預期，驗證可重複，且新增需求不需要再重做真相收斂。**

這一定義是本文件後續所有成熟度判定的母規則。

---

## 2. 成熟度判定的八大標準

### 2.1 Truth source 單一且穩定

成熟系統必須滿足：
- 每個核心 domain 都有明確正式 truth source
- active runtime 不依賴隱性 local state 補洞
- 不同頁面不應各自拼不同真相
- 不能同時把 local draft / fallback / bridge output / fixture 視為同等 truth

**不成熟徵象：**
- 同一份資料在不同 runtime path 來自不同來源
- 真相來源需要靠人腦猜
- 出問題時只能靠 bridge patch 補洞

---

### 2.2 Active mainline 不再依賴 transitional chain

成熟系統允許歷史相容層存在，但不能讓 active mainline 活在過渡態。

必須滿足：
- active mainline 不再依賴 local fallback
- active mainline 不再依賴 compatibility bridge 作為 truth 組裝主體
- draft-derived truth 不可再是主線資料來源
- 過渡層若存在，只能隔離於主線之外

**不成熟徵象：**
- active runtime 仍會掉回 local draft chain
- compatibility layer 仍在替主線拼 truth
- 同一主線既吃 preload 又偷看 local persistence

---

### 2.3 Cross-page consistency 穩定成立

成熟系統不能只在單頁看起來正確。

必須滿足：
- 同一筆業務資料在核心頁面間一致
- 核心欄位在 detail / board / quote-cost / closeout / vendor financial / downstream summary 間不互相矛盾
- 狀態、金額、確認結果、文件狀態不可各頁各講各話

**不成熟徵象：**
- A 頁與 B 頁對同一筆資料顯示不同數字
- 一個頁面說已確認，另一頁說待確認
- 一條主線 closure 後，其他 downstream 頁面仍保留舊 truth

---

### 2.4 修改影響可預期、可控

成熟系統的結構應讓修改不再像踩地雷。

必須滿足：
- 改動影響面是已知的
- 主要依賴邊界清楚
- 修一個 domain 不會隨機炸別頁
- 同一類問題有固定修法，不必每次重新考古

**不成熟徵象：**
- 改一個 bridge，別的頁爆掉
- 改一個 cost source，sidebar 或 unrelated page 壞掉
- 每次修改都需要重新追 local / fallback / preload / adapter 的混線

---

### 2.5 驗證可重複，不靠感覺

成熟系統不能只靠「我看起來沒事」。

必須滿足：
- 對核心流程有固定驗證方法
- 至少包含：build、對齊檢查、必要的 targeted acceptance
- 驗證可以被重跑
- 驗證結果可作為 closure 證據

**不成熟徵象：**
- 只能人工肉眼感覺沒壞
- 缺少 build / parity / acceptance 類型的可重複檢查
- 同樣問題每次都只能重新手測、無法回歸驗證

---

### 2.6 資料修正、功能修正、顯示修正分層明確

成熟系統要能分清楚問題層次。

必須滿足：
- 資料問題回資料層修
- 顯示問題回 mapper / presenter / adapter 修
- 流程問題回 domain flow 修
- 不可把上層 UI 當補洞層

**不成熟徵象：**
- 資料錯誤靠 UI patch 掩蓋
- 顯示不一致靠提示文字補洞
- 流程不穩定靠頁面額外說明降低誤解

> 本標準明確排除：
> 「加系統提示文字」不是成熟度補救手段。

---

### 2.7 Legacy / fallback 存在但必須受控

成熟系統可以有 legacy，但不能失控。

必須滿足：
- 知道 legacy 在哪
- 知道誰在用
- 知道何時會被走到
- 不影響 active mainline correctness
- 最好有退出條件或退出計畫

**不成熟徵象：**
- 不知道哪些頁還在吃 fallback
- legacy path 仍可能在主線悄悄生效
- local draft / fixture / bridge output 仍會在無意中混入主線

---

### 2.8 新需求加入時，不需要重做真相收斂

這是成熟系統最關鍵的最終標準。

必須滿足：
- 新需求進來時，truth source 已知
- 主線資料鏈已知
- 不必再次重新找哪裡是真相
- 不必每次都先做大規模考古與收斂

**不成熟徵象：**
- 每來一個新功能就要重新梳 local / preload / fallback / adapter
- 每次擴充都先挖到舊 transitional 面
- 沒有穩定地基，只能一輪輪 patch

---

## 3. 正式成熟系統的最低 closure 條件

若要對某條主線宣稱「已達正式成熟水準」，至少要同時滿足以下條件：

1. truth source 已單一化
2. active mainline 已脫離 transitional chain
3. cross-page consistency 已驗證
4. build / parity / targeted acceptance 已通過
5. legacy / fallback 不再影響 active mainline correctness
6. 後續新增需求不需重做真相收斂

若缺少其中任一項，不應直接宣稱已成熟。

---

## 4. 對外宣稱分級

### 4.1 不可直接說「成熟」的情況

若仍存在下列任一情況，不建議對外宣稱為正式成熟系統：
- 核心頁面仍有明顯 truth split
- active mainline 仍依賴 local draft / compatibility bridge
- 驗證主要靠人工感覺
- cross-page consistency 尚未形成 closure
- 新需求仍需先做大量地基考古

### 4.2 可說「核心主線已正式收斂」的情況

若只完成某條核心主線 closure，較準確說法應為：
- **核心主線已正式收斂**
- **active mainline 已達正式化水準**
- **系統整體進入可持續 formalization 階段**

### 4.3 可說「系統已屬正式成熟」的條件

只有當多條核心 domain 都同時滿足本文件標準，且不再依賴大規模 transitional chain，才適合說：
- **系統已屬正式成熟**

---

## 5. 對 projectflow 後續工作的實際指引

之後若要判斷某一輪工作是否真的讓系統更成熟，不要再問：
- UI 有沒有更漂亮
- 有沒有新增提示文字
- 有沒有多一些系統說明

而應該問：
1. 這輪有沒有讓 truth source 更單一？
2. 這輪有沒有讓 active mainline 更脫離 transitional chain？
3. 這輪有沒有提升 cross-page consistency？
4. 這輪有沒有讓修改邊界更清楚？
5. 這輪有沒有增加可重複驗證能力？
6. 這輪之後，未來新需求還需不需要再做大規模真相收斂？

若答案多數是「有改善」，才算真的往成熟前進。

---

## 6. 一句話總結

> **正式成熟系統，不是 UI 更花，也不是多幾句指引文字；而是在不動 UI、不靠文字補洞的前提下，核心資料鏈、主線運作、一致性、驗證與可維護性都已穩定成立。**
