# MD6 - Vendor Flow v1 CTO 交付摘要（2026-04-01）

> 目的：整理本輪已完成的 Vendor Flow v1 工程落地內容，供後續驗收、續做與交接使用。

---

## A. 本輪目標

本輪依照既有產品規格與 projectflow 三角色規則，開始落地：

- `Vendor Assignment` = 內部逐項管理單位
- `Vendor Package` = 同專案 + 同廠商的對外發包彙整單
- reply 以 package-level 為主、assignment-level 為輔
- 正式發包確認發生在 package 層
- Vendor Flow v1 採 mock-driven MVP，不先硬上完整後端

---

## B. 本輪已完成內容

### 1. 建立 Vendor Flow v1 的 mock domain model

新增檔案：
- `project-mgmt/src/components/vendor-data.ts`

已建立內容：
- `VendorAssignmentStatus`
- `VendorPackageStatus`
- `VendorReply`
- `VendorAssignment`
- `VendorPackage`
- mock assignments / packages 資料
- 查詢 helper：
  - `getVendorAssignmentById`
  - `getVendorPackageById`
  - `getAssignmentsByProjectId`
  - `getPackagesByProjectId`
  - `getAssignmentsForPackage`
- 顯示 helper：
  - `getAssignmentStatusLabel`
  - `getPackageStatusLabel`
  - `getVendorStatusClass`

### 2. 建立 Vendor Assignment 詳細頁

新增檔案：
- `project-mgmt/src/app/vendor-assignments/[id]/page.tsx`
- `project-mgmt/src/components/vendor-assignment-detail.tsx`

目前頁面能力：
- 可依 assignment id 顯示詳細頁
- 顯示 assignment 狀態
- 顯示 vendor / execution item / budget / updatedAt
- 顯示 spec / note
- 顯示所屬 package
- 可跳轉到 package detail page
- 顯示 assignment-level replies（flat list）

產品語意：
- 明確呈現這是 **item-level 管理頁**
- 不把 assignment 頁做成正式發包主頁

### 3. 建立 Vendor Package 詳細頁

新增檔案：
- `project-mgmt/src/app/vendor-packages/[id]/page.tsx`
- `project-mgmt/src/components/vendor-package-detail.tsx`

目前頁面能力：
- 可依 package id 顯示詳細頁
- 顯示 package 狀態
- 顯示 vendor / 包單狀態 / 正式發包時間 / 正式發包人
- 顯示 package summary / notes
- 顯示 package-level replies（flat list）
- 顯示 package 內所有 assignment
- 可點入 assignment detail page
- 提供 CTA：`確認並正式發包`

產品語意：
- 明確呈現這是 **對外整包發包主頁**
- package-level reply 是主體
- 正式發包確認只在 package 層

### 4. 補上 package-level 正式發包 CTA 的 mock 行為

實作位置：
- `project-mgmt/src/components/vendor-package-detail.tsx`

目前行為：
- 點擊 `確認並正式發包`
- package 狀態會切成 `formally_confirmed`
- 頁面上會顯示：
  - 正式發包時間
  - 正式發包人
- package 內 assignment 的 badge 顯示會同步為：
  - `已隨 package 正式發包`

注意：
- 目前是前端 local state / mock semantics
- 還不是後端持久化狀態同步

### 5. 在 Project Detail Page 補上 Vendor Flow 區塊

修改檔案：
- `project-mgmt/src/app/projects/[id]/page.tsx`

已補內容：
- `Vendor Assignments` 區塊
- `Vendor Packages` 區塊

目前頁面能力：
- 專案詳細頁可看到該 project 底下的 assignments 概覽
- 可看到該 project 底下的 packages 概覽
- assignment 可跳 detail page
- package 可跳 detail page
- assignment 顯示其是否已納入 package

產品語意：
- project detail 現在已能呈現 Vendor Flow 的雙層結構
- 不再只有模糊的單筆 vendor task 概念

---

## C. 本輪新增 / 修改檔案

### 新增
- `project-mgmt/src/components/vendor-data.ts`
- `project-mgmt/src/components/vendor-assignment-detail.tsx`
- `project-mgmt/src/components/vendor-package-detail.tsx`
- `project-mgmt/src/app/vendor-assignments/[id]/page.tsx`
- `project-mgmt/src/app/vendor-packages/[id]/page.tsx`

### 修改
- `project-mgmt/src/app/projects/[id]/page.tsx`

---

## D. 本輪已驗證結果

### 1. Build 驗證
已執行：
- `npm run build`

結果：
- ✅ build 成功

build 後可見 routes：
- `/`
- `/projects`
- `/projects/[id]`
- `/projects/new`
- `/vendor-assignments/[id]`
- `/vendor-packages/[id]`

### 2. Git commit
已 commit：
- `10be9da` — `feat: add vendor flow v1 mock pages`

---

## E. 本輪尚未完成 / 尚未做的事

### 1. 尚未 push 到 GitHub
原因：
- workspace git 沒有 configured push destination
- `git remote -v` 為空
- 所以目前無法直接 push

### 2. 尚未做真正後端持久化
目前仍是：
- mock data
- local state
- 前端頁面語意與互動骨架

尚未做：
- database schema
- API / server action
- 真實 CRUD
- 正式狀態持久化

### 3. 尚未做完整列表頁
目前只有 detail pages：
- assignment detail
- package detail

尚未做：
- vendor assignments list page
- vendor packages list page

### 4. 尚未把 package formal confirmation 寫回共享資料源
目前 package 頁面上的正式發包按鈕只改該頁 local state，
不是整個系統共享資料的正式更新。

---

## F. 驗收建議

本地驗收方式：

```bash
cd /home/node/.openclaw/workspace/project-mgmt
npm run dev
```

建議驗收頁面：

### Project detail
- `/projects/spring-popup-2026`
- `/projects/obsidian-launch-2026`

請驗：
- 是否已出現 `Vendor Assignments`
- 是否已出現 `Vendor Packages`
- 是否能看出 assignment / package 的層級差異

### Assignment detail
- `/vendor-assignments/va-spring-main-backdrop`
- `/vendor-assignments/va-obsidian-reception-wall`

請驗：
- 是否明確是 item-level 管理頁
- 是否顯示所屬 package
- assignment replies 是否為 flat list
- 是否沒有誤導成正式發包主頁

### Package detail
- `/vendor-packages/vp-spring-xingcheng-001`
- `/vendor-packages/vp-obsidian-woodlight-001`

請驗：
- 是否有整包主頁感
- package replies 是否是主體
- `確認並正式發包` CTA 語意是否正確
- 點擊後 package 狀態是否更新
- assignment badge 是否同步顯示為已隨 package 正式發包

---

## G. 後續建議下一步

### 路線 1：前端骨架再整理
優先做：
- package list page
- assignment list page
- project detail 中 vendor 區塊 UI 收斂
- CTA / badge / hierarchy 視覺強化

### 路線 2：共享狀態 / mock source 整理
優先做：
- 把 package formal confirmation 從 local state 提升到共享 mock source
- 讓 project detail / package detail / assignment detail 狀態能互相反映

### 路線 3：資料落地
優先做：
- schema 設計
- server action / API
- VendorAssignment / VendorPackage / Reply 持久化

---

## H. 本輪最短摘要

本輪已完成：
- Vendor Flow v1 的 mock domain model
- assignment detail page
- package detail page
- project detail 補上 vendor assignments / packages 概覽
- package-level 正式發包 CTA（mock 行為）
- build 成功
- 已 commit，但尚未 push

關鍵 commit：
- `10be9da` — `feat: add vendor flow v1 mock pages`
