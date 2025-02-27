# 跨平台圖片處理應用開發流程

本專案旨在建立一個能讀取 JPEG EXIF 資訊、處理圖片並加上邊框與文字的應用，並支援批次處理。核心採用單一 PWA 應用，再分別利用 Electron 與 Capacitor/Ionic 將應用打包到桌面與行動裝置上。所有邏輯均以 TypeScript 撰寫，達到三平台通吃的目標。

---

## 1. 專案概述

### 1.1 核心功能

- **EXIF 讀取與文字組合**  
  讀取 JPEG 的 EXIF 資訊並依據相機型號、焦距、光圈、快門速度與 ISO 組合成顯示文字。
- **圖片處理**  
  為圖片加上邊框與底部文字，並支援批次處理多張圖片。
- **品質要求**  
  盡量保持接近無損的圖片品質（建議使用最高品質 JPEG 或 PNG）。

### 1.2 目標平台

- **網頁**：PWA 應用，透過瀏覽器即可運作。
- **桌面**：使用 Electron 將 PWA 包裝成桌面應用。
- **行動裝置**：使用 Capacitor 或 Ionic 將 PWA 打包成 iOS 與 Android 原生應用。

---

## 2. 技術選型與架構設計

### 2.1 核心 PWA 應用

- **前端框架**：React + TypeScript
- **工具**： Vite 快速建立 React 專案。
- **核心邏輯**：將圖片處理與 EXIF 擷取的功能封裝成共用模組，放在專案內（例如 `src/core`）。

### 2.2 桌面端包裝

- **工具**：Electron
- **概念**：利用 Electron 將 PWA 應用嵌入桌面容器，藉由 Node.js API 處理檔案存取與批次作業。

### 2.3 行動端包裝

- **工具**：Capacitor 或 Ionic
- **概念**：利用 Capacitor 將 PWA 打包成 iOS 與 Android 原生應用，並根據需求調整原生插件（例如檔案存取、相機等）。

---

## 3. 專案結構

### 2.1 樹狀圖

```md
my-app/
├── src/                    # 核心應用程式碼 (PWA)
│   ├── components/         # 可重用的 React UI 組件
│   ├── core/               # 共用邏輯，例如圖片處理、EXIF 擷取等
│   ├── pages/              # 各個頁面與路由配置
│   ├── styles/             # 全局樣式 / SCSS 等
│   ├── utils/              # 工具函式與輔助模組
│   ├── App.tsx             # 主應用組件
│   └── index.tsx           # React 入口文件，掛載 App
├── public/                 # 靜態資源，如 index.html、favicon 等
├── electron/               # 桌面應用 (Electron) 相關文件
│   ├── main.ts             # Electron 主進程入口，設定桌面應用啟動流程
│   └── preload.ts          # Electron 預載入腳本，用來橋接 Node 與前端
├── capacitor/              # 行動端包裝 (Capacitor) 相關配置
│   └── capacitor.config.json
├── package.json            # 專案依賴與腳本配置
├── tsconfig.json           # TypeScript 配置檔
└── README.md               # 專案說明文件
```

### 2.2 各目錄說明

src/
此目錄為核心應用所在，包含：

components/：存放可重用的 UI 組件（例如按鈕、卡片等）。
core/：封裝圖片處理、EXIF 擷取等共用邏輯，方便桌面與行動端共用。
pages/：針對不同頁面或功能劃分的組件，並設定路由。
styles/：全局樣式、佈局、SCSS 文件。
utils/：各種輔助工具函式，如格式轉換、驗證等。
App.tsx / index.tsx：分別為主應用組件與 React 入口文件，負責渲染整個 PWA 應用。
public/
放置靜態資源，例如 index.html 作為應用入口，以及圖示等資源。

electron/
此目錄包含 Electron 相關的文件：

main.ts：Electron 主進程文件，負責建立窗口、載入 PWA 打包後的靜態資源，並調用 Node.js API 進行檔案操作或批次處理。
preload.ts：預載入腳本，能安全地在渲染進程與 Node 環境之間建立橋接，保護應用安全性。
capacitor/
如果使用 Capacitor 將應用打包成行動端 App，此目錄存放配置文件（例如 capacitor.config.json），定義行動端相關設定與插件。

package.json 與 tsconfig.json
分別管理專案依賴、執行腳本與 TypeScript 編譯配置。

這種架構的好處在於：

共用核心邏輯：所有圖片處理與 EXIF 擷取功能只需撰寫一次，能夠在各平台間共用。
平台分離：將桌面（Electron）與行動（Capacitor）的適配程式碼獨立管理，方便針對各平台做專屬調整。
易於維護與擴展：清晰的目錄劃分讓程式碼結構更有條理，方便未來新增功能或進行重構。
你可以依據專案需求進一步調整結構，例如增加 config/ 資料夾存放共用配置檔、assets/ 存放圖片與圖標等。這樣的結構有助於保持代碼的整潔與可維護性。

