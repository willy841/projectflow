# MD-HANDOFF — projectflow vendor trade selection fix for production — 2026-05-13

Status: active
Scope: `projectflow` / vendor data / production candidate note

## 1. 任務背景

本次修正處理的是 vendor data / 廠商資料中的工種選擇問題。

使用者已驗證：
- 工種選擇現在已恢復正常

本輪問題分成兩層，所以正式站不能只上一個 commit，必須整組一起上。

---

## 2. 要進正式站的 commit

### Commit 1
- `320e305`
- `fix(projectflow): make vendor trade selection explicit in create modal`

用途：
- 修正「新增廠商」彈窗中的工種選擇互動
- 讓建立新廠商時，工種可直接明確選取

### Commit 2
- `effe4e5`
- `fix(projectflow): load vendor trade options on detail page`

用途：
- 修正「廠商詳情頁 / 廠商資訊編輯區」沒有載入工種選項的問題
- 讓已建立工種能正確出現在廠商詳情頁的工種多選區

---

## 3. 正式站升版規則

這次正式站升版時：

> **`320e305` + `effe4e5` 必須一起上，不要只上一個。**

原因：
- `320e305` 只處理新增廠商彈窗互動
- `effe4e5` 處理廠商詳情頁工種選項載入
- 使用者目前驗到正常，是兩個修正一起成立後的結果

---

## 4. 建議正式站候選描述

可用以下名稱記錄這次正式站候選：

### Vendor trade selection fix set
- `320e305`
- `effe4e5`

---

## 5. 一句話總結

> 本次 vendor 工種選擇修正要進正式站時，應以一組候選一起上：`320e305`（新增廠商彈窗工種選擇）與 `effe4e5`（廠商詳情頁工種選項載入），不可只上其中一個。