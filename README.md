# GoMyPay 一頁式數位產品銷售漏斗

Next.js App Router、TypeScript、Prisma、PostgreSQL 與 Tailwind CSS 建置。網站只建立訂單並將買家送至 GoMyPay 預設付款頁，完全不接收、處理或儲存卡號、有效期限、CVV。

## 本機啟動

1. 安裝 Node.js 20+ 與 PostgreSQL。
2. 執行 `npm install`。
3. 複製 `.env.example` 為 `.env`，填入測試商店資料。
4. 建立資料庫後執行 `npm run db:migrate`（首次可命名為 `init`）。
5. 執行 `npm run db:seed`。
6. 執行 `npm run dev`，開啟 `http://localhost:3000/sales/emotional-eating`。

本機 callback 必須是 GoMyPay 可連線的 HTTPS 網址；請用安全 tunnel，並把 `APP_BASE_URL` 設為該公開網址。不要把 `.env` 提交到版本控制。

## 環境變數

- `APP_BASE_URL`：公開網站根網址，不加結尾 `/`
- `DATABASE_URL`：PostgreSQL 連線字串
- `GOMYPAY_MODE`：`test` 使用 TestShuntClass/TestCallOrder；`production` 使用正式端點
- `GOMYPAY_CUSTOMER_ID`：送出交易用商店代號
- `GOMYPAY_HASH_CUSTOMER_ID`：callback MD5 使用的明碼商店代號
- `GOMYPAY_STR_CHECK`：驗證密碼
- `ADMIN_SECRET`：後台手動同步 API 的高強度隨機密碼
- `SMTP_*`：寄信設定；未設定時郵件會寫入 `EmailLog`，狀態為 `queued`
- `ALLOW_ZERO_TEST_PURCHASE`：站長零元實測通道，預設必須為 `false`
- `ZERO_TEST_PURCHASE_CODE`：站長專用高強度測試碼，只能放在伺服器環境變數

切換正式環境前，必須把 `GOMYPAY_MODE=production`、`APP_BASE_URL` 與三個 GoMyPay 憑證換成正式值，並先以測試商店完成整套 callback 驗證。

## 測試付款

### NT$199 主商品

1. 進入 `/checkout`，不勾選加購。
2. 填寫姓名、Email、手機，按「前往安全付款頁」。
3. 確認訂單金額為 199，網站自動 POST 到 GoMyPay 測試頁。
4. 依 GoMyPay 測試商店提供的測試方式完成付款。
5. callback 驗證 `str_check`、訂單及金額後才會把訂單改為 paid；return 頁只輪詢顯示狀態。

### 含加購訂單

在 `/checkout` 勾選加購：AI 初評 +1、飲料清單 +99、外食菜單 +199。可分別確認 200、298、398，全部勾選為 498。AI 初評不能單買，API 也會阻擋。付款後 `/thank-you/[orderNo]` 可建立獨立的 NT$399 OTO 訂單。

### 上線後用 NT$0 實測完整交付

先在 Vercel Production 環境變數設定：

```env
ALLOW_ZERO_TEST_PURCHASE=true
ZERO_TEST_PURCHASE_CODE=請使用至少32字元、只有你知道的隨機測試碼
```

重新部署後進入 `/checkout`，填入自己的真實 Email，並在「站長測試通道」輸入測試碼。送出後系統會建立金額為 0 的 paid 訂單，跳過 GoMyPay，直接執行與真實付款相同的權限開通、Access Page 與 Email 流程。測試碼只在伺服器核對，不會寫入訂單或 log。

測試完成後，立刻把 `ALLOW_ZERO_TEST_PURCHASE` 改回 `false`（或刪除 `ZERO_TEST_PURCHASE_CODE`）並重新部署。此通道採雙重開關，任一設定缺少都不能建立零元訂單。

## 手動同步付款狀態

管理員可呼叫：

```bash
curl -X POST "https://your-domain.example/api/admin/orders/EE.../sync" \
  -H "x-admin-secret: YOUR_ADMIN_SECRET"
```

此路由呼叫 TestCallOrder 或 CallOrder，只有回傳已付款且金額完全相符時才執行開通；重複同步不會重複建立權限或寄信。`ADMIN_SECRET` 不得放在前端。

## 數位產品交付

付款 callback 通過簽章、訂單與金額驗證後，系統會以條件更新將訂單由 `pending` 改為 `paid`，再依 OrderItem 建立 Entitlement。每筆新訂單只會有一個 canonical access token；重複 callback 不會重複開通或寄信。

數位產品與 placeholder 連結集中在 `src/content/digitalProducts.ts`。將其中各項目的 `downloadUrl: "#"` 換成實際 Google Drive、Tally、Google Sheet 或 Notion 網址即可。

若 SMTP 未設定，交付信會以 `queued` 狀態寫入 `EmailLog`，付款及產品開通仍會成功。Email 已包含 LINE、Instagram 與 Facebook 官方聯絡連結。

### 自動寄送 Email 與 PDF 附件

在部署平台設定 SMTP：

```env
SMTP_HOST=smtp.example.com
SMTP_PORT=587
SMTP_USER=你的SMTP帳號
SMTP_PASS=你的SMTP密碼或應用程式密碼
SMTP_FROM=可樂吉健康研究所 <你的寄件信箱>
DIGITAL_PRODUCT_PDF_URL=https://可公開下載或具長效授權的網址/handbook.pdf
```

完成付款後，Email 會包含專屬 Access Page 連結；若有設定 `DIGITAL_PRODUCT_PDF_URL`，也會將 PDF 以「下班後嘴饞止損包-閱讀版.pdf」附加寄出。未設定 PDF URL 時仍會寄出 Access Page 連結。

信件主旨、正文、使用順序及官方聯絡資訊已內建，不需要另外撰寫。要讓信件真正寄到收件匣，仍須完整設定 `SMTP_HOST`、`SMTP_PORT`、`SMTP_USER`、`SMTP_PASS` 與 `SMTP_FROM`；若未設定，系統只會把信件留在資料庫 `EmailLog`，不會實際寄出。

### SMTP 除錯

不熟悉終端機時，可直接開啟 `/admin/email-test`，輸入 `ADMIN_SECRET` 與測試收件信箱後按下按鈕。頁面會顯示成功訊息或已去敏的 SMTP 錯誤原因。

部署資料庫 migration 後，可用管理員測試端點單獨測試寄信，不需要再建立付款訂單：

```bash
curl -X POST "https://你的網域/api/admin/email/test" \
  -H "x-admin-secret: 你的ADMIN_SECRET" \
  -H "content-type: application/json" \
  -d '{"to":"你的收件Email"}'
```

成功會回傳 `ok: true`；失敗會把已去除帳號與密碼的 SMTP 原因寫入最新一筆 `EmailLog.errorMessage`。常見原因包括 Gmail 未使用應用程式密碼、`SMTP_FROM` 與登入帳號不一致、Vercel 環境變數只套用到 Preview 而非 Production，或修改環境變數後尚未重新部署。

建議附件控制在 10MB 內，並使用專用寄信服務或 Gmail 應用程式密碼。若檔案較大，建議只提供 Access Page 的下載按鈕，避免郵件被退信。

若資料庫已建立，更新此版本後請執行：

```bash
npm run db:push
```

## 手機互動版 7 天工作本

已購買 `emotional_eating_reset_7d` 的 paid order 可由 `/access/[accessToken]` 進入 `/access/[accessToken]/workbook`。工作本每次欄位變更會在 500ms 後自動儲存至 `WorkbookEntry`，也可手動儲存或標記當天完成。

新增或更新 WorkbookEntry schema 後請執行：

```bash
npm run db:push
```

工作本 API：

- `GET /api/workbook/[accessToken]`
- `POST /api/workbook/[accessToken]/day/[dayNumber]`
- `POST /api/workbook/[accessToken]/day/[dayNumber]/complete`

三個端點都會驗證 accessToken、paid 狀態及主商品 entitlement。PDF 閱讀版與互動填寫版會同時顯示在 Access page；實際 PDF 及 AI 初評連結仍由 `src/content/digitalProducts.ts` 的 placeholder 替換。

交易查詢依 GoMyPay 文件直接傳送 `Order_No`、`CustomerId` 與環境變數中的交易驗證密碼 `Str_Check`；查詢回傳 JSON 的 `pay_result`、`result`、`e_money` 與 `e_orderno` 都會核對後才開通。

## 安全設計

- 付款 form 不含 `CardNo`、`ExpireDate`、`CVV`；所有 log 寫入前也會移除這些欄位。
- callback 使用 timing-safe comparison 驗證 `md5(result + e_orderno + HASH_CUSTOMER_ID + e_money + OrderID + STR_CHECK)`。
- 金額以整數處理並要求 `e_money` 完全相符。
- fulfillment 使用條件更新，只允許 pending → paid；paid 不會被失敗通知覆寫。
- entitlement 有資料庫唯一鍵，狀態重送不會重複開通；Email 只在首次成功轉態後發送。
- access token 使用 256-bit cryptographic randomness；存取頁只查該訂單的 entitlements。
- 建單、查詢、callback、管理同步都有持久化 rate limit。正式高流量部署可替換為 Redis/WAF。
- Return URL 只記錄與顯示，絕不作為付款開通依據。
- PaymentLog 保存去敏後 payload 與驗證錯誤；不保存卡片敏感欄位。

## Vercel 部署

設定全部 `.env.example` 變數，另加 `ADMIN_SECRET`。`APP_BASE_URL` 必須是正式 HTTPS 網域；Production 與 Preview 建議使用不同資料庫與 GoMyPay 測試/正式憑證。部署後執行 production migration（`prisma migrate deploy`）及 seed。Serverless 場景建議使用支援 connection pooling 的 PostgreSQL。

## 主要檔案

- `src/content/emotionalEatingSalesPage.ts`：完整銷售文案
- `prisma/schema.prisma`、`prisma/seed.ts`：資料模型與商品
- `src/app/sales/emotional-eating`、`checkout`、`payment`、`access`、`thank-you`：漏斗頁面
- `src/app/api/orders`：訂單建立與查詢
- `src/app/api/gomypay/callback`：背景付款通知
- `src/app/api/admin/orders/[orderNo]/sync`：管理員手動對帳
- `src/lib/gomypay.ts`、`fulfillment.ts`、`email.ts`：金流、冪等開通與寄信抽象
