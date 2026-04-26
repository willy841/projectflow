# MD163 — projectflow current maturity and next-step management summary — 2026-04-26

> Status: ACTIVE / MANAGEMENT SUMMARY
> Role: 將 `projectflow` 目前階段的產品驗收、資料治理、技術穩定性尾巴與正式站前風險，整理成一份管理視角總整版。
> Source backbone:
> - MD158 — 驗收規則與新版驗收腳本整併
> - MD159 — financial data governance / contract / invariants / guardrails 草案
> - MD160 — financial data governance P1 completion summary
> - MD161 — technical stability tail audit and next actions
> - MD162 — pre-production migration technical risk list v1

---

## 1. 這份文件回答什麼問題

這份文件不是用來看單一 bug，
而是用來回答以下管理問題：

1. `projectflow` 現在整體成熟度到哪裡？
2. 哪些項目已經可視為高完成度？
3. 哪些項目仍是中高完成度，但還沒 fully done？
4. 如果現在不搬正式站，接下來最合理的主線是什麼？
5. 如果未來要搬正式站，目前還差哪幾類技術收尾？

---

## 2. 目前整體成熟度判定

### 2.1 產品驗收層
根據 MD158 與本輪實測：
- 正式主線驗收：**通過**
- `tests/formal-acceptance-v2`：**28 / 28 PASS**
- batch4 ~ batch12 deeper crossover：**PASS**

可下的結論是：
> **在目前已拍板規則下，產品主線與重要邊界 crossover，已達高成熟度。**

---

### 2.2 資料治理層
根據 MD159 / MD160：
- financial / closeout / payment / reconciliation contract 已開始正式化
- invariants 已整理
- guardrails 已開始落地
- P1 改動已完整回測綠燈

可下的結論是：
> **資料治理已從中高完成度推進到高完成度前段。**

仍未 fully done，但已不再只是口頭規則，而是開始進入正式結構。

---

### 2.3 技術穩定性層
根據 MD161：
- acceptance/runtime 路徑已比本輪開始前穩定
- financial error taxonomy 已有初步文件
- closeout retained read 已完成更純的 snapshot-only code-level validation
- 仍有 env/runtime 尾巴待清

可下的結論是：
> **技術穩定性已從鬆散尾巴收斂成少數可管理項，且其中最大一條 closeout retained read 技術主線已取得實作驗證。**

---

### 2.4 正式站前準備層
根據 MD162：
- 目前沒有新的產品 blocker
- 也沒有新的 data blocker
- 若正式站確定不帶舊資料，則 legacy / backfill 類風險已大幅下降
- 剩餘主要是正式站前技術紀律與操作姿勢收尾

可下的結論是：
> **現在距離正式站前準備完成又更近一步；剩餘問題更偏向操作姿勢與環境紀律，而非歷史資料包袱。**

---

## 3. 四條主軸整合判定

### A. 驗收與規則收斂
- 狀態：**高完成度 / 可視為已收斂**
- 來源：MD158
- 判定：主線與 deeper crossover 均已通過

### B. 正式資料治理
- 狀態：**高完成度前段**
- 來源：MD159 + MD160
- 判定：已有 contract / invariants / guardrails / route eligibility 正式化成果

### C. 技術穩定性尾巴
- 狀態：**高完成度前段**
- 來源：MD161
- 判定：問題已收斂，closeout retained read 主策略題已取得實作驗證；剩餘重點轉為 runtime/env 與正式站前 posture 決策

### D. 正式站搬移前準備
- 狀態：**尚未完成，但風險已可管理**
- 來源：MD162
- 判定：目前適合先整理技術尾巴與風險，而非立刻搬正式站

---

## 4. 已完成的重要成果（管理者視角）

### 4.1 已完成的驗收成果
- 新版 formal acceptance v2 已建立
- 主線正式驗收通過
- batch4 ~ batch12 deeper crossover 通過
- 已新增 fresh-project 重驗：
  - 新案建立與 project detail 入口
  - 新案 upstream dispatch → 三條線 → 文件層 → closeout 主線
  - 新案 overwrite / delete / re-dispatch / reopen / re-closeout 變異操作
  - 新案 dispatch edit → downstream task / 同頁任務卡片同步

### 4.2 已完成的資料治理成果
- reconciliation 三態 migration 正式化
- reopen retention contract 文件化
- payment semantic matrix / dependency map 文件化
- vendor open/history 分流從字串依賴拆出
- financial error taxonomy 文件化
- collections delete idempotent semantics 正式化
- reopen illegal transition guardrail 正式化

### 4.3 已完成的技術收斂成果
- acceptance runtime 不再 reuseExistingServer
- acceptance 改走 `start-acceptance.sh`
- local acceptance / production-local start path 已顯式清掉繼承而來的 `NODE_ENV` 汙染
- acceptance env / production-local env / deploy path 責任邊界已正式文件化
- retained snapshot fallback strategy 已文件化
- Phase 1 技術改動風險分級表與 pre-production 決策備忘錄已補齊
- closeout retained read 已完成更純的 snapshot-only code-level validation，且 formal acceptance v2 維持綠燈
- closeout list / detail 的主要 live fallback 已完成收斂
- fresh-project validation coverage matrix 已補齊，明確區分 fresh-project 重驗範圍與既有 suite 覆蓋範圍
- 舊 acceptance 噪音與誤判已被收斂

---

## 5. 目前尚未完成，但已可控的項目

### 5.1 `部分付款` compatibility semantic cleanup
- 目前不是 blocker
- 但也尚未完全從 codebase 消失
- 已判定不應在本輪為了最完美而冒風險硬拔

### 5.2 Closeout snapshot fallback 策略最終拍板
- snapshot 已是主路徑
- closeout retained read 已完成更純的 snapshot-only 收斂驗證
- list path 的 live fallback 已移除
- detail path 的 missing-snapshot live summary rebuild 已移除
- detail path 的 empty-array compatibility fill 也已移除
- 對應策略文件與 pre-production decision memo 已補齊
- 若正式站採 clean-start，不帶舊資料，則這條主策略題剩下的已不再是 legacy 相容性，而是：新官方資料若缺 retained snapshot，應直接視為 bug-class / 治理失敗狀態

### 5.3 Runtime / env 標準化
- `.env.acceptance -> .env.local` 仍不是最乾淨的 acceptance env 管理方式
- `NODE_ENV` 主污染源已定位並收掉，但 bridge-based local runtime 仍不是最終理想形態

### 5.4 Acceptance / deploy separation 制度化
- acceptance / production-local / deploy path 的責任邊界已文件化
- 剩餘未完成項主要是：是否還要再往下移除 `*.env -> .env.local` bridge

---

## 6. 現在為什麼可以停在這裡

目前之所以可以把這個階段視為穩定停點，原因是：

1. **產品驗收已高成熟度通過**
2. **資料治理的高風險核心項已先收斂**
3. **主線 blocker 不再依賴模糊語意**
4. **每次 code 改動後都已完整回測綠燈**
5. **剩餘問題多屬 compatibility / runtime / deployment readiness，而不是當前產品功能缺陷**

也就是：
> **現在的未完成，不再是系統是否可用的問題，而是是否要把它推到更正式、更可搬站、更可交接的下一階段。**

---

## 7. 接下來最合理的主線

### 不建議
- 不建議現在為了追求語意最完美，硬清 compatibility semantic
- 不建議現在就進正式站搬移
- 不建議再回頭碰 UI

### 建議
下一步主線應是：

#### Phase 1 — 技術穩定性尾巴收尾
1. 收 acceptance env / `.env.local` 責任邊界
2. 整理 acceptance / deploy separation 規範
3. 維持目前低風險技術改動只做 hygiene / 文件 / decision memo，不混入產品邏輯
4. 視需要再評估是否移除 `*.env -> .env.local` bridge

#### Phase 2 — 策略決策
5. 依 pre-production decision memo，決定 closeout retained snapshot fallback 是否長期保留，或在正式站前收斂成 snapshot-only

#### Phase 3 — 再評估是否進正式站搬移
6. 當 Phase 1 + 2 收斂後，再進正式站前最後整理

---

## 8. 一句話總結

> `projectflow` 目前已達到：產品驗收高成熟度、資料治理高完成度前段、技術穩定性尾巴已收斂成可管理清單；現在最合理的下一步，不是再碰 UI 或硬追最完美語意清理，而是先完成 runtime/env 與正式站前技術收尾。