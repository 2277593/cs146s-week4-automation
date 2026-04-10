# 第四週作業回報

## 交件資料
姓名：**Tao Wang**
這份作業大約花了我 **5** 小時完成。

---

## 關鍵檔案一覽（供老師快速索引）

老師可在以下路徑找到所有自動化相關設定，直接點連結即可跳轉到 GitHub：

| 檔案 | 用途 |
|------|------|
| [`CLAUDE.md`](https://github.com/2277593/cs146s-week4-automation/blob/main/CLAUDE.md) | Agent 的「操作手冊」：專案架構、常用指令、任務挑選規則、報告格式、通知指令 |
| [`.claude/commands/do-next-task.md`](https://github.com/2277593/cs146s-week4-automation/blob/main/.claude/commands/do-next-task.md) | `/do-next-task` 指令定義：7 步驟完整流程（選任務→實作→測試→報告→通知） |
| [`.claude/commands/add-task.md`](https://github.com/2277593/cs146s-week4-automation/blob/main/.claude/commands/add-task.md) | `/add-task` 指令定義：自然語言轉結構化子任務，自動附加至 `docs/TASKS.md` |
| [`.claude/settings.local.json`](https://github.com/2277593/cs146s-week4-automation/blob/main/.claude/settings.local.json) | Claude Code 權限設定：預先核准所有自動化需要的 Bash 指令，讓流程無需手動確認 |
| [`.pre-commit-config.yaml`](https://github.com/2277593/cs146s-week4-automation/blob/main/.pre-commit-config.yaml) | Git pre-commit hooks：black（格式化）、ruff（lint + 自動修正）、end-of-file-fixer、trailing-whitespace |
| [`docs/TASKS.md`](https://github.com/2277593/cs146s-week4-automation/blob/main/docs/TASKS.md) | 任務佇列：9 個任務、21 個子任務，agent 每次執行後自動勾選完成項目 |
| [`reports/latest.html`](https://github.com/2277593/cs146s-week4-automation/blob/main/reports/latest.html) | 最新一次執行報告（每次覆寫），含所有歷史執行紀錄的封存連結 |

---

## 工作流程摘要

### 核心設計概念

工作流程從使用者在 Claude Code 輸入 `/do-next-task` 開始，不需要任何其他輸入。Agent 自動讀取 `docs/TASKS.md`，挑選最早的可執行未完成子任務，識別相關檔案後進行實作，並在完成後立即執行測試驗證。每次執行結束後，agent 將本次工作內容、測試結果與下一步建議寫入 `reports/latest.html`（同時存一份帶時間戳的永久封存版，如 `reports/2026-04-10T10-23.html`），並透過 macOS Notification Center 通知使用者、自動開啟瀏覽器。整個流程一個指令觸發，全程無需人工介入。

### 具體實作內容

**`CLAUDE.md`**：專案的核心「操作手冊」，讓每個新的 Claude Code 實例無需重新探索即可立即上工。內容涵蓋常用指令（`uv run make test`、`uv run make lint` 等）、後端架構說明（FastAPI + SQLAlchemy + SQLite、dependency injection 測試模式），以及 agent 應遵循的完整工作流程規則：最小編號優先 → 跳過被擋任務 → 每次只取第一個子任務 → 太大則縮範圍。

**`.claude/commands/do-next-task.md`**：定義 `/do-next-task` 指令的完整七步驟執行邏輯：
1. 讀取 `docs/TASKS.md` 識別未完成項目
2. 選出最早的可執行子任務（含跳過被擋任務的邏輯）
3. 列出相關檔案（思考步驟，不詢問使用者）
4. 實作（限制：不新增多餘抽象、不加預防性防禦式寫法）
5. 執行 `uv run make test`（測試失敗必須修復才能繼續）
6. 產生帶時間戳的封存報告並覆寫 `reports/latest.html`（賽博龐克風格 HTML，六個固定章節）
7. 發送 macOS Notification Center 通知並自動開啟瀏覽器

**`.claude/commands/add-task.md`**：定義 `/add-task <描述>` 輔助指令。Agent 讀取現有任務格式、推斷 2–5 個具體可執行的子任務，並以格式完全一致的方式附加至 `docs/TASKS.md` 末尾。每個子任務必須符合三個條件：具體（指名檔案或函式）、可獨立執行、可驗證。

**`.claude/settings.local.json`**：預先核准所有自動化流程需要的 Bash 指令（測試執行、系統通知、開啟瀏覽器、uvicorn 啟動等），避免每次執行時中斷流程要求使用者確認。這是讓工作流「真正全自動」的關鍵設定。

**`.pre-commit-config.yaml`**：Git commit 前自動執行 black 格式化、ruff lint 修正、結尾空白清理，確保每次提交的程式碼品質一致，不需要手動跑格式化。

---

### 精確使用方式（重現步驟）

**環境需求：**
- [Claude Code CLI](https://claude.ai/code) 已安裝並登入
- [uv](https://docs.astral.sh/uv/) 已安裝（Python 套件管理）
- macOS（通知功能使用 `osascript`）

**環境準備（僅需一次）：**
```bash
# Clone 專案
git clone https://github.com/2277593/cs146s-week4-automation.git
cd cs146s-week4-automation

# 安裝依賴
uv sync

# 安裝 pre-commit hooks
uv run pre-commit install
```

**啟動自動化工作流：**
```
# 在專案目錄下開啟 Claude Code
claude

# 執行一次自動化任務推進
/do-next-task
```
→ Agent 自動挑任務、實作、測試、產報告、發通知、開瀏覽器。整個過程約 30–60 秒，完成後用瀏覽器查看 `reports/latest.html`。

**繼續推進下一個子任務：**
```
/do-next-task
```
→ 重複執行即可逐步完成 `docs/TASKS.md` 中所有項目，每次只推進一個子任務。

**新增自訂任務：**
```
/add-task 新增筆記的標籤篩選功能，支援多標籤 AND 篩選，並補上測試
```
→ `docs/TASKS.md` 末尾會自動附加帶有具體子任務的新任務區塊，下次 `/do-next-task` 即可接續執行。

**查看執行歷史：**
- 開啟 `reports/latest.html`（最新報告，底部有所有歷史封存連結）
- 或直接查看 `reports/` 目錄下的時間戳封存檔（格式：`reports/YYYY-MM-DDThh-mm.html`）

---

## 反思

### 前後比較

加上自動化工作流之前，每次推進任務都需要自己判斷「現在該做什麼」、手動執行測試、再手動整理結果，容易漏步驟或忘記跑 lint。加上之後，整個過程變成一個指令：任務選擇、實作、驗證、報告一氣呵成。最直接的差異是「不需要再花心力管流程本身」——過去一個功能可能需要 10 分鐘（想、寫、測、整理），現在 60 秒一個指令搞定，且每次輸出格式一致，可以跨回合比對差異。

### 最有價值的部分

最有價值的是 **CLAUDE.md 中明確的任務挑選規則**與**每次只做一個子任務的限制**。前者讓 agent 面對複雜任務清單時行為可預期，不會一次改一堆檔案；後者強迫把大任務拆細，避免一個指令改了十個地方卻沒有一個被完整測試。其次是 **`.claude/settings.local.json` 的預核准機制**——如果每個 Bash 指令都要手動確認，「全自動」就名存實亡了。預核准把真正的人工判斷點留在「看報告、決定要不要繼續」，其餘全部自動化。

### 下一步想改進什麼

最想補的是**跨對話的任務狀態感知**。目前每次 `/do-next-task` 都是冷啟動，agent 需重新讀檔才知道進度。如果能有一個輕量的狀態檔記錄「上次停在哪、目前有多少測試通過」，可以讓每次執行更快。
