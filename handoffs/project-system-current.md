# Project System Current Handoff

## 1. 專案名稱
- 專案系統建置
- 當前主線：Vendor Flow

## 2. 專案目標
- 建立一套可長期運作的專案系統建置工作模式
- 讓需求討論、產品釐清、工程實作、前端設計與跨 chat 銜接都有明確治理規則
- 讓團隊可在長 context 下持續運作，不因切換 chat / session 而失憶或重工
- 目前聚焦於 Vendor Flow 的產品語意、前端骨架、正式發包入口與導流 UX

## 3. 目前階段
- Vendor Flow 前端骨架與導流 UX 收斂階段

## 4. 本輪 scope
### 本輪已做
- 定義酷亞大總管 / CPO / CTO / 前端設計 Agent 的協作方式
- 建立 project system team charter 與 handoff SOP
- 建立 current handoff
- 確認 Vendor Flow 實際工作樹為 `project-mgmt`
- 找到並閱讀 Vendor Flow 相關 md 文件：
  - `Vendor-Flow-Spec-v1-2026-03-31.md`
  - `MD5-vendor-flow-context-handoff-2026-03-31.md`
  - `MD6-vendor-flow-v1-cto-delivery-2026-04-01.md`
- 將 Vendor Flow 核心 detail pages 整合進真正的 GitHub 主線 repo `projectflow`
- 補齊 GitHub 主線工作樹依賴並確認 build 可通過
- 完成 Vendor Flow Assignment → Package 導流第一刀
- 完成 Vendor Flow 第二刀：將 Assignment 頁導流收斂成 `PackageRoutingPanel`
- 完成 execution tree / assignment list 層級的收合與 package 導流收斂

### 本輪不做
- 不做後端
- 不做 shared state / 持久化
- 不做真正 package creation flow / package picker flow
- 不做正式資料流更新

## 5. 已完成事項
- 已定義主身份為「酷亞大總管」
- 已定義定位為「管理策略夥伴 + CPO」
- 已定義 post approval distribution
- 已定義必須主動使用 memory search
- 已建立常駐團隊成員：CTO Agent、前端設計 Agent
- 已建立 `teams/project-system-team.md`
- 已建立 `templates/project-handoff-template.md`
- 已建立並持續更新本 handoff
- 已補入規則：對話 context 接近 80% 或高風險長上下文時，必須主動更新 md handoff

### Vendor Flow 已完成
- Vendor Flow 核心語意已定：
  - Assignment = 內部逐項管理
  - Package = 同專案 + 同廠商的對外整包發包主體
  - 正式發包只在 Package Detail
  - Reply 採 flat list
- Vendor Flow core detail pages 已進 GitHub 主線
- GitHub 主線可 build
- 已推上 GitHub 主線的重要 commits：
  - `5be47e1` — `feat: add vendor flow detail pages`
  - `f4031d5` — `feat: refine assignment package routing states`

### Vendor Flow 在 `project-mgmt` 工作樹已完成但尚未同步主線的 commits
- `3677a5f` — `feat: refine vendor flow package hierarchy`
- `bebb554` — `feat: add assignment to package handoff states`
- `00aaa20` — `refactor: tighten assignment package routing panel`
- `1e4c613` — `feat: refine assignment list package routing`

### 已確認完成的 UX 收斂
1. Assignment → Package 導流第一刀
- 有 package 時可清楚導到 Package 頁
- 沒 package 時不再流程斷掉，會提示下一步

2. Assignment 頁第二刀
- 導流已收斂成固定 `PackageRoutingPanel`
- 更清楚表達：
  - 這裡不是正式發包頁
  - 正式發包只在 Package Detail
  - 使用者此刻唯一正確下一步是什麼

3. Assignment list / execution tree 層收斂
- assignment list 改成摘要 + 展開模式
- 列表層有 package / 無 package 都有清楚下一步提示
- mock action 後自動收合回摘要狀態
- 列表層仍不出現正式發包按鈕

