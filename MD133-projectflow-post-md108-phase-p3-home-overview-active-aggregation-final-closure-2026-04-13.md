# MD133 — projectflow post-MD108 Phase P3 home overview active aggregation final closure (2026-04-13)

> Status: CLOSED / SIGNED-OFF  
> Phase: post-MD108 / Phase P3  
> Role: `MD130` 所定義的 Phase P3 home overview active aggregation 最終 closure 文件。  
> Important: 本文件代表 post-MD108 第三個正式 work package 已完成本輪收口，且明確確認 **不延伸進 Accounting Center / Phase P4**。

---

## 1. 本批正式範圍

依 `MD130`，Phase P3 正式範圍為：

1. home overview DB-backed read-model
2. homepage metric cards closure
3. recent projects closure
4. active collected / outstanding aggregation closure

本批固定邊界：
- 只處理首頁 active overview aggregation
- 不混入 month aggregation
- 不混入 Accounting Center extension

---

## 2. 最終完成結果

### 2.1 P3-W1 — home overview DB-backed read-model
完成情況：
- 已新增 `src/lib/db/home-overview-read-model.ts`
- 首頁 overview 已有正式 DB-backed aggregation source
- read-model 已提供：
  - project count
  - in-progress count
  - pending design count
  - pending procurement count
  - pending vendor count
  - active collected total
  - active outstanding total
  - recent projects

結論：
- **PASS（第一輪 DB-backed read-model 完成）**

---

### 2.2 P3-W2 — homepage metric cards closure
完成情況：
- `src/app/page.tsx` 已不再依賴硬編碼 mock stats
- 首頁主要 metric cards 已切到 overview read-model
- 首頁主 badge / summary 語意已與正式 aggregation source 對齊

結論：
- **PASS（第一輪 metric cards closure 完成）**

---

### 2.3 P3-W3 — recent projects closure
完成情況：
- recent projects 已改吃正式 DB source
- 首頁 recent projects 區塊已不再依賴 local mock project list
- 顯示內容已與正式 project source / active overview source 對齊

已確認 DB truth：
- `Projectflow DB 驗收主線樣本`
- `Projectflow 驗收測試專案`
- `正式測試0710`

結論：
- **PASS（第一輪 recent projects closure 完成）**

---

### 2.4 P3-W4 — active collected / outstanding aggregation closure
完成情況：
- 首頁右側區塊已從 `本月財務摘要` 改為 `Active 收款概況`
- active collected / outstanding aggregation 已接正式 DB source
- 已明確切開首頁 active aggregation 與 month/accounting aggregation 邊界

已確認 DB truth：
- collected = `0`
- outstanding = `602000`

結論：
- **PASS（第一輪 active aggregation closure 完成）**

---

## 3. 本輪工程意義

Phase P3 的完成，代表首頁正式從：
- mock dashboard

推進到：
- DB-backed active overview aggregation

這不是單純改文案或 UI 小修，而是把首頁正式收進 DB-first 主線，讓 overview page 不再與正式資料流脫鉤。

---

## 4. 邊界驗證

本輪已明確做到：
- 沒有混入本月金額 aggregation
- 沒有混入 month-close/reporting extension
- 沒有混入 Accounting Center active-projects deeper extension
- 沒有把 P3 擴張成 P4

管理結論：
- **P3 scope control PASS**

---

## 5. 本輪實際交付物

文件：
- `MD130-projectflow-post-md108-phase-p3-home-overview-active-aggregation-closure-work-package-2026-04-13.md`
- `MD131-projectflow-post-md108-phase-p3-home-overview-active-aggregation-progress-2026-04-13.md`
- `MD132-projectflow-post-md108-phase-p3-home-overview-active-aggregation-status-2026-04-13.md`
- `MD133-projectflow-post-md108-phase-p3-home-overview-active-aggregation-final-closure-2026-04-13.md`

本輪對應程式主線（依前序文件狀態收斂）：
- `src/lib/db/home-overview-read-model.ts`
- `src/app/page.tsx`

---

## 6. 最終管理結論

### Phase P3 是否完成？
是。

### 是否可正式收口？
可以。

### 最準確的完成描述是什麼？
- **Phase P3 final closure complete**
- 若保守表述，也可寫成：
  - **Phase P3 first implementation round signed off**

### 是否應該立刻往下做 P4？
目前**不應自動前推**。

原因：
- 使用者已明確要求：**帳務中心先不要碰**
- 因此 P3 收口後，主線應先停在 P3 completed / P4 deferred

---

## 7. 下一步建議

本輪之後建議狀態應標記為：
- `post-MD108 / Phase P3 = CLOSED`
- `Phase P4 / Accounting Center extension = DEFERRED`

若未來 reopen，建議 reopen 條件必須清楚屬於以下其一：
1. 使用者明確批准進入 `Accounting Center / Phase P4`
2. 首頁 active overview 需要新增已定義的新正式欄位
3. 實際驗收發現首頁 aggregation 與 DB truth 再次脫鉤

---

## 8. 一句話總結

> `MD133` 代表 post-MD108 / Phase P3 已正式完成收口：首頁已從 mock dashboard 推進為 DB-backed active overview aggregation，project count、pending design/procurement/vendor、recent projects、以及 active collected / outstanding 都已接上正式 source，且本輪嚴格未混入 month aggregation 或 Accounting Center extension；因此目前正確狀態應為 **P3 closed, P4 deferred**。
