# 從本機推到 GitHub 的步驟

把「AI 對話介面設計」專案從電腦推到 GitHub，之後才能用 Vercel 部署。

---

## 一、事前準備

### 1. 安裝 Git（若還沒裝）

Mac 通常已有 Git。在終端機輸入：

```bash
git --version
```

若有顯示版本（例如 `git version 2.x.x`）就不用裝。若沒有，到 [git-scm.com](https://git-scm.com) 下載安裝。

### 2. 註冊 GitHub

1. 打開 [github.com](https://github.com)
2. 點 **Sign up**，填 email、密碼、使用者名稱
3. 驗證 email 後登入

### 3. 不要上傳的檔案（已幫你設好）

專案裡已有一份 **`.gitignore`**，會自動排除：

- `node_modules/`（依賴，很大且可重建）
- `.env`（你的 API Key、GAS 網址，**絕對不要上傳**）
- `dist/`、`build/`（建置結果）

所以之後 push 時，不會把這些推到 GitHub。

---

## 二、兩種做法（選一種即可）

### 做法 A：整個「talking-library-research」當一個 repo（推薦）

適合：你希望一個 repo 裡就包含「AI 對話介面設計」這個資料夾，之後 Vercel 用 **Root Directory** 指定子資料夾即可。

#### 步驟 1：在 GitHub 建立新 repo

1. 登入 [github.com](https://github.com)
2. 右上角 **+** → **New repository**
3. **Repository name** 填：`talking-library-research`（或你喜歡的名稱）
4. 選 **Public**
5. **不要**勾選 "Add a README file"（保持空 repo）
6. 點 **Create repository**

#### 步驟 2：在本機「專案上一層」初始化 Git 並推送

在終端機執行（路徑請依你的實際位置調整）：

```bash
# 進入專案上一層（例如 talking-library-research）
cd /Users/tzuno/Documents/talking-library-research

# 若還沒初始化過 Git
git init

# 若上一層沒有 .gitignore，可加一個避免把不相關東西推上去
# （專案內「AI 對話介面設計」已有 .gitignore）
echo "node_modules/" >> .gitignore
echo ".env" >> .gitignore
echo ".DS_Store" >> .gitignore

# 加入所有檔案（.gitignore 會自動排除 node_modules、.env 等）
git add .

# 第一次提交
git commit -m "Initial commit: The Talking Library 材質檢索介面"

# 連到你的 GitHub repo（把 YOUR_USERNAME 換成你的 GitHub 帳號，REPO_NAME 換成 repo 名稱）
git remote add origin https://github.com/YOUR_USERNAME/talking-library-research.git

# 推上去（第一次用 -u 設定追蹤）
git branch -M main
git push -u origin main
```

例如你的 GitHub 帳號是 `tzuno`、repo 名稱是 `talking-library-research`，則：

```bash
git remote add origin https://github.com/tzuno/talking-library-research.git
git push -u origin main
```

之後在 Vercel 匯入時選這個 repo，並把 **Root Directory** 設成 **`AI 對話介面設計`**。

---

### 做法 B：只把「AI 對話介面設計」當一個 repo

適合：你希望 repo 根目錄就是這個專案，Vercel 不用設 Root Directory。

#### 步驟 1：在 GitHub 建立新 repo

1. 登入 [github.com](https://github.com)
2. **+** → **New repository**
3. **Repository name** 填：`talking-library` 或 `ai-dialog-ui`（任選）
4. **Public**，**不要**勾選 "Add a README file"
5. **Create repository**

#### 步驟 2：在本機「AI 對話介面設計」資料夾裡初始化並推送

```bash
# 進入專案
cd "/Users/tzuno/Documents/talking-library-research/AI 對話介面設計"

# 初始化 Git（若此資料夾從未 git init 過）
git init

# 加入所有檔案（.gitignore 會排除 node_modules、.env）
git add .

# 第一次提交
git commit -m "Initial commit: The Talking Library"

# 連到 GitHub（YOUR_USERNAME、REPO_NAME 換成你的）
git remote add origin https://github.com/YOUR_USERNAME/REPO_NAME.git

# 推上去
git branch -M main
git push -u origin main
```

例如：

```bash
git remote add origin https://github.com/tzuno/talking-library.git
git push -u origin main
```

Vercel 匯入時選這個 repo，**不用**設 Root Directory。

---

## 三、第一次 push 可能遇到的狀況

### 1. 問你 GitHub 帳號密碼

- GitHub 已不支援用密碼 push，要用 **Personal Access Token (PAT)**：
  1. GitHub → 右上頭像 → **Settings** → 左側最下面 **Developer settings** → **Personal access tokens** → **Tokens (classic)**
  2. **Generate new token (classic)**，勾選 **repo**
  3. 複製產生的 token（只顯示一次）
  4. 終端機要你輸入密碼時，**貼上這個 token**（不要貼登入密碼）

### 2. 已經有 `git init` 或 `origin` 了

若執行 `git init` 時說 "Reinitialized existing Git repository" 沒關係，繼續即可。

若執行 `git remote add origin ...` 時說 **remote origin already exists**：

```bash
# 看目前的遠端
git remote -v

# 若要換成新的 GitHub repo，先刪掉再加
git remote remove origin
git remote add origin https://github.com/YOUR_USERNAME/REPO_NAME.git
```

### 3. 路徑或檔名有空格

路徑有空格時請用引號，例如：

```bash
cd "/Users/tzuno/Documents/talking-library-research/AI 對話介面設計"
```

---

## 四、之後要更新程式怎麼推？

改完程式後，在**同一個專案目錄**執行：

```bash
git add .
git commit -m "說明你做了什麼改動"
git push
```

之後 Vercel 會依你設定自動或手動重新部署。

---

## 五、檢查清單（push 前）

- [ ] 已註冊 GitHub 並登入
- [ ] 已在 GitHub 建立一個**空的**新 repo（不要勾 Add README）
- [ ] 本機專案裡有 **`.gitignore`**（專案內已有一份，會排除 `node_modules`、`.env`）
- [ ] **不要**把 `.env` 加入 Git（有 .gitignore 就不會加進去）
- [ ] `git remote add origin` 的網址是**你的** GitHub 帳號與 repo 名稱
- [ ] 若用密碼登入失敗，改用 **Personal Access Token** 當密碼

完成後，到 GitHub 網頁重新整理，就會看到程式碼已經在 repo 裡，接著可以照 **DEPLOY_VERCEL.md** 用 Vercel 部署。
