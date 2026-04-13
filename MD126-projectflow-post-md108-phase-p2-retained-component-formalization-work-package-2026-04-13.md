# MD126 — projectflow post-MD108 Phase P2 retained / component formalization work package (2026-04-13)

> Status: ACTIVE  
> Phase: post-MD108 / Phase P2  
> Role: 本文件作為 `MD120` 中 **Phase P2 — Retained / component formalization** 的正式施工單。  
> Important: 本文件承接 `MD125`（Phase P1 已完成），正式進入 retained / component formalization，不可回頭混成 P1 補尾或 MD108 舊批次。

---

## 1. 本文件定位

依 `MD120`：
- `Phase P1 — Validation hardening matrix` 已完成
- 下一步正式主線為：
  > **Phase P2 — Retained / component formalization**

本文件目的：
1. 先做 source-map audit
2. 明確盤點 retained / component formalization 現況
3. 定義本批正式 scope、驗收標準與非本批範圍
4. 作為 Phase P2 的第一張正式施工單

---

## 2. 本批正式目標

依 `MD120`，Phase P2 核心目標為：

1. closeout detail retained-only component 化
2. vendor document-layer 欄位語意再正式化
3. 保留 latest confirmation snapshot 優先規則
4. 降低 active / retained 共用骨架耦合

---

## 3. Source-map audit

### 3.1 closeout retained detail 現況

#### Route / component 結構
目前：
- `/closeout/[id]` -> `src/app/closeout/[id]/page.tsx`
- page 只負責拿 `getCloseoutArchiveDetailReadModel(id)`
- 再交給 `CloseoutDetailClient`

#### retained client 現況
目前：
- `src/components/closeout-detail-client.tsx`
- 本質上只是把：
  - `archiveProject`
  - `archiveCollections`
  - `archiveVendorPayments`
  包進 `QuoteCostDetailClient`
- 再透過 `getCloseoutRetainedPresenter()` 切 `mode="closed"`

#### 現況判斷
也就是說，目前 retained detail 並沒有真正 retained-only component；
它仍是：
> **active detail client + presenter mode switch + retained initialProject injection**

這符合 P2 要處理的第一個主題：
- retained-only component 化尚未完成
- active / retained 共用骨架耦合仍高

---

### 3.2 QuoteCostDetailClient active / retained 共用骨架現況

#### 目前結構
- `QuoteCostDetailClient` 同時承擔 active / closed 兩種 mode
- 以 `presenter.archived` / `isClosedView` 決定：
  - 哪些 action 顯示
  - 哪些 section 顯示
  - 哪些按鈕禁用
  - 哪些顯示文案切換

#### 已暴露出的問題
本輪 P1 已實際碰到：
- retained data 有傳入，但 collection table 因 render 邏輯被 active-only block 擋住
- 需要直接修改 active/closed 共用 JSX block 才讓 retained view 正常顯示

#### 現況判斷
這表示：
- presenter mode switch 雖然能 work
- 但 retained 仍依賴 active 骨架的條件 render 邏輯
- 長期維護風險高，未來很容易再出現 retained-only 缺塊

這正是 P2 要正式解的第二層問題：
- **降低 active / retained 共用骨架耦合**

---

### 3.3 vendor document-layer 欄位語意現況

#### package source 現況
- `src/lib/db/vendor-package-adapter.ts`
- package items 來自 latest vendor confirmation snapshots
- 目前 snapshot payload 讀法：
  - `title` -> `itemName`
  - `requirement_text` -> `requirementText`

#### 現況特徵
- latest confirmation snapshot 優先規則已成立，且 P1 已驗證通過
- 但 vendor package / document-layer 仍是直接從 payload_json 抽欄位
- 欄位語意目前仍偏 adapter inline mapping，而非更正式的 view-model / retained contract

#### 現況判斷
這表示：
- vendor document-layer 現在功能上成立
- 但欄位語意與 adapter 邊界仍偏過渡態

這正是 P2 要處理的第三個主題：
- **vendor document-layer 欄位語意正式化**

---

### 3.4 latest confirmation snapshot 優先規則現況

#### 現況
P1 已完成驗收的主線包括：
- design overwrite validation
- procurement overwrite validation
- vendor package / document-layer validation

