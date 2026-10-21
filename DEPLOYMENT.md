# 內湖國中陽光科學夜市：GitHub Pages 發布

正式網址：https://hikaruhen.github.io/sunshine-night-market/

使用者於2026-10-21明確授權公開發布，並已自行將儲存庫改為public。此輪不變更visibility，也不加入秘密或追蹤。

## 發布方式

- GitHub Pages原生分支發布，來源為main分支根目錄。初次檢查沒有既有Pages或Actions workflow，無須覆蓋設定。
- 根目錄`.nojekyll`讓GitHub直接提供靜態HTML、CSS、ES modules。GitHub內建Pages發布流程產生實際部署記錄。
- `index.html`使用`./src/style.css`與`./src/app.js`，所有模組以相對路徑匯入，支援`/sunshine-night-market/`子路徑，不需要外部CDN或伺服器。
- 開發提交保留於codex/sunshine-v6；發布使用正常fast-forward更新main，不force、不丟棄既有歷史。

## 發布前檢查

`npm test`、`npm run build`必須成功。V6.2已實測完整四關100分、六種石蕊結果與重測、原色→接觸→顯色順序；見TEST_REPORT.md及docs/qa/v6.2/原始資料。真機Safari／Android及系統減少動畫偏好切換尚未實測。

## 發布後驗證

必須等到GitHub Pages實際部署成功，再確認正式網址HTTP200、新名稱首頁、所有CSS／模組資產無404、開始可進入遊戲。推送成功本身不等於發布完成。最終實測結果另記於DEPLOYMENT_REPORT.md。

## 後續更新

完成修改與測試後，正常更新main會觸發GitHub內建Pages部署。不要修改儲存庫可見性或強制推送。原本的Start-Game.cmd仍可供本機預覽，不影響公開網站。
