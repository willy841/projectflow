# 專案營運管理系統 MVP

這是一套以 **專案為核心** 的管理系統 MVP，目標是整合：

- 專案管理
- 客戶需求溝通
- 設計交辦
- 備品採購
- 廠商管理
- 成本與帳務摘要

## 專案 Repo

- GitHub: https://github.com/willy841/projectflow.git

## 技術

- Next.js 16
- React 19
- TypeScript
- Tailwind CSS 4

## 目前已完成

- 管理系統首頁 Dashboard
- 專案列表區塊
- 待辦交辦區塊
- 廠商與帳款區塊
- 財務摘要區塊
- 基本資訊架構與視覺風格

## 啟動方式

```bash
cd project-mgmt
npm install
npm run dev
```

開啟：

```bash
http://localhost:3000
```

## 下一步建議

1. 建立資料模型（Project / Requirement / DesignTask / ProcurementTask / Vendor / Payment）
2. 導入 Prisma + PostgreSQL
3. 製作專案列表頁與專案詳細頁
4. 製作新增專案表單
5. 製作需求溝通與交辦 CRUD
6. 加入登入與權限管理

## MVP 開發方向

第一階段先完成：

- 專案 CRUD
- 專案詳細頁
- 溝通需求紀錄
- 設計交辦
- 備品交辦
- 廠商主檔
- 成本紀錄

之後再擴充：

- 報價單
- 匯款資訊
- 應收應付
- 損益報表
- 獎金計算
