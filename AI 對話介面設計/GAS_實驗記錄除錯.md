# GAS 實驗記錄沒收到資料 — 檢查清單

前端會在**使用者按下「送出」時**，用 `fetch` POST 一筆 JSON 到你的 GAS 網址。若 GAS 沒有紀錄，請依下面順序檢查。

---

## 1. 確認 Vercel 有設 `VITE_GAS_LOG_URL` 且「有重新部署」

- **Vite 的環境變數是在「建置時」寫進前端的**，不是執行時才讀。
- 到 Vercel 專案 → **Settings** → **Environment Variables**，確認有一筆：
  - **Key**：`VITE_GAS_LOG_URL`
  - **Value**：你的 GAS Web App 網址（例如 `https://script.google.com/macros/s/xxxxx/exec`）
- **改過變數或第一次設定後，一定要到 Deployments 點「Redeploy」**，否則畫面上跑的還是舊的程式，網址仍是空的、不會送資料到 GAS。

---

## 2. 用瀏覽器確認「有沒有送出請求」

1. 打開你的網站（例如 `https://talking-library.vercel.app`）。
2. 按 **F12** 開開發者工具 → 切到 **Network（網路）**。
3. 在網頁上輸入一段文字並**按下送出**。
4. 在 Network 裡找有沒有對你 **GAS 網址** 的請求（例如 `script.google.com`）：
   - **沒有這筆請求**  
     → 多半是 `VITE_GAS_LOG_URL` 沒設或沒重部署，前端根本沒網址可送。回到步驟 1。
   - **有請求，但狀態是紅色（失敗）或 CORS 錯誤**  
     → 代表請求有出去，但被瀏覽器擋下來（常見是 GAS 沒回 CORS 標頭）。看下面「3. GAS 要回 CORS」。
   - **有請求，狀態 200**  
     → 請求有到 GAS 且成功，若試算表還是沒資料，問題在 GAS 程式（讀取 body、寫入試算表）。看下面「4. GAS 程式」。

---

## 3. GAS 要回 CORS 標頭（跨來源請求）

網頁和 GAS 是**不同網域**，瀏覽器會做「跨來源」檢查；GAS 回傳**必須**帶 CORS 標頭，否則瀏覽器會擋掉，前端會看到 CORS 錯誤、你 GAS 也收不到。

在 GAS 的 **doPost** 裡，回傳時要設定標頭，例如：

```javascript
function doPost(e) {
  // ... 你的紀錄邏輯（解析 e.postData.contents、寫入試算表）...

  // 回傳時加上 CORS，讓網頁的 fetch 不會被擋
  return ContentService.createTextOutput(JSON.stringify({ ok: true }))
    .setMimeType(ContentService.MimeType.JSON)
    .setHeader('Access-Control-Allow-Origin', '*')
    .setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS')
    .setHeader('Access-Control-Allow-Headers', 'Content-Type');
}
```

前端已改為以 **text/plain** 送出，不會發 OPTIONS 預檢，GAS **不需**實作 doOptions。

---

## 4. GAS 要正確讀取 JSON body 並寫入試算表

前端送的是 **Content-Type: text/plain**（為避免 OPTIONS 預檢），body 是 **JSON 字串**，GAS 用 `e.postData.contents` 取得後需 `JSON.parse` 再寫入。

範例（依你的試算表與欄位調整）：

```javascript
function doPost(e) {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();

  try {
    // 前端送的是 JSON 字串
    const body = e.postData.contents;
    const data = JSON.parse(body);

    sheet.appendRow([
      data.userId || '',
      data.interfaceType || '',
      data.inputText || '',
      data.thoughtTime,
      data.inputDuration,
      Array.isArray(data.clickPath) ? data.clickPath.join(',') : data.clickPath,
      data.timestamp || new Date().toISOString(),
    ]);
  } catch (err) {
    Logger.log(err);
  }

  return ContentService.createTextOutput(JSON.stringify({ ok: true }))
    .setMimeType(ContentService.MimeType.JSON)
    .setHeader('Access-Control-Allow-Origin', '*')
    .setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS')
    .setHeader('Access-Control-Allow-Headers', 'Content-Type');
}
```

- 欄位對應：`userId`, `interfaceType`, `inputText`, `thoughtTime`, `inputDuration`, `clickPath`, `timestamp`（與前端 `ExperimentDataPayload` 一致）。
- `clickPath` 是陣列，可如上用 `join(',')` 存成一格，或依你 GAS 寫法改成多欄／JSON 字串。

---

## 5. 快速對照

| 狀況 | 可能原因 | 建議 |
|------|----------|------|
| Network 裡沒有對 GAS 的請求 | 前端沒有 GAS 網址 | 在 Vercel 設 `VITE_GAS_LOG_URL` 並 **Redeploy** |
| 有請求但出現 CORS 錯誤 | GAS 沒回 CORS 標頭 | 在 doPost（與 doOptions）加上 `Access-Control-Allow-Origin` 等標頭 |
| 請求 200 但試算表沒新列 | GAS 沒解析 body 或沒寫入 | 用 `JSON.parse(e.postData.contents)` 並 `sheet.appendRow([...])` |
| 部署後仍沒請求 | 建置時沒有帶入變數 | 確認變數名稱是 **VITE_GAS_LOG_URL**，且 Redeploy 的是「最新」部署 |

依序做完 1 → 2（看 Network）→ 3（CORS）→ 4（解析與寫入），通常就能讓 GAS 正常紀錄使用者操作行為。
