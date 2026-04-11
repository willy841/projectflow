# MD60 — projectflow midstream plan / confirm live DB validation handoff (2026-04-11)

## 1. 這份文件的目的

本文件承接 `MD59` 之後的下一段正式進度。

`MD59` 已確認：
- 上游 dispatch -> 中游 detail / document 的 DB-first 主鏈路已通
- design / procurement 在 live Supabase DB runtime 下都已跑到 detail / document

本檔再往下推進一層，正式記錄：

> **design / procurement 的中游 `plan -> confirm -> snapshot(DB)` 也已在 live DB runtime 下實際驗證通過。**

重點不是只看 code，也不是只看畫面，而是：
- 有前端完整流程驗證
- 有 DB 真值驗證
- 有 confirmation 與 snapshot 寫入驗證

---

## 2. 本輪正式驗收標準（使用者已明確要求）

本輪中游工作必須遵守以下完成定義：

> **任何中游完成項，不可只停在實作層。必須同時通過：**
> 1. **前端完整流程驗收**
> 2. **資料庫真實承接驗證**

也就是說：
- 不可只因為畫面看起來成功就算完成
- 不可只因為 API 有回應就算完成
- 必須真的到前端操作
- 並查 DB 真值

---

## 3. 本輪驗證範圍

### 3.1 design 中游
- design detail
- design plans
- design confirm
- design confirmation snapshot
- design document 承接訊號

### 3.2 procurement 中游
- procurement detail
- procurement plans
- procurement confirm
- procurement confirmation snapshot
- procurement document 承接訊號

---

## 4. design 中游 live 驗證結果

### 4.1 驗證操作（前端）
使用既有 DB 樣本任務：
- design task id：`65697caf-1bc8-4646-9fe4-0cc4e5621699`

實際做了：
1. 進 design detail 頁
2. 清空既有 design plan / confirmation / snapshot
3. 前端新增一筆 plan
4. 點 `儲存`
5. 點 `全部確認`
6. 驗證頁面出現正式承接訊號：
   - `已完成全部確認，正在前往最終文件頁。`
   - `文件頁將承接這次正式確認結果。`

### 4.2 本輪實填 plan 值
- title：`DB 設計方案 A`
- size：`W180 x H240`
- material：`PVC + 木作背架`
- structure：`沿用 merged field`
- quantity：`1`
- amount：`NT$ 18000`
- previewUrl：`https://example.com/design-plan-a`
- vendor：`DB Vendor A`

### 4.3 DB 真值驗證結果
已確認 DB 正式承接到：

#### A. `design_task_plans`
有新增一筆正式 plan，欄位包含：
- `title`
- `size`
- `material`
- `structure`
- `quantity`
- `amount`
- `preview_url`
- `vendor_name_text`

#### B. `task_confirmations`
有新增一筆：
- `flow_type = design`
- `confirmation_no = 1`
- `status = confirmed`

#### C. `task_confirmation_plan_snapshots`
有新增對應 snapshot，payload 已正確帶入：
- `title`
- `size`
- `material`
- `structure`
- `quantity`
- `amount`
- `preview_url`
- `vendor_name_text`

### 4.4 design 中游正式判定
- detail：PASS
- plan save：PASS
- confirm：PASS
- snapshot write：PASS
- DB 真值承接：PASS

也就是：

> **design 中游 `detail -> plan -> confirm -> snapshot(DB)` 已 live 驗證通過。**

---

## 5. procurement 中游 live 驗證結果

### 5.1 驗證操作（前端）
使用既有 DB 樣本任務：
- procurement task id：`a2bbb2c4-23b7-4331-a327-25976c072480`

實際做了：
1. 進 procurement detail 頁
2. 清空既有 procurement plan / confirmation / snapshot
3. 前端新增一筆 plan
4. 點 `儲存`
5. 點 `全部確認`
6. 驗證頁面出現正式承接訊號：
   - `已完成全部確認，正在前往最終文件頁。`
   - `文件頁將承接這次正式確認結果。`

### 5.2 本輪實填 plan 值
- title：`DB 備品方案 A`
- quantity：`3`
- amount：`NT$ 12500`
- previewUrl：`https://example.com/procurement-plan-a`
- vendor：`DB Vendor B`

### 5.3 DB 真值驗證結果
已確認 DB 正式承接到：

#### A. `procurement_task_plans`
有新增一筆正式 plan，欄位包含：
- `title`
- `quantity`
- `amount`
- `preview_url`
- `vendor_name_text`

#### B. `task_confirmations`
有新增一筆：
- `flow_type = procurement`
- `confirmation_no = 1`
- `status = confirmed`

#### C. `task_confirmation_plan_snapshots`
有新增對應 snapshot，payload 已正確帶入：
- `title`
- `quantity`
- `amount`
- `preview_url`
- `vendor_name_text`

### 5.4 procurement 中游正式判定
- detail：PASS
- plan save：PASS
- confirm：PASS
- snapshot write：PASS
- DB 真值承接：PASS

也就是：

> **procurement 中游 `detail -> plan -> confirm -> snapshot(DB)` 已 live 驗證通過。**

---

## 6. 本輪主線狀態更新

結合 `MD59` + 本檔 `MD60`，目前可以正式描述為：

### A. 上游
- `Project Detail`
- `execution items`
- `dispatch`

已在 DB-first 模式下收通。

### B. 中游前半段
- design / procurement detail
- design / procurement document

已在 live DB runtime 下收通。

### C. 中游 deeper layer（本輪新增）
- design plan / confirm / snapshot
- procurement plan / confirm / snapshot

也已在 live DB runtime 下收通。

---

## 7. 目前正式可下的判斷

到目前為止，`projectflow` 的上游 + 中游已經不只是「部分接 DB」，而是：

> **上游 dispatch + 中游 detail / plan / confirm / document 這整段主線，都已在 live Supabase DB runtime 下被前端完整流程與 DB 真值雙重驗證通過。**

這是本輪最重要的管理層結論。

---

## 8. 目前剩下的內容是什麼

現在剩下的已不是「中游有沒有接好 DB」，而是：

### A. 細修型工作
- design plans 區塊內部欄位語意 / 表頭一致性
- 某些 merged field 呈現細修
- document / detail 文案一致性

### B. 下一階段主線候選
- 下游穩定模組正式 DB 化
  - Closeout list / detail
  - Vendor Data 穩定主檔 / detail
- 或更高聚合層的 source-of-truth 設計（例如 Accounting Center），但不建議直接整包硬上

---

## 9. 下一個 session 若要續接，應直接做什麼

### 不要再做
- 不要再重跑已驗通的 design / procurement 中游 plan-confirm 主線
- 不要再回頭用單一欄位局部互動當驗收切點
- 不要只看前端成功訊號就算完成

### 若要繼續
- 可以直接把「上游 + 中游主線已通」視為成立前提
- 下一步主線可直接轉向：
  1. 下游穩定模組 DB 化
  2. 或文件 / 細修 / 驗收結論整理

---

## 10. 一句話總結

> **`projectflow` 的上游 dispatch 與中游 design / procurement 的 detail / plan / confirm / document / snapshot，現在都已在 live DB runtime 下完成「前端完整流程 + DB 真值」雙驗證。中游主線可視為正式收通。**
