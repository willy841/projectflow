# MD-RULES — projectflow 新增 MD 併入與索引更新規則 — 2026-05-12

Status: active
Scope: `projectflow` only
Purpose: 定義未來每新增一份 `projectflow` 文件時，應如何判角色、判層級，以及應更新哪些入口檔

## 1. 目的

`projectflow` 未來還會持續新增：
- handoff
- runtime memo
- deploy note
- summary
- rule
- index
- governance 補件

如果每新增一份 MD 都靠臨場判斷，很容易：
- 漏更新入口
- 更新過頭
- 把短期文件硬塞進最高層索引
- 讓整套封裝越來越亂

因此這份文件的目的是：
> **把新增 MD 之後應如何併入現有系統包，正式寫成規則。**

---

## 2. 核心原則

### 原則 A — 不是每份新 MD 都進所有索引
新增一份 MD，不代表：
- 所有 `INDEX` 都要改
- 所有 `SUMMARY` 都要改
- `GOVERNANCE` 一定要改

必須先判斷：
1. 角色
2. 層級
3. 是否具長期價值
4. 是否改變入口讀法

### 原則 B — 只更新必要入口層
新文件只應更新：
- 它真正影響到的入口檔
- 它真正改變讀法的那一層

### 原則 C — 短期 debug / 一次性紀錄，不自動升格進最高入口
如果只是：
- 一次性 debug memo
- 臨時排查
- 短期觀測

除非確認有長期價值，否則不應自動進 `PACKAGE` / 最高層 `INDEX`。

---

## 3. 每新增一份 MD 時，必做判斷

新增新文件後，先回答以下問題：

1. 這份文件的角色是什麼？
   - `MASTER`
   - `INDEX`
   - `SUMMARY`
   - `GOVERNANCE`
   - `PACKAGE`
   - `OPERATIONS`
   - `HANDOFF`
   - `RULES`

2. 它屬於哪一層？
   - 治理層
   - 測試站 / 正式站 / runtime 層
   - DB / migration 層
   - handoff 層
   - 歷史參考層

3. 它是否有長期價值？
   - 是 → 納入長期封裝入口
   - 否 → 可只作為局部文件存在

4. 它是否改變入口讀法？
   - 是 → 更新 `PACKAGE` / `INDEX`
   - 否 → 不必硬更新最高層入口

---

## 4. 不同類型文件的併入規則

## A. 新 `HANDOFF`
### 必要時更新
- `MD-PACKAGE-projectflow-system-bundle-entrypoint-2026-05-12.md`
- `MD-INDEX-projectflow-system-package-and-context-boundary-2026-05-12.md`

### 視情況更新
- `MD-OPERATIONS-projectflow-full-system-playbook-2026-05-12.md`
- `MD-SUMMARY-projectflow-final-closure-and-operating-state-2026-05-12.md`

### 一般不必更新
- `MD-GOVERNANCE...`
- `MD-RULES...`

除非這份 handoff 帶來新的長期治理規則。

---

## B. 新 `GOVERNANCE`
### 一定要更新
- `MD-PACKAGE-projectflow-system-bundle-entrypoint-2026-05-12.md`
- `MD-INDEX-projectflow-system-package-and-context-boundary-2026-05-12.md`

### 視情況更新
- `MD-OPERATIONS...`
- `MD-SUMMARY...`

如果治理規則改變了整體流程，也應同步更新操作手冊。

---

## C. 新 `OPERATIONS` / deploy / runtime / tool / skill 手冊
### 一定要更新
- `MD-PACKAGE...`
- `MD-OPERATIONS...`（若是同類手冊整合）

### 視情況更新
- `MD-INDEX...`
- `MD-SUMMARY...`

如果只是專項手冊，可以從 `OPERATIONS` 指過去，不必把細節硬塞進總手冊。

---

## D. 新 `SUMMARY`
### 一定要更新
- `MD-PACKAGE...`

### 視情況更新
- 舊的 `SUMMARY` 是否要標記過期或歷史化
- `MD-INDEX...` 若需要調整當前主線摘要入口

---

## E. 新 `RULES`
### 一定要更新
- `MD-PACKAGE...`
- `MD-RULES-projectflow-document-role-and-naming-semantics-2026-05-12.md`（若與命名 / 規則體系有關）

### 視情況更新
- `MD-GOVERNANCE...`

---

## F. 新 DB / migration / live schema 事故文件
### 一定要更新
- `MD-OPERATIONS...`
- `MD-PACKAGE...`

### 視情況更新
- `MD-SUMMARY...`
- 相關 runtime / production 結論文件

因為這類文件常直接影響：
- clean-start
- rebuild
- 正式站穩定性
- future deploy

---

## 5. 最高層入口更新原則

### `MD-PACKAGE...`
只收：
- 長期入口
- 長期分層
- 真的重要的系統級內容

不要把每一份短期 memo 都塞進去。

### `MD-INDEX...`
只更新：
- 會改變讀法的新增內容
- 新增的重要層級入口

### `MD-GOVERNANCE...`
只更新：
- 真正改變制度規則的內容

### `MD-OPERATIONS...`
更新：
- 會改變實際操作方式的內容

### `MD-SUMMARY...`
更新：
- 會改變高層狀態判斷的內容

---

## 6. 每新增文件後的最小併入紀錄（建議）

未來每新增一份 `projectflow` 文件，建議在建立後順手記一段：

```text
Ingestion decision:
- Role:
- Layer:
- Long-term value: yes/no
- Must update:
- Optional update:
- No update needed for:
```

這樣未來不必重想一次。

---

## 7. 一句話總結

> **未來新增 `projectflow` 文件時，不應無差別更新全部索引；應先判角色、判層級、判長期價值，再只更新必要入口層。最高層封裝入口只收真正長期且改變讀法的內容，短期文件不可自動升格。**
