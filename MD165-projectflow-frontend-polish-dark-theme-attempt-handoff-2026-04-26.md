# MD165 — Projectflow frontend polish dark-theme attempt handoff — 2026-04-26

Status: active handoff
Scope: frontend visual polish line only

---

## 1. 任務目標

本輪目標原本是：
- 在 **不改文案、不改互動、不改功能** 的前提下
- 先把 `projectflow` 做成更接近使用者偏好的 **dark-premium / high-end SaaS** 視覺風格
- 並先以 **Project Detail** 作為樣板頁驗證方向

---

## 2. 目前進度

### 已完成的事
1. 已建立前端美化主線文件：
   - `projectflow-frontend-visual-polish-execution-principles-v1-2026-04-26.md`
   - `projectflow-frontend-visual-polish-execution-principles-v2-2026-04-26.md`
   - `projectflow-frontend-visual-polish-batch1-work-order-v1-2026-04-26.md`
   - `projectflow-frontend-visual-polish-batch1-work-order-v2-2026-04-26.md`
   - `projectflow-frontend-visual-polish-batch1a-global-primitives-implementation-list-v1-2026-04-26.md`
   - `projectflow-frontend-visual-polish-batch1a-global-primitives-implementation-list-v2-2026-04-26.md`

2. 已建立 hard constraints：
   - 不改文案
   - 不改互動
   - 不改功能
   - 不混功能修正
   - 所有改動需可回退

3. 已進行 dark theme / premium 化實作嘗試，並推上 GitHub 多個 commit。

4. 已確認正式 deploy blocker（archived tests 進 build typecheck）已清掉，Vercel build 可過。

### 目前卡住的事
雖然技術上已經能把頁面改 dark，
但**視覺品質仍未達到使用者要的示意圖等級**。

使用者的核心 feedback 是：
- 現在只是 dark 化
- 還不像真正高質感 SaaS
- 尤其卡片材質、背景空氣感、整體層次，與示意圖差很多

也就是說：
> 目前成果是 **dark mode 版本**，不是 **premium visual reconstruction 成功版本**

---

## 3. 問題核心（重要）

本輪已確認的偏差如下：

### A. 問題不在功能，而在視覺語言層級
- 不是 bug
- 不是流程錯
- 是整體卡片材質 / 背景層次 / 視覺節奏不夠高級

### B. 問題不是某個零件沒改，而是整體世界觀還沒真正成立
使用者明確指出：
- 不是要「黑框白內頁」
- 不是要「容器變深色」
- 而是要整個視覺系統更接近示意圖的 dark-premium 世界觀

### C. 持續 patch 不是最佳路線
目前已多次驗證：
- 用 patch 的方式逐塊把白底改黑
- 雖然能逐步 dark 化
- 但很難直接到達使用者期望的高級感

因此後續若續接，應避免再走「哪塊白就補哪塊」的無限 patch 路線。

---

## 4. 目前已做過的代表 commit（前端美化線）

以下是與 frontend polish 相關的主要 commit，供後續回查：

- `38339d6` — `style: add batch1a shell and surface primitives`
- `4e0bc83` — `style: refine batch1a controls and card surfaces`
- `62992d9` — `build: exclude archived legacy tests from prod typecheck`
- `a2d133e` — `style: deepen v2 premium dark polish`
- `f88e104` — `style: shift project detail into full dark surface`
- `d3d0b84` — `style: expand dark foundation across core entry pages`
- `942213f` — `style: finish project detail dark-theme pass`
- `c73092a` — `style: unify auth shell dark canvas`
- `8d9e318` — `style: deepen project detail assignment panels`
- `b68f310` — `style: reconstruct project detail material hierarchy`

注意：
這些 commit 大多是視覺路線嘗試，不代表已達使用者滿意版本。

---

## 5. 回退基線（非常重要）

使用者明確要求：
> 必須隨時可以改回 frontend polish 前的穩定基線版本。

### 前端美化前的穩定基線
本輪應明確認定：
- **frontend polish 前的穩定基線 = 在開始 visual polish code 之前的 GitHub `main` 狀態**
- 實務上，後續若要回退，應以**前端美化開始前的 commit** 作為 rollback anchor

### 實務建議
後續續接者應先做：
1. 找出 frontend polish 開始前最後一個穩定 commit
2. 明確記錄成 rollback anchor
3. 若接下來還要繼續美化，所有新嘗試都應：
   - 小批次
   - 易回退
   - 不混功能修正

### 目前交接判斷
這條線目前尚未視為設計定稿，
因此：
> **保留隨時整段回退到 frontend polish 前基線的權利**

---

## 6. 已定義規則

1. 文案不改
2. 功能不改
3. 互動不改
4. 已驗收骨架不亂動
5. 不可偷混功能修正
6. 所有視覺改動必須可回退
7. 若視覺效果只是 dark 化、但未達高級感，不應假裝已成功

---

## 7. 使用者已拍板的設計方向

使用者偏好的方向已收斂為：
- 整體色調比照參考圖
- 整站先進 dark theme 世界觀
- 再談細節高級感
- 不是黑框白內頁
- 不是局部卡片 dark 化
- 要整體看起來像高質感 SaaS

使用者也明確指出：
- 目前 card 層次與底色仍不像示意圖
- 現狀最多只算 dark mode
- 還不是 premium visual quality

---

## 8. 後續建議（非常重要）

若後續還要續做這條線，建議不要直接延續目前 patch 路線。

### 建議改成：單頁視覺重構法
只做一頁：
- `Project Detail`

但方法改成：
- 把它當單一畫布
- 重新設計背景層次
- 重新設計主卡/次卡/弱卡材質
- 重新設計整體節奏與焦點分配
- 只動視覺，不動功能/互動/文案/骨架

### 不建議
- 不要再東補一塊、西補一塊
- 不要再用 patch 方式無限追白底
- 不要假裝目前版本已接近示意圖

---

## 9. 下一步建議

續接者應先做以下其中一個決策：

### 路線 A — 直接回退到 frontend polish 前基線
適合情境：
- 使用者認為目前方向偏差太大
- 不值得在當前半成品上繼續修

### 路線 B — 保留目前 dark 嘗試，但改成真正的單頁重構
適合情境：
- 使用者接受目前作為中間稿
- 願意再花一輪把 Project Detail 重做到真正像示意圖

---

## 10. 一句話交接結論

> 本輪 frontend polish 已完成 dark theme 嘗試、deploy blockers 清理與多輪 Project Detail 視覺改造，但使用者已明確判定：目前成果仍只是 dark 化，尚未達到示意圖所要求的高質感 SaaS 層次；後續應保留隨時回退到 frontend polish 前穩定基線的能力，並避免再用零碎 patch 路線續改。
