# 內湖國中陽光科學夜市：公開發布驗證

日期：2026-10-21（臺灣時間）。

正式遊戲：https://hikaruhen.github.io/sunshine-night-market/

## 發布結果

- 使用者最新明確授權公開發布，並已自行把儲存庫改為public；本輪未變更visibility。
- 遊戲功能版本V6.2，功能提交01aac93；首次發布提交0876306381a5415594bdcd551a1a7b13875434ed。
- main由初始提交正常fast-forward到完整遊戲及發布設定，保留所有開發歷史；開發分支codex/sunshine-v6亦同步。無force、無丟棄其他工作。
- 發布前無Pages／無workflow。已設定原生分支發布：main、根目錄、build_type=legacy、HTTPS啟用，沒有自訂網域或額外權限擴充。
- GitHub Pages首輪build狀態built，無錯誤；內建Actions流程completed／success。
- 首輪部署紀錄：https://github.com/hikaruhen/sunshine-night-market/actions/runs/39551430014

此報告記錄已完成的首次發布與公開站功能實測。報告與證據本身提交後會觸發純文件更新部署；最新版main及Pages狀態在交付前另行核對。

## 發布前檢查

- 51項測試通過（50項遊戲／試紙測試＋1項Pages子路徑資產圖測試）。
- npm run build成功，無第三方依賴或外部CDN。
- 最新功能程式的本機完整四關100分、六種試紙、重測與動畫紀錄見TEST_REPORT.md及docs/qa/v6.2/。

## 公開站實際驗證

- 正式根網址HTTP200，分頁與首頁標題「內湖國中陽光科學夜市」正確，開始按鈕可進遊戲。
- 首頁、CSS及6個JavaScript模組，共8個資產全部200，MIME正確；正規化換行後內容雜湊與本機已測版本全部一致，沒有404或舊版快取。
- 所有資產留在/sunshine-night-market/子路徑，不使用網站根目錄/src等錯誤絕對路徑。
- 在實際公開網址，以390×844瀏覽器畫面完成食品25 → 槓桿含不計分練習50 → 化學75 → 地科100，顯示王者獎章及通過。
- 公開站化學教學實際播放藍紙遇酸示範；正式題實際完成紅／藍試紙×酸／鹼／中性六種組合。
- 六組ready與剛contact仍為原色，接觸後結果全部符合規則；每組浸入區上緣與液面對齊，檢測前後分數不變；動畫中換紙／作答／重入檢測停用，結束恢復。
- 公開站瀏覽器error／warn紀錄為空。

| 公開站液體 | 原紙 | 結果 |
|---|---|---|
| 檸檬汁 | 紅 | 紅，不變 |
| 檸檬汁 | 藍 | 紅，變色 |
| 小蘇打水溶液 | 紅 | 藍，變色 |
| 小蘇打水溶液 | 藍 | 藍，不變 |
| 純水 | 紅 | 紅，不變 |
| 純水 | 藍 | 藍，不變 |

## 證據

- docs/qa/published/assets.json：8個公開資產HTTP／MIME／內容一致性。
- docs/qa/published/litmus.jsonl：公開站六種實際檢測逐階段與分數／操作鎖紀錄。
- docs/qa/published/home.jpg：公開站新名稱首頁。
- docs/qa/published/result-100.jpg：公開站完整四關100分結算。

## 限制

尚未實測iPhone Safari／Android Chrome真機、觸控硬體、真機安全區及系統減少動畫偏好切換；不得把公開站或瀏覽器模擬當作真機驗收。公開網址已可供手機開啟，但真機相容性仍待另行確認。

GitHub Pages公開發布不影響本機Start-Game.cmd預覽；沒有設定開機自動執行、排程或防火牆，也沒有加入追蹤或洩露秘密。
