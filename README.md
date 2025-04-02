# Student Dashboard React

## 程式設計概述

使用 **Vite + Vue 3 + TypeScript + Pinia** 開發的網頁應用，提供一個 AI 協助的影片Highlight編輯工具，並利用 **SCSS** 進行 UI 樣式管理以及支援 RWD 以適應不同裝置的顯示需求。使用者可以上傳影片，系統將使用 AI 分析產生逐字稿與 highlight 推薦句子，並透過雙區同步的 UI 編輯 highlight 片段。此外，專案透過 **GitHub Pages** 自動部署，並使用 **fetch API** 讀取本地假資料（`transcript.json`），模擬後端 API 回應。

## GitHub Pages 展示

[Student Dashboard React - Demo](https://tonys61311.github.io/video-highlight-tool/)

## 專案結構

```
public/                       # 公開靜態資源資料夾
├── mockApi/
│   └── transcript.json       # 模擬 AI 回傳的逐字稿 JSON
├── videos/
│   └── sample.mp4            # 範例影片檔
└── favicon.ico               # 網站 favicon

src/                          # 應用主要程式碼
├── api/
│   └── transcriptApi.ts      # 處理 transcript API 的模擬請求函式
├── assets/                   # 靜態資源（樣式與圖片）
│   ├── base.css
│   ├── logo.svg
│   └── main.css
├── components/               # UI 元件模組
│   ├── common/               # 通用元件（錯誤畫面、載入動畫等）
│   │   ├── ErrorScreen.vue
│   │   └── LoadingView.vue
│   ├── editing/              # 編輯區元件（逐字稿、選句等）
│   │   ├── TranscriptEditor.vue
│   │   └── TranscriptSection.vue
│   └── preview/              # 預覽區元件（播放剪輯 + 字幕疊加）
│       └── VideoPreview.vue
├── hooks/                    # 自訂 Hook（邏輯封裝）
│   ├── useScrollContainer.ts # 負責自動捲動邏輯
│   └── useVideoControl.ts    # 控制影片播放與同步邏輯
├── stores/                   # 狀態管理（Pinia）
│   ├── apiStore.ts           # 管理 API 請求狀態
│   └── transcriptStore.ts    # 管理 transcript 與 highlight 選取狀態
├── types/
│   └── transcript.ts         # TypeScript 類型定義
├── utils/
│   ├── apiRequestHandler.ts  # 請求包裝器
│   ├── baseApi.ts            # 基本 API 設定
│   └── helpers.ts            # 一般通用工具
├── views/
│   └── EditorView.vue        # 編輯工具主畫面
├── App.vue                   # 應用主組件
└── main.ts                   # 程式進入點（Vue 掛載）

./                           # 根目錄
├── .editorconfig         # 編輯器格式統一設定
├── .env                  # 環境變數設定檔
├── .gitattributes        # Git 屬性控制（如換行風格）
├── .gitignore            # Git 忽略檔案清單
├── .prettierrc.json      # Prettier 程式碼格式設定
├── env.d.ts              # 環境類型定義
├── eslint.config.ts      # ESLint 程式碼檢查設定
├── index.html            # 應用進入點 HTML
├── package.json          # 專案依賴與指令設定
├── package-lock.json     # 鎖定依賴版本
├── README.md             # 專案說明文件
├── tsconfig.json         # TypeScript 主設定檔
├── tsconfig.app.json     # App 專用 TS 設定
├── tsconfig.node.json    # Node 專用 TS 設定（通常給工具/腳本）
└── vite.config.ts        # Vite 打包與開發伺服器設定
```

### 核心技術與架構
- **Vue 3 + Vite**：現代化前端開發框架與打包工具
- **TypeScript**：提升開發穩定性與維護性
- **Pinia**：狀態管理（highlight 資料、影片控制、逐字稿等）
- **Composition API + hooks**：邏輯封裝
- **CSS Modules**：模組化樣式管理
- **GitHub Actions**：自動化 CI/CD，每次 push 後自動部署至 GitHub Pages

### 程式邏輯與核心功能

#### 1. 狀態管理 (Pinia)

##### transcriptStore.ts
此 store 用來管理 transcript 資料、使用者選取的 highlight 語句，以及影片的播放時間與總時長。透過 getters 計算每段 highlight 的相對位置與樣式，並同步編輯區與預覽區之間的選取狀態與播放進度。當使用者點擊語句、或播放影片時，會自動同步對應字幕與時間線。

##### apiStore.ts
loading 狀態管理器，處理資料載入時的 loading 與錯誤提示控制，確保畫面上能即時反映 API 請求狀態。

#### 2. 功能首頁 (TranscriptEditor.vue)
將呼叫以下兩個元件分別顯示（Editing View and Preview View）
##### TranscriptEditor.vue（Editing View）

此元件作為 transcript 編輯區主視圖，負責根據 API 載入的資料迴圈產生多個 **TranscriptSection.vue** 區塊。每個區塊內含可選取的句子項目，並與影片預覽時間同步，使用者可點擊時間戳直接跳轉影片位置，或點選句子加入 highlight。
此元件也透過自定義 hook **useScrollContainer.ts** 搭配 currentHighlightSegment，實現播放時自動捲動並高亮當前語句的功能。

##### VideoPreview.vue（Preview View）

展示 highlight 效果的實際播放畫面。內部結合自訂 hook **useVideoControl.ts** 控制影片播放與時間同步邏輯，包含播放、暫停、快轉、進度條控制與時間跳轉等功能。使用者可以播放影片、點擊進度條跳轉、顯示對應字幕，並同步控制與 transcript 區域互動。
元件會根據 Pinia store 中選取的 highlight 語句計算時間軸進度條（進度區間），並控制影片播放起訖點。當影片播放超出 highlight 區段時，會自動跳轉或停止播放，模擬剪輯後的 highlight 效果。

#### 3. 封裝 Api (包含錯誤處理以及 loading 狀態管理)
在 **utils/apiRequestHandler.ts** 中封裝了 API 請求邏輯，提供統一的錯誤處理與 loading 狀態管理。當發送請求時觸發 apiStore 控制 loading 與錯誤提示。此方法呼叫 BaseApi 類別整合，用以建立可重用的 API 請求邏輯，方便各模組擴充使用。

## 安裝

1. Clone this repository:
   ```bash
   git clone https://github.com/tonys61311/video-highlight-tool
   ```

2. Navigate into the project directory：
   ```bash
   cd video-highlight-tool
   ```

3. Install dependencies：
   ```bash
   npm install
   ```

4. Start the local development server：
   ```bash
   npm run dev
   ```