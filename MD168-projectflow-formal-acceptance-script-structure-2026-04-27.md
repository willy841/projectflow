# MD168 — projectflow formal acceptance script structure — 2026-04-27

Status: ACTIVE
Purpose: 把 `projectflow` 正式驗收的 script 分層固定下來，避免之後再手動串一長串，或搞不清楚哪個是主線、哪個是完整重跑。

---

## 1. script 分層

### A. 主線正式驗收
- script: `npm run test:formal-acceptance:v2`
- 用途：
  - 驗目前正式主線 blocker
  - 適合快速確認主線功能是否仍然綠燈
- 內容重點：
  - lifecycle
  - project detail / family routing
  - design / procurement / vendor formal mainline
  - quote-cost mainline
  - closeout retained readback
  - vendor unpaid / history / reversal
  - closeout list / manual cost freeze
  - cross-flow smoke
  - **cross-page consistency packs A~H（2026-05-05 起已正式納入）**
    - Pack A：project owner cross-page consistency
    - Pack B：design assignee consistency
    - Pack C：project list budget/cost source-of-truth
    - Pack D：reconciliation group integrity
    - Pack E：vendor unpaid lifecycle
    - Pack F：dispatch family routing downstream readback
    - Pack G：collections downstream summary
    - Pack H：closeout active/archive consistency

### B. 完整正式驗收
- script: `npm run test:formal-acceptance:full`
- 用途：
  - 驗從新建專案到結案資料的整套正式驗收
  - 適合這種「從頭到尾再測一次」的要求
- 除了主線 `v2` 外，還包含：
  - boundary batch3 ~ batch12
  - fresh-project 19 ~ 24
  - requirements CRUD
  - upstream requirements API persistence
  - execution item import overwrite
  - execution item upload UI
  - **A~H cross-page consistency packs 25~32（2026-05-05 起已正式納入）**

補充規則（2026-04-27）：
- fresh-project 19~24 不再只代表「一條 happy-path 跑通」
- 其中 24 明確承接 branch-complete / downstream readback / sub-item click-path acceptance
- 因此之後若要回答「fresh-project from scratch 有沒有驗完整」
  - 不可只看 20
  - 至少要連 24 一起納入判讀

### C. 舊補充 script
- script: `npm run test:formal-acceptance:legacy`
- 定位：
  - 保留舊補充入口
  - 但不再代表完整正式驗收

---

## 2. 使用規則

### 要判目前主線 blocker 是否綠燈
先跑：
- `npm run test:formal-acceptance:v2`

### 要判整套從新建專案到結案資料是否完整綠燈
先跑：
- `npm run test:formal-acceptance:full`

### 不可再做的事
- 不可把 `tests/legacy/stale-vendor-ui-contract/` 當正式 blocker
- 不可再手動臨時拿舊 vendor detail tests 代替正式主線

---

## 3. 2026-05-05 最新補充

- `tests/formal-acceptance-v2/25~32` 已正式落地並進入 acceptance 入口。
- 這批不是額外補充腳本，而是目前正式驗收體系中負責鎖住：
  - source-of-truth
  - cross-page consistency
  - status transition completeness
  - downstream lifecycle readback
  的第一輪正式 regression packs。

## 4. 一句話總結

> `test:formal-acceptance:v2` = 正式主線 blocker（現在已包含 A~H cross-page consistency packs）；`test:formal-acceptance:full` = 完整正式驗收全跑版。 
