# MD59 — projectflow live DB runtime validation & field-alignment handoff (2026-04-11)

## 1. 這份文件的目的

本文件承接 `MD57` / `MD58` 之後的**實際 live DB runtime 驗收結果**。

重點不是再描述「理論上應該可以」，而是記錄：

- 已在 Supabase DB runtime 下實際跑過哪些前端路線
- 哪些段落已實際 PASS
- 哪些問題已定位並修掉
- 哪些剩餘問題已降級為非阻塞性欄位細修

---

## 2. 本輪最重要的結論

> **`projectflow` 上游 dispatch → 中游 detail / document 的 DB-first 主鏈路，design 與 procurement 都已在 live DB runtime 下實際跑通。**

也就是說，這輪已不只是 staged validation 的理論狀態，而是：

- 有真 DB env
- 有真 Supabase runtime
- 有真 project / execution item sample
- 有真前端操作
- 有真 detail / document 導流

---

## 3. 本輪 runtime / DB 驗證環境

### 3.1 DB 來源
- Supabase Postgres
- project ref：`vkjabxekxnnczpulumod`

### 3.2 連線路徑
本輪確認：在當前 OpenClaw runtime 中，**應優先使用 Supabase Transaction Pooler**。

可用格式：

```text
postgresql://postgres.vkjabxekxnnczpulumod:<PASSWORD>@aws-1-ap-northeast-1.pooler.supabase.com:6543/postgres
```

### 3.3 為何不用 direct host
先前 direct host：

```text
db.vkjabxekxnnczpulumod.supabase.co
```

在此 runtime 中解析失敗（DNS / host resolution 不通），但 pooler 可用。

結論：
- 之後若在這個 runtime 做 `projectflow` DB 驗證，**先走 Transaction Pooler**。

---

## 4. 本輪為驗收建立的 DB 樣本

為避免再被歷史 mock route 或既有半殘測試資料干擾，本輪建立了一筆乾淨樣本：

### 驗收樣本 project
- 專案名：`Projectflow DB 驗收主線樣本`
- route slug：`projectflow-db`
- project id：`0751fbc3-88d9-4fa1-a7e3-399b15a64f41`

### root execution item
- execution item id：`36cd43e1-e6ea-4988-8aee-1017aac8f466`
- title：`DB 驗收主背板`

這筆樣本一開始是：
- `尚未建立交辦`
- 適合從上游 dispatch drawer 開始實測完整 DB-first 路線

---

## 5. design 線 live runtime 驗收結果

### 5.1 已實跑通的路線
已用前端實際操作跑通：

1. `project detail` 開 design dispatch drawer
2. 完整填寫設計交辦表單
3. 成功 submit
4. drawer 關閉
5. 顯示 `已建立，摘要已更新。`
6. summary 更新
7. reload 後 summary 保留
8. summary CTA 導流到 design detail
9. design detail 頁可開
10. design document 頁可開

### 5.2 design 正式判定
- dispatch completion state：PASS
- DB write：PASS
- reload persistence：PASS
- detail routing：PASS
- document routing：PASS

也就是：

> **design 主鏈路 `dispatch -> reload -> detail -> document` 已實際 PASS。**

---

## 6. procurement 線 live runtime 驗收結果

### 6.1 已實跑通的路線
已用前端實際操作跑通：

1. `project detail` 開 procurement dispatch drawer
2. 完整填寫備品交辦表單
3. 成功 submit
4. 顯示 `已建立，摘要已更新。`
5. summary 更新
6. reload 後資料仍在
7. summary CTA 導流到 procurement detail
8. procurement detail 頁可開
9. procurement document 頁可開

### 6.2 procurement 正式判定
- dispatch completion state：PASS
- DB write：PASS
- reload persistence：PASS
- detail routing：PASS
- document routing：PASS

也就是：

> **procurement 主鏈路 `dispatch -> reload -> detail -> document` 已實際 PASS。**

---

## 7. 本輪已定位並修掉的重要問題

### 7.1 `boardPath` 不穩 / summary CTA 退回 board

#### 症狀
- submit 後 summary 有時是 `前往設計任務詳情`
- reload / 再同步後又回退成 `前往設計任務板`

#### 根因
不是 API 沒回 `boardPath`，而是前端狀態結構有**雙資料源問題**：

- `ExecutionTree` saved assignments 只存 draft data
- `ExecutionTreeSection` 另外 patch `boardPath`
- 後續同步時，沒有 `boardPath` 的 saved assignments 又把 patch 過的狀態洗掉

#### 修法
在 `src/components/execution-tree.tsx`：

