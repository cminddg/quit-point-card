# 離職集點卡2.0

這是第一版前端專案骨架，目標先做出 4 頁畫面，並用假資料或本地資料完成：

- 首頁
- 新增紀錄頁
- 紀錄列表頁
- 統計圖表頁

## 技術選擇

- Vite：啟動快，適合做前端雛形
- React：用元件方式整理頁面，比較好維護
- React Router：處理 4 個頁面的切換

## 啟動方式

```bash
npm.cmd install
npm.cmd run dev
```

## GitHub Pages

這個專案已加上 GitHub Actions 自動部署設定，推到 `main` 會自動發布到 GitHub Pages。

- 預期網址：[https://cminddg.github.io/quit-point-card/](https://cminddg.github.io/quit-point-card/)
- 工作流程檔案：`.github/workflows/deploy-pages.yml`

## Axios 防呆

此專案已加入 Axios 防呆機制。

- 在 `npm install`、`npm run dev`、`npm run build`、`npm run preview` 前都會檢查
- 只要偵測到 Axios，就會直接中止並顯示清楚警告
- 政策是先全面改用原生 `fetch`
