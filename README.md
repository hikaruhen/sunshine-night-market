# 陽光夜市 Sunshine Night Market — V6.1

繁體中文、手機優先的 HTML5 科學遊戲。不限時間，依序完成食品冷藏必要性、槓桿、紅藍石蕊、太陽系四關，滿分 100、60 分通過，每位玩家都有電子獎章。無登入、無資料庫、無外部 CDN、不收集個資，預設靜音。

## 本機啟動

需要 Node.js 22 或以上；沒有第三方套件，不必 npm install。

```sh
npm run dev
```

開啟 http://127.0.0.1:5173 。服務僅接受本機連線，不對區域網路或網際網路開放。

```sh
npm test
npm run build
node scripts/serve.mjs --dist
```

正式建置為 dist/ 內的靜態檔案。停止已啟動的服務後，才在同一連接埠啟動 dist 預覽。也可直接開啟 index.html，但部分瀏覽器會限制本機 ES modules，建議使用上述服務。

## 教師試玩

在這台電腦啟動本機服務，以瀏覽器開啟網址，點「開始挑戰」。食品關回答「是否必須冷藏」，不是選放置地點；可常溫保存不代表不能冷藏。每關先看教學，再按準備好了開始，不會倒數或自動跳關。槓桿先有一次不計分練習；力矩平衡也通過，但只有施力力矩較大才會抬起。所有關卡答錯可重試，成功結果由玩家按下一題繼續。完成後可截圖獎章，點「重新挑戰」重設。

使用瀏覽器裝置模擬可試 320～430 px 直式畫面。此網址不能直接從手機開啟；實際手機測試需另行安排經授權的網路預覽或靜態網站環境。本次沒有公開部署。

## 文件與架構

- GAME_SPEC.md：完整使用者 V6.1 規格。
- IMPLEMENTATION_PLAN.md：架構、槓桿題庫與計時決策。
- ACCEPTANCE_TESTS.md：驗收項目。
- TEST_REPORT.md：實際測試結果，區分單元與瀏覽器驗證。
- KNOWN_ISSUES.md：未驗證項目與限制。
- src/data.js：集中題庫、分數、秒數與科學函式。
- src/engine.js：可注入時鐘的遊戲狀態機。
- src/app.js / style.css：畫面、單指點擊、CSS 美術與動畫。
- src/food-art.js：依開封、乾燥／泡發、切片狀態繪製的專用本機 SVG。
- SCIENCE_SOURCES.md：食品題參考資料。
- docs/：原始 V6.0 歷史規格、報告與新版驗收畫面。
- test/game.test.js：Node 內建自動化測試。

版本分支：codex/sunshine-v6。交付狀態與驗證限制以 TEST_REPORT.md 為準。