## 6. 進行中事項
- 將 `project-mgmt` 工作樹中尚未同步的 Vendor Flow 收斂成果，持續評估是否整合進 GitHub 主線
- 準備 Vendor Flow 第三刀方向

## 7. 待批准事項
- 是否進入 Vendor Flow 第三刀
- 第三刀要先做哪一種真正可操作 flow：
  1. package creation flow
  2. package selection / package picker flow
  3. shared mock source / shared state

## 8. 阻塞與風險
### 阻塞
- `project-mgmt` 工作樹本身沒有 configured remote，因此子 agent 在該工作樹可 build / commit，但不能直接自行 push
- 部分成果需由主線整合流程帶回真正的 GitHub repo

### 風險
- `project-mgmt` 與真正 GitHub 主線 repo 並非同一工作樹，容易造成「已做但未同步主線」的認知落差
- 目前 Vendor Flow 仍是 mock-driven，未來若進 shared state / 後端，需避免重寫語意
- 若不持續更新 handoff，長 context 很容易在新 chat 中斷線

## 9. 最新重要決策
- 確認 Vendor Flow 實際工作樹為 `project-mgmt`
- 確認 GitHub 正式 repo 為 `https://github.com/willy841/projectflow.git`
- 確認 Vendor Flow 要整合進 GitHub 主線，而不是另開獨立歷史覆蓋遠端
- 決定目前先不做後端，先做欄位定義與前端語意 / hierarchy 收斂
- 決定正式發包按鈕只在 Package Detail
- 決定 Assignment 頁必須導流到 Package 頁
- 決定 context 接近 80% 時，必須主動更新 md handoff
- 決定 execution tree / assignment list 層也必須補 package 導流與自動收合

## 10. 團隊分工狀態
### 酷亞大總管 / CPO
- 已就位
- 負責需求討論、釐清、批准後派工、整合回報與治理規則維護

### CTO Agent
- 已就位
- 常駐待命，可接續 Vendor Flow 第三刀
- 在 `project-mgmt` 工作樹持續做 Vendor Flow 收斂

### 前端設計 Agent
- 已就位
- 常駐待命，可接續 Vendor Flow 第三刀
- 持續提供 Vendor Flow hierarchy / routing / CTA / 文案收斂建議

## 11. 下一步
1. 若要延續 Vendor Flow，最合理的是進入第三刀
2. 第三刀應從以下三個方向擇一優先：
   - package creation flow
   - package selection / package picker flow
   - shared mock source / shared state
3. 若繼續推 execution tree / list 層，可考慮把 `AssignmentPackageRoutingStrip` / package routing strip 再帶回 GitHub 主線

## 12. 必讀材料
- `IDENTITY.md`
- `SOUL.md`
- `AGENTS.md`
- `teams/project-system-team.md`
- `templates/project-handoff-template.md`
- 本檔案 `handoffs/project-system-current.md`
- `Vendor-Flow-Spec-v1-2026-03-31.md`
- `MD5-vendor-flow-context-handoff-2026-03-31.md`
- `MD6-vendor-flow-v1-cto-delivery-2026-04-01.md`

## 13. 新 Chat 開場檢查清單
新 chat 開始時，酷亞大總管必須先做：
- 讀取 relevant memory
- 讀取 `IDENTITY.md`
- 讀取 `SOUL.md`
- 讀取 `AGENTS.md`
- 讀取 `teams/project-system-team.md`
- 讀取最新 handoff（本檔案）
- 若要延續 Vendor Flow，也要讀 Vendor Flow 相關 spec / handoff 檔
- 確認目前階段、scope、待批准事項與下一步
- 再開始接續討論或派工

## 14. 備註
- 本檔案已納入 80% context 主動更新規則的實際維護
- 若下一輪正式進入 Vendor Flow 第三刀，應在完成收斂後再次更新本檔案
