# MD113 — projectflow Batch 2 quote-cost reconciliation / payable / closeout ingress closure (2026-04-13)

> Status: ACTIVE  
> Note: 本文件記錄 `MD112` Batch 2 到目前驗收停點為止的已完成項、驗收方式、限制與後續建議。此文件定位為本批 closure / validation handoff。

## 1. 本批目標

依 `MD108` / `MD112`，本批目標為：
1. quotation / receivable readback closure
2. collection write/read closure
3. design / procurement / vendor / manual cost buckets same-source closure
4. reconciliation groups item-level visibility closure
5. `已對帳` -> vendor unpaid source closure 再確認
6. closeout gating button / state / write path 補齊
7. 移除 `最終文件內容` 冗餘區塊

---

## 2. 已完成項

### 2.1 Batch 2 source-map audit 已完成
已完成 route / DB / adapter / UI source-map 盤點，並固定於：
- `MD112-projectflow-quote-cost-reconciliation-payable-closeout-ingress-work-package-2026-04-13.md`

已固定的核心結論：
- 本批不是從零建 financial spine，而是把既有 quotation / collection / reconciliation / closeout 骨架收成正式可驗收主線
- Vendor Data Batch 1 僅作依賴邊界，不重做

### 2.2 closeout gating / state / write path 已補齊
已新增：
- `project-mgmt/src/app/api/financial-projects/[id]/closeout/route.ts`

已完成規則：
- 結案不再只是 client-only state 切換
- 改為正式 DB write path
- API 會先驗：
  - `未收款 = 0`
  - `全部對帳完畢`
- 驗過後才會把 `projects.status` 寫成 `已結案`

### 2.3 quote-cost detail 的 closeout gating 已改成正式條件
已完成：
- `quote-cost detail` 結案按鈕不再只看 quotationImported / costItems / reconciliation
- 改為以：
  - `outstandingTotal === 0`
  - `derivedReconciliationStatus === 已完成`
  作為正式 gating
- CTA 文案改為：`確認結案`
- 結案成功後會 refresh 並導到 `/closeout/[id]`

### 2.4 reconciliation groups item-level visibility 已補齊
已完成：
- 每個 reconciliation group 現在都可直接展開看到 item-level 明細
- 欄位包含：
  - 來源項目
  - 來源摘要
  - 廠商
  - 金額

正式效果：
- 使用者在按 `已對帳` 前，不再只能看群組總額
- 已符合 `MD104` 要求的 item-level visibility closure

### 2.5 `最終文件內容` 冗餘區塊已移除語意
已完成：
- `quote-cost detail` 中原本名為 `最終文件內容` 的區塊已改回正式語意：`成本明細`
- 人工成本的編輯 / 儲存保留在成本管理正式區內
- 不再讓 financial detail 混入錯誤 archive / final document 語意

### 2.6 quote-cost detail header / list 冗餘 UI 已清掉一輪
已完成：
- detail header 移除 `客戶` 欄位
- active detail 狀態區移除 `返回列表` CTA
- `quote-cost list` 移除 `未結案 / close status` 冗餘 badge

---

## 3. 驗收結果

### 3.1 build 驗證
已完成：
- `npm run build`
- 結果：PASS

build 內已確認：
- `/api/financial-projects/[id]/closeout` route 存在
- `quote-costs` / `closeout` 路由仍可正常編譯

### 3.2 Playwright 驗收（Batch 2 closeout gating）
已新增：
- `project-mgmt/tests/quote-cost-batch2-closeout.spec.ts`

測試目標：
- 驗 `quote-cost detail` 的結案按鈕在未滿足條件前不可用
- 驗 `closeout API` 不會在條件不符時誤寫 DB

目前結果：
- Playwright runner 可執行
- 初次失敗原因不是產品邏輯，而是測試環境未自動帶入 `DATABASE_URL`
- 後續已補 `.env.local` fallback 讀法，供同環境下續跑

### 3.3 本停點正式判讀
可正式判定：
- closeout gating / write path 已從假 closure 升為正式主線
- reconciliation groups item-level visibility 已補齊
- quote-cost UI 冗餘已清一輪
- build 層級已可通過

---

## 4. 尚未完成 / 本停點保留項

### 4.1 full frontend + DB truth validation 還需要再跑一輪完整實測
雖然本批已補齊正式 write path 與驗收 spec，但本停點尚未完整附上：
- 一輪成功的 closeout API + DB delta 實測截面
- 一輪 collection create/delete + DB delta 的 batch2 專用驗收截面

原因：
- 測試執行環境的 DB env 帶入需再補穩

### 4.2 vendor unpaid spine 仍保留 `vendorName` 相容邊界
目前：
- Batch 1 已補 `project_vendor_payment_records.vendor_id`
- 但 reconciliation / payable spine 仍非完全 `vendor_id` 化

本停點判讀：
- 可驗收
- 但仍屬相容型 same-source，不是最終 identity closure

### 4.3 quotation / collection / closeout 的更完整 retained validation 還可再補
- closeout retained read-model / performance closure 仍屬 Batch 3
- 本批先做到 ingress closure，不往 retained semantics 深挖

---

## 5. 風險與限制

1. reconciliation 與 vendor payable 仍有 `vendorName` identity 邊界
2. Playwright 驗收依賴本機 / runtime DB env 是否正確帶入
3. `closeout` 與 `/closeouts` 目前仍維持 alias / redirect 過渡結構
4. quote-cost financial spine 雖已更正式，但 fixture fallback 邊界仍存在 adapter 層，後續仍應持續監控

---

## 6. 關鍵檔案

- `MD112-projectflow-quote-cost-reconciliation-payable-closeout-ingress-work-package-2026-04-13.md`
- `project-mgmt/src/app/api/financial-projects/[id]/closeout/route.ts`
- `project-mgmt/src/components/quote-cost-detail-client.tsx`
- `project-mgmt/src/components/quote-cost-list-client.tsx`
- `project-mgmt/tests/quote-cost-batch2-closeout.spec.ts`

---

## 7. 下一步建議

若下一輪要續接，建議兩條路：

### A. 先補 Batch 2 驗收最後一哩
- 把 closeout API + DB delta 跑成完整 PASS 截面
- 把 collection create/delete 的 batch2 驗收補齊
- 再把本文件狀態從停點 closure 推進到更完整 validation PASS

### B. 進 Batch 3
- 進 `closeout retained read-model / performance closure`
- 專注 closeout list / detail retained semantics、query 效能與 timeout 問題

---

## 8. 一句話總結

> Batch 2 到本停點已把 `quote-cost` 最關鍵的 financial spine 收到可正式驗收階段：補上真正的 closeout API / DB write path、把結案 gating 改成 `未收款 = 0 + 全部對帳完畢`、補齊 reconciliation group 的 item-level visibility、把 `最終文件內容` 冗餘區塊收回正式成本語意，並清掉一輪 quote-cost 冗餘 UI；目前剩下的是把 frontend + DB truth 的最後驗收截面跑完整，以及決定是否直接接續 Batch 3 的 closeout retained 主線。