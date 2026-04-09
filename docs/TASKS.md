# Tasks

## 1) 啟用 pre-commit 並修正倉庫問題
[x] 安裝 hooks：`pre-commit install`
[x] 執行：`pre-commit run --all-files`
[x] 修正所有格式化/lint 問題（black/ruff）

## 2) 新增筆記搜尋 API
[x] 以 SQLAlchemy filter 新增/擴充 `GET /notes/search?q=...`（不區分大小寫）
[x] 更新 `frontend/app.js` 以使用搜尋條件
[x] 在 `backend/tests/test_notes.py` 增加測試

## 3) 完成 Action Item 流程
[x] 實作 `PUT /action-items/{id}/complete`（已先建立雛形）
[x] 更新 UI 顯示完成狀態（已串接）並擴充測試範圍

## 4) 改善抽取邏輯
[x] 擴充 `backend/app/services/extract.py`，解析像 `#tag` 這類標籤並回傳
[x] 為新的解析行為補上測試
[x] （選做）提供 `POST /notes/{id}/extract`，將筆記轉成 action items

## 5) 增強 Notes CRUD
[x] 新增 `PUT /notes/{id}` 來編輯筆記（標題/內容）
[x] 新增 `DELETE /notes/{id}` 來刪除筆記
[x] 更新 `frontend/app.js` 以支援編輯/刪除，並補上測試

## 6) 請求驗證與錯誤處理
[ ] 在 `schemas.py` 加入基本驗證規則（例如最小長度）
[ ] 適當回傳 400/404 的清楚錯誤訊息，並補上驗證失敗測試

## 7) 文件一致性檢查
[ ] 建立並維護 `API.md`，描述所有 endpoint 與 payload
[ ] 確保每次變更後，更新文件與實際的 OpenAPI（`/openapi.json`）一致
