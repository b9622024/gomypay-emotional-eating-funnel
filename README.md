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

## 手動同步付款狀態

管理員可呼叫：

```bash
curl -X POST "https://your-domain.example/api/admin/orders/EE.../sync" \
  -H "x-admin-secret: YOUR_ADMIN_SECRET"
```

此路由呼叫 TestCallOrder 或 CallOrder，只有回傳已付款且金額完全相符時才執行開通；重複同步不會重複建立權限或寄信。`ADMIN_SECRET` 不得放在前端。

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
