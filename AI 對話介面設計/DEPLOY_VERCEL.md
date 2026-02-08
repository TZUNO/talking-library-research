# Vercel 部署教學（The Talking Library）

從零開始把專案部署到 Vercel，讓受測者用網址就能使用。

---

## 一、什麼是 Vercel？

Vercel 是專門給前端／React 用的託管服務，你只要把程式碼連上去，它會自動幫你建置、上線，並給你一個網址（例如 `https://talking-library-xxx.vercel.app`）。免費方案就夠做實驗使用。

---

## 二、事前準備

1. **專案要能正常建置**  
   在電腦上先跑一次：
   ```bash
   cd "AI 對話介面設計"
   npm run build
   ```
   若沒有錯誤，再繼續。

2. **程式碼要放上 Git**  
   Vercel 是從 **GitHub / GitLab / Bitbucket** 拉程式碼來部署。  
   - 若還沒有：到 [github.com](https://github.com) 註冊，新建一個 repo，把專案 push 上去。  
   - 若已有 repo：確認「AI 對話介面設計」這個專案已經在 repo 裡並 push 到遠端。

---

## 三、用 Vercel 部署（一步步做）

### 步驟 1：註冊／登入 Vercel

1. 打開 [vercel.com](https://vercel.com)
2. 點 **Sign Up**，選擇 **Continue with GitHub**（建議，之後一鍵匯入專案）
3. 依畫面授權 GitHub，完成登入

---

### 步驟 2：匯入專案

1. 登入後在首頁點 **Add New…** → **Project**
2. 會看到你的 **GitHub 帳號底下的 repo 列表**
3. 找到放「AI 對話介面設計」的那個 repo，點 **Import**

> **重要**：本 repo 根目錄有 **vercel.json**，建置與 API 已設定好。匯入時**不要**設定 Root Directory（維持空白），讓 Vercel 使用 repo 根目錄，這樣 `/api/chat` 才不會因路徑含空格而部署失敗。

---

### 步驟 3：建置設定（使用 repo 根目錄的 vercel.json）

Repo 根目錄的 **vercel.json** 已指定從 `AI 對話介面設計` 建置前端、輸出到 `AI 對話介面設計/dist`，且 **api/** 在 repo 根目錄（路徑無空格）。

| 欄位 | 值 |
|------|-----|
| **Root Directory** | 留空（不要填 `AI 對話介面設計`） |
| **Build / Output / Install** | 由 vercel.json 控制，無需在 Vercel 畫面改 |

確認後先**不要**點 Deploy，先做下一步「環境變數」。

---

### 步驟 4：設定環境變數（重要）

在匯入頁面找到 **Environment Variables** 區塊：

1. **Name** 填：`VITE_GAS_LOG_URL`  
   **Value** 填：你的 GAS Web App 網址（例如 `https://script.google.com/macros/s/xxxx/exec`）  
   然後按 **Add** 或 **Add Another**。

2. 再新增一筆：  
   **Name**：`OPENAI_API_KEY`  
   **Value**：你的 OpenAI API Key  

3. 左邊 **Environment** 建議三個都勾選：Production、Preview、Development（這樣每個環境都能用到）。

設好後畫面會像這樣：

```
VITE_GAS_LOG_URL     = https://script.google.com/macros/s/.../exec
OPENAI_API_KEY       = sk-...
```

---

### 步驟 5：部署

點 **Deploy**，Vercel 會：

1. 拉你的程式碼  
2. 執行 `npm install`、`npm run build`  
3. 把建好的靜態檔上線  

大約 1～2 分鐘後會出現 **Congratulations** 和一個網址。

---

### 步驟 6：取得網址與受測者連結

- **主要網址**：例如 `https://talking-library-research-xxx.vercel.app`（每個人不一樣）
- **受測者專用連結**：在網址後面加上 `?userId=編號`，例如：  
  `https://talking-library-research-xxx.vercel.app/?userId=p001`  

App 會自動從網址讀取 `userId`，實驗資料送進 GAS 時就會帶這個編號。

---

## 四、之後要更新程式怎麼做？

1. 在電腦上改程式，然後 **push 到 GitHub**（同一個 repo）
2. 打開 [vercel.com](https://vercel.com) → 你的專案
3. Vercel 通常會**自動偵測 push 並重新部署**；若沒有，在 **Deployments** 頁點右上 **Redeploy** 即可

環境變數不用重設，除非你要換 GAS 網址或換 API Key。

---

## 五、常見問題

**Q：建置失敗，說找不到某個模組？**  
- 確認 **Root Directory** 留空（使用 repo 根目錄與 vercel.json）。  
- 確認該資料夾裡有 `package.json`，且本地執行 `npm run build` 會過。

**Q：上線後打不開／白畫面？**  
- 檢查 **Environment Variables** 是否有打錯字（必須是 `VITE_GAS_LOG_URL`、`OPENAI_API_KEY`）。  
- 到專案 **Deployments** 點最新一次部署，看 **Building** 的 log 有沒有錯誤。

**Q：受測者連結要給哪一個？**  
- 給：`https://你的-app.vercel.app/?userId=受測者編號`  
  例如 `?userId=p001`、`?userId=user02`，編號可自訂。

**Q：可以自訂網址嗎？**  
- 免費方案會給 `xxx.vercel.app`。  
- 若有自己的網域，在 Vercel 專案 **Settings → Domains** 可綁定。

---

## 六、檢查清單（部署前勾一勾）

- [ ] 本地已跑過 `npm run build` 且成功  
- [ ] 程式碼已 push 到 GitHub（或 GitLab / Bitbucket）  
- [ ] Vercel 已新增環境變數：`VITE_GAS_LOG_URL`、`OPENAI_API_KEY`  
- [ ] Root Directory 留空，vercel.json 已存在於 repo 根目錄  
- [ ] 部署完成後用 `?userId=p001` 開一次，確認介面與紀錄正常  

完成以上就可以開始用 Vercel 網址做實驗了。
