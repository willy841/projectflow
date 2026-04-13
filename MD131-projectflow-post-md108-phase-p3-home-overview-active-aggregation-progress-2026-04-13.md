# MD131 — projectflow post-MD108 Phase P3 home overview active aggregation progress (2026-04-13)

> Status: ACTIVE / PROGRESS  
> Phase: post-MD108 / Phase P3  
> Role: 記錄 `MD130` 啟動後，P3-W1 / P3-W2 第一輪實作落地結果。

---

## 1. 本輪已完成內容

### P3-W1 — home overview DB-backed read-model（第一輪）
已完成：
- 新增 `src/lib/db/home-overview-read-model.ts`
- 已補首頁 overview aggregation source
- 已包含：
  - project count
  - in-progress count
  - pending design count
  - pending procurement count
  - pending vendor count
  - active collected total
  - active outstanding total
  - recent projects

---

### P3-W2 — homepage metric cards closure（第一輪）
已完成：
- `src/app/page.tsx` 已改為吃正式 overview source
- 首頁 stats 不再是硬編碼 mock 數字
- 首頁 recent projects 不再只吃 local mock project list
- 首頁右側 finance 區塊已改成 `Active 收款概況`
- 已明確避免 month summary / Accounting Center extension 混入

---

## 2. 本輪工程意義

本輪重點不是 UI 小修，而是：
- 首頁第一次正式從 mock dashboard 推進到 DB-backed active overview aggregation
- P3 的 active aggregation 邊界已開始與 Accounting Center 做出切分

---

## 3. 目前尚未完成

### P3-W3 — recent projects closure
雖然已改為 DB source，但下一步仍可再收斂：
- owner 顯示目前仍為 `-`
- recent project source 的顯示語意仍可再優化

### P3-W4 — active collected / outstanding aggregation closure
雖已落地到首頁，但仍需要：
- 做 focused validation
- 補進度 / closure 文件
- 確認不與 month aggregation 混線

---

## 4. 一句話總結

> `MD131` 記錄的是 Phase P3 第一輪實作已開始落地：首頁 overview 已從 mock dashboard 進入 DB-backed active aggregation，metric cards 與 recent projects 也已切到正式 source；下一步應收 recent projects 細節與 active collected/outstanding aggregation 的驗證與文件化。