# Project System Current Handoff

## 1. 專案名稱
- 專案系統建置

## 2. 專案目標
- 建立一套可長期運作的專案系統建置工作模式
- 讓需求討論、產品釐清、工程實作、前端設計與跨 chat 銜接都有明確治理規則
- 讓團隊可在長 context 下持續運作，不因切換 chat / session 而失憶或重工

## 3. 目前階段
- 團隊治理與協作基礎設施建立階段

## 4. 本輪 scope
### 本輪要做什麼
- 定義酷亞大總管的身份與工作方式
- 定義 CPO / CTO / 前端設計 Agent 的協作邏輯
- 建立批准後派工（post approval distribution）規則
- 建立 memory search 作為查證規則
- 建立專案系統建置團隊章程
- 建立新 chat 銜接 SOP 與 handoff 模板
- 建立第一份 current handoff

### 本輪不做什麼
- 尚未開始實際的專案系統產品功能開發
- 尚未下達新的工程實作任務
- 尚未進行新的 UI/UX 專案交付

## 5. 已完成事項
- 已定義主身份為「酷亞大總管」
- 已定義定位為「管理策略夥伴」
- 已加入 CPO（Chief Product Officer）角色
- 已定義說話風格為：冷靜、準、少廢話、尊敬
- 已定義不可變成：推卸責任、瞎掰、亂說話的人
- 已把上述身份與原則寫入 `IDENTITY.md` 與 `SOUL.md`
- 已在 `AGENTS.md` 寫入 CPO / CTO / 前端設計 Agent 的 projectflow 協作規則
- 已補入 post approval distribution 規則
- 已補入 memory search 規則
- 已確認 CTO Agent 與前端設計 Agent 為常駐團隊成員，不是臨時派遣 agent
- 已完成 CTO Agent 常駐身份重設與待命
- 已完成前端設計 Agent 常駐身份重設與待命
- 已建立 `teams/project-system-team.md`
- 已建立 `templates/project-handoff-template.md`
- 已寫入規則：長 context 對話結束前，酷亞大總管應主動產出或更新 handoff md 檔

## 6. 進行中事項
- 建立第一份 current handoff（本文件）

## 7. 待批准事項
- 尚未收到新的具體專案系統開發需求
- 尚未收到新的正式派工批准

## 8. 阻塞與風險
### 阻塞
- 目前沒有具體產品功能需求進入定義與開發階段

### 風險
- 若未持續維護 handoff，長 context 專案仍可能在新 chat 中失去脈絡
- 若未嚴格區分討論中 / 待批准 / 已批准執行中，團隊角色可能再次混亂
- 目前常駐成員是透過既有 session 重設為團隊成員，不是新建 thread-bound persistent session；治理上可運作，但日後若平台能力改變，可再升級架構

## 9. 最新重要決策
- 決定主身份為「酷亞大總管」
- 決定定位為「管理策略夥伴 + CPO」
- 決定嚴格執行 post approval distribution
- 決定遇到過去決策 / 脈絡 / 偏好 / 待辦時必須主動使用 memory search
- 決定 CTO 與前端設計 Agent 為常駐 team members
- 決定專案系統建置需要固定的新 chat 銜接 SOP
- 決定 handoff md 檔應由酷亞大總管在舊對話結束前主動產出或更新

## 10. 團隊分工狀態
### 酷亞大總管 / CPO
- 已就位
- 負責需求討論、釐清、批准後派工、整合回報與治理規則維護

### CTO Agent
- 已就位
- 常駐待命中
- 等待正式批准後的工程任務

### 前端設計 Agent
- 已就位
- 常駐待命中
- 等待正式批准後的 UI/UX 任務

## 11. 下一步
1. 等待使用者提出第一個具體的專案系統需求
2. 由酷亞大總管 / CPO 協助收斂成可執行任務
3. 等待使用者批准後，分派給 CTO Agent / 前端設計 Agent

## 12. 必讀材料
- `IDENTITY.md`
- `SOUL.md`
- `AGENTS.md`
- `teams/project-system-team.md`
- `templates/project-handoff-template.md`
- 本檔案 `handoffs/project-system-current.md`

## 13. 新 Chat 開場檢查清單
新 chat 開始時，酷亞大總管必須先做：
- 讀取 relevant memory
- 讀取 `IDENTITY.md`
- 讀取 `SOUL.md`
- 讀取 `AGENTS.md`
- 讀取 `teams/project-system-team.md`
- 讀取最新 handoff（本檔案）
- 確認目前階段、scope、待批准事項與下一步
- 再開始接續討論或派工

## 14. 備註
- 這份文件應隨著專案進展持續更新
- 若未來出現更具體子專案，可再拆分成多份 handoff 檔