- `savedDesignAssignments`
- `savedProcurementAssignments`
- `savedVendorAssignments`

由原本只存 draft，改成存：

```ts
{ data, boardPath }
```

並且：
- outbound assignment sync 一併帶 `boardPath`
- summary 不再依賴 section 層臨時 patch

#### 修後結果
- reload 後 CTA 不再回退成 board
- `前往設計任務詳情` / `前往備品任務詳情` 可穩定保留

---

### 7.2 procurement 的 `budget_note / requirement_text` 混寫

#### 原症狀
procurement detail 顯示：
- `預算` 與 `需求說明` 出現同一份文字

#### 根因
上游 dispatch payload 把同一份 `draft.note` 同時送進：
- `budgetNote`
- `note`

route 再分別寫入：
- `budget_note`
- `requirement_text`

因此 DB 真值本來就重複。

#### 修法
在 `src/components/execution-tree-section.tsx`：

把 procurement dispatch payload 從：

```ts
budgetNote: draft.note,
note: draft.note,
```

改成：

```ts
budgetNote: "",
note: draft.note,
```

#### 修後結果
重新送單後，DB 真值變成：
- `budget_note = null`
- `requirement_text = 實際需求說明`

detail 頁回正為：
- `預算 = 未填寫`
- `需求說明 = 真正的需求內容`

---

## 8. design 欄位語意的正式決策

### 8.1 問題本質
design 上游 dispatch drawer 目前只有：
- `材質 + 結構`（單欄 merged field）

但 downstream schema / detail 舊語意是：
- `material`
- `structure`

這不是單純 bug，而是**欄位語意設計**問題。

### 8.2 使用者已拍板決策
本輪正式選擇：

> **方案 A：維持 design 上游單欄 merged field，不在這輪拆 UI 成兩欄。**

也就是：
- 不重開 UI 骨架
- 不做新一輪雙欄 spec
- downstream 顯示與承接改為與 merged field 一致

### 8.3 本輪已做的對齊
- design adapter / document row 組裝已開始往 merged field 語意靠攏
- design detail 頁顯示已改成單欄：`材質 + 結構`
- document 頁本來即為單欄：`材質與結構`

### 8.4 這件事的正式定位
這代表：

> **design 主鏈路已通，欄位語意也已以 A 方案正式收斂，不再把本輪硬推向拆欄 UI 重構。**

---

## 9. 目前已完成 vs 尚未完成

### 9.1 已完成（可視為本輪正式 PASS）

#### 主鏈路
- design：`dispatch -> reload -> detail -> document` PASS
- procurement：`dispatch -> reload -> detail -> document` PASS

#### 問題修正
- `boardPath` 單一資料源化完成
- summary CTA reload 穩定化完成
- procurement `budget_note / requirement_text` 混寫修正完成
- design merged field A 方案已收斂完成

### 9.2 尚未完成（但已降級為非阻塞）
- design plans 區塊內部表頭 / 舊語意仍可能殘留 `材質 / 結構` 字眼
- 這屬於更細的呈現一致性清理，不是 DB-first 主鏈路阻塞點

---

## 10. 本輪最終正式結論

> **`projectflow` 上游 dispatch 到中游 detail / document 的 DB-first 主鏈路，design 與 procurement 都已在 live DB runtime 下實際跑通。**

並且：
- 不是只在 mock / local 假資料下成立
- 而是在 Supabase live DB mode 下完成
- `boardPath` / reload / detail / document 的關鍵承接問題已收掉

因此，本輪主線可以正式視為：

> **DB-first 主鏈路 PASS。**

剩餘內容僅為：
- 非阻塞性的欄位語意與 UI 細修
- 不影響本輪主線簽核

---

## 11. 下一個 session 若要續接，應直接做什麼

### 不要再做
- 不要再重跑已通過的 design / procurement DB-first 主鏈路
- 不要再回頭糾結 `department-store-display-2026`
- 不要再把驗收切回單一欄位局部互動

### 若要繼續
只做下面兩類：

1. 細修型工作
- design plans 區塊 / document 表頭 / 文案一致性
- procurement 若未來要補正式預算欄，再另開 spec

2. 文件整理
- 把本輪實際 live DB runtime 驗證結果回寫進母檔 / index / cleanup map
- 或整理成下一輪 handoff / 驗收總結

---

## 12. 一句話總結

> **這輪已不只是 staged validation，而是用 live Supabase DB runtime 實際把 design 與 procurement 的 `dispatch -> reload -> detail -> document` 主鏈路跑通，並把 `boardPath` 與 procurement mapping 等阻塞點修掉；剩餘僅為非阻塞性欄位細修。**