都已證明：
- latest confirmation snapshot 應優先於 live plan
- overwrite 後 readback 要以最新 confirmation 為準
- 舊 snapshot 保留，但 UI / document / retained 要承接最新版本

#### 現況判斷
規則已經成立，但目前仍分散在：
- `design-flow-adapter.ts`
- `procurement-flow-adapter.ts`
- `vendor-flow-adapter.ts`
- `vendor-package-adapter.ts`
- financial / closeout downstream read-model

也就是說：
- 規則已存在
- 但尚未被提升成更正式、可複用、可辨識的 retained/document contract

這也是 P2 要正式做的事情：
- **把 latest confirmation snapshot 優先規則固定下來，而不是散在各 adapter 的臨時 mapping**

---

## 4. Phase P2 正式工作包

### P2-W1 — closeout retained-only component formalization
目標：
- 將 closeout retained detail 從純 presenter mode switch，提升為更正式的 retained-only component 結構

預期內容：
- 拆出 closeout retained 專用 section 組合或 retained wrapper
- 降低 retained view 對 active action block 的條件式依賴
- 讓 retained detail 的 collection / vendor payment / summary 呈現更明確受控

---

### P2-W2 — active / retained quote-cost skeleton decoupling
目標：
- 降低 `QuoteCostDetailClient` 同時承載 active / retained 全部條件 render 的耦合度

預期內容：
- 把 active-only sections / retained-only sections 抽清楚
- 把 presenter 用於文案與 capability 開關，而不是扛所有畫面結構差異
- 避免未來再發生 retained data 傳入但 UI 被 active-only 條件擋掉

---

### P2-W3 — vendor document-layer field semantics formalization
目標：
- 正式化 vendor package / document-layer 目前直接從 snapshot payload_json 抽欄位的語意

預期內容：
- 建立更清楚的 adapter / presenter / view-model mapping
- 固化 `title -> itemName`、`requirement_text -> requirementText` 等 contract
- 避免未來欄位命名漂移造成 package/document-layer 行為不穩

---

### P2-W4 — latest confirmation snapshot priority contract formalization
目標：
- 把 latest confirmation snapshot 優先規則從「各處各自實作」提升為更明確可依賴的正式規則

預期內容：
- 收斂 design / procurement / vendor / retained downstream 的共通心智
- 明確定義：
  - latest confirmation 優先於 live plans
  - overwrite 後 readback 只承接 latest confirmation
  - 舊 snapshot 保留但不作 current readback source

---

## 5. 驗收標準

本批固定驗收標準：

1. 不破壞 P1 已通過的驗收主線
   - design overwrite
   - procurement overwrite
   - vendor package/document-layer
   - quote-cost active -> closeout retained

2. retained / active component 邊界更清楚
   - retained mode 不再依賴脆弱的 active-only conditional block 才能顯示正確內容

3. vendor document-layer 欄位語意更正式
   - 至少有明確 adapter/view-model contract，而不是散在 payload_json inline mapping

4. latest confirmation snapshot 優先規則更明確
   - 至少在文件、adapter 或 component 結構上可被辨識與驗證

5. build / 既有 Phase P1 測試不可退化

---

## 6. 明確不做

本批不做：
- Home overview active aggregation closure（Phase P3）
- Accounting Center extension（Phase P4）
- 回頭重寫或重命名 `MD121` / P1 文件成未完成
- 無必要的大範圍 UI 重設計

尤其：
- **不要把 Accounting Center extension 混進 Phase P2**

---

## 7. 推進順序建議

建議順序：
1. P2-W1 closeout retained-only component formalization
2. P2-W2 active / retained skeleton decoupling
3. P2-W3 vendor document-layer semantics formalization
4. P2-W4 latest confirmation snapshot priority contract formalization
5. 補 closure / handoff MD

原因：
- 先解決本輪剛暴露最明顯的 retained/component 耦合問題
- 再把 vendor document-layer 與 snapshot contract 收正式

---

## 8. 一句話總結

> `MD126` 是 post-MD108 / Phase P2 的第一張正式施工單：在 P1 驗收完成後，不再補 validation，而是正式處理 retained / component formalization，目標是把 closeout retained detail 從 presenter mode switch 提升成更穩的 retained-only 結構，降低 active / retained 共用骨架耦合，並把 vendor document-layer 與 latest confirmation snapshot 優先規則收成更正式的工程 contract。