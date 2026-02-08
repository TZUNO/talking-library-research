# AI 對話介面設計（The Talking Library）

永續建材檢索 AI 介面研究專案：引導式 (Template) / 自由式 (Free-form) 人因實驗。

Original Figma: [AI 對話介面設計](https://www.figma.com/design/dNyZw77BUfI77a4yjIKt9E/AI-%E5%B0%8D%E8%A9%B1%E4%BB%8B%E9%9D%A2%E8%A8%AD%E8%A8%88)

## 本地開發

1. `npm i` 安裝依賴  
2. 複製 `.env.example` 為 `.env`，填入 `VITE_GAS_LOG_URL`、`OPENAI_API_KEY`（選填 `SERPER_API_KEY` 可啟用網路搜尋）  
3. 執行 `vercel dev` 或 `npm run dev` 啟動（檢索需 `/api/chat`，建議用 `vercel dev` 同時跑前端與 API）  

## 環境變數檢查

- **VITE_GAS_LOG_URL**：請使用 GAS **新部署後**的 Web App 網址，否則實驗資料會送錯端點。  
- **OPENAI_API_KEY**：OpenAI API Key，供 `/api/chat` 材質檢索使用。  
  - Vercel：在 **Settings > Environment Variables** 新增 `OPENAI_API_KEY`，**改動後需重新部署**。  
  - 本地：在 `.env` 設定 `OPENAI_API_KEY`，並用 `vercel dev` 跑 API。  
- **SERPER_API_KEY**（選填）：設定後 API 會先以 [Serper](https://serper.dev) 搜尋網路，再以搜尋結果為脈絡用 OpenAI 回覆，呈現來源連結與相關圖片（Perplexity 風格）。  

## GAS 實驗記錄（ExperimentalData）

專案內含 **`GAS_ExperimentalData.gs`**，可貼到 Google Apps Script 專案中部署為 Web App，接收前端 POST 的實驗資料並寫入試算表。

1. 新增 Google 試算表（或使用既有檔案）  
2. **擴充功能 > Apps Script**，新增檔案後貼上 `GAS_ExperimentalData.gs` 內容  
3. **部署 > 新增部署**，類型選「網路應用程式」  
   - 執行身份：我；存取：任何人  
4. 取得部署網址，設為前端的 **VITE_GAS_LOG_URL**  

試算表會自動建立分頁 **ExperimentalData**，欄位包含：受測者代號、介面類型、輸入文字、思考時間、輸入耗時、點擊路徑、時間戳記、回應狀態、回應字數、錯誤訊息。  

## 型別說明（實驗數據）

- `clickPath` 為 **string[]**（例如 `["template-1", "submit"]`），前端以 JSON 送出；GAS 寫入時以逗號分隔字串儲存。  

## Vercel 部署

1. 在 Vercel 專案 **Settings > Environment Variables** 新增：  
   - `VITE_GAS_LOG_URL` = 你的 GAS Web App 網址  
   - `OPENAI_API_KEY` = 你的 OpenAI API Key  
2. 重新部署後，受測者可用 **`https://your-app.vercel.app/?userId=p001`** 進入，App 會自動從 URL 讀取 `userId`。
  