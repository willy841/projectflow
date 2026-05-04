# 主流程總圖

```mermaid
flowchart TD
    A[Project Detail\n專案主入口] --> B[Design Tasks\n設計任務板]
    A --> C[Procurement Tasks\n備品任務板]
    A --> D[Vendor Assignments\n廠商發包板]

    B -->|全部確認| E[task_confirmations + design snapshots]
    C -->|全部確認| F[task_confirmations + procurement snapshots]
    D -->|全部確認| G[task_confirmations + vendor snapshots]

    E --> H[Quote Cost / 成本來源]
    F --> H
    G --> H

    G --> I[Vendor Detail\n廠商資料 / 未付金額 / 對帳摘要]
    G --> J[Vendor Packages\n廠商發包文件]

    H --> K[Closeouts\n結案紀錄]
    H --> I

    E --> L[首頁待處理設計交辦]
    F --> M[首頁待採購備品]
    G --> N[首頁待廠商處理]

    O[專案收款] --> P[首頁已收款 / 未收款]
    O --> K
```

## 一句話版

- `Project Detail` 是任務發布與總入口。
- `Design / Procurement / Vendor` 三條線各自工作。
- 真正正式成立的節點是 `全部確認`。
- 一旦確認，資料才會承接到：
  - `Quote Cost`
  - `Vendor Detail`
  - `Vendor Packages`
  - `Closeouts`
  - `首頁 summary`

## 最重要的閱讀規則

### 1. 還沒全部確認
代表：
- 還在任務板內部處理
- 不算正式承接完成

### 2. 已全部確認
代表：
- `task_confirmations` / `snapshots` 成立
- 下游頁面開始有正式可讀資料

### 3. Vendor 線是另外一條正式承接線
Vendor 線除了進 `Quote Cost`，還會直接影響：
- `Vendor Detail`
- `Vendor Packages`
