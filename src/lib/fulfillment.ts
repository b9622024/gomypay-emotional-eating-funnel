import { randomBytes } from "crypto";
import { prisma } from "./db";
import { emailService } from "./email";
import { proAddonByCode } from "../content/proAddons";

const createAccessToken=()=>randomBytes(32).toString("base64url");

export function fulfillmentEmail(input:{name:string;accessUrl:string;productCodes?:string[]}){
  const aiOnly=input.productCodes?.length===1&&input.productCodes[0]==="ai_energy_assessment";
  if(aiOnly)return {
    subject:"你的 AI 能量減脂初評已準備好了",
    body:`${input.name}，你好：

感謝你購買「AI 能量減脂初評」！

請由以下專屬連結查看已購買內容：
${input.accessUrl}

接著請透過 LINE 官方帳號與我們聯繫，我們會提供 49 題測驗，並安排專人一對一解析測驗結果：
https://lin.ee/UKTsrwq

可樂吉健康研究所｜崇銘老師`
  };
  const proAddon=input.productCodes?.length===1?proAddonByCode(input.productCodes[0]):undefined;
  if(proAddon)return {
    subject:`感謝你購買加購的《${proAddon.title}》`,
    body:`${input.name}，你好：

感謝你購買加購的《${proAddon.title}》！付款已完成，進階道具權限已經開通。

請由以下連結回到你的《7 天嘴饞破關計畫》工具包主頁：
${input.accessUrl}

在「任務道具箱」中找到《${proAddon.title}》，即可開始使用。

若需要協助，歡迎加入 LINE 官方帳號：
https://lin.ee/UKTsrwq

可樂吉健康研究所｜崇銘老師`
  };
  return {
    subject:"你的《下班後嘴饞止損包》已準備好了",
    body:`${input.name}，你好：

感謝你購買《下班後嘴饞止損包》！你的數位產品已經準備好了。

請由以下專屬連結開啟工具包：
${input.accessUrl}

建議使用順序：
1. 先完成「情緒性進食 6 型測驗」
2. 開始「7 天嘴饞破關計畫」，每天完成一個小任務
3. 搭配工作本與追蹤表，觀察自己的嘴饞觸發模式

若需要協助，歡迎透過以下官方社群聯絡我們：
LINE 官方帳號：https://lin.ee/UKTsrwq
Instagram：https://www.instagram.com/meko.hsu
Facebook 粉絲專頁：https://www.facebook.com/couragewellnessinstitute

可樂吉健康研究所｜崇銘老師`
  };
}

export function ownerOrderNotification(input:{orderNo:string;name:string;email:string;amount:number;items:{name:string;price:number;quantity:number}[]}){
  return {
    subject:`新訂單付款成功｜${input.orderNo}｜NT$${input.amount}`,
    body:`新訂單已由 GoMyPay 驗證付款成功。

訂單編號：${input.orderNo}
顧客姓名：${input.name}
顧客 Email：${input.email}
付款金額：NT$${input.amount}
購買內容：
${input.items.map(item=>`- ${item.name} × ${item.quantity}｜NT$${item.price}`).join("\n")}

付款時間：${new Date().toLocaleString("zh-TW",{timeZone:"Asia/Taipei"})}

此信由網站付款成功 callback 自動寄出。`
  };
}

export async function markPaid(orderNo:string,meta:{gomypayOrderId?:string;avcode?:string;cardLastNum?:string;payload:Record<string,string>;source:"callback"|"query"|"system"|"return"}){
  const canonicalToken=createAccessToken();
  const order=await prisma.order.findUnique({where:{orderNo},include:{items:true,customer:true}});
  if(!order)return null;
  if(order.status!=="pending"&&order.status!=="paid")return null;

  const changed=order.status==="pending"
    ? await prisma.order.updateMany({
      where:{id:order.id,status:"pending"},
      data:{status:"paid",paidAt:new Date(),gomypayOrderId:meta.gomypayOrderId,avcode:meta.avcode,cardLastNum:meta.cardLastNum,rawCallbackPayload:meta.source==="callback"?meta.payload:undefined}
    })
    : {count:0};
  const fresh=changed.count===1;

  // 避免在 Vercel / 雲端資料庫連線池環境使用互動式 transaction。
  // 付款狀態用 updateMany(status: pending) 保持原子性，權限用 upsert 保持可重複執行。
  for(const [index,item] of order.items.entries()){
    await prisma.entitlement.upsert({
      where:{orderId_productCode:{orderId:order.id,productCode:item.productCode}},
      update:{},
      create:{orderId:order.id,customerId:order.customerId,productCode:item.productCode,accessToken:index===0?canonicalToken:null,downloadUrl:"#"}
    });
  }
  const firstItem=order.items[0];
  if(firstItem){
    await prisma.entitlement.updateMany({
      where:{orderId:order.id,productCode:firstItem.productCode,accessToken:null},
      data:{accessToken:canonicalToken}
    });
  }
  const transitioned={order,fresh};

  // 只有成功取得 pending -> paid 的 callback 會進入此區，因此不會重複寄信。
  if(transitioned?.fresh){
    const productCodes=transitioned.order.items.map(item=>item.productCode);
    const proOnly=productCodes.length===1&&Boolean(proAddonByCode(productCodes[0]));
    const access=proOnly
      ? await prisma.entitlement.findFirst({where:{customerId:transitioned.order.customerId,productCode:"emotional_eating_reset_7d",accessToken:{not:null},order:{status:"paid"}},orderBy:{createdAt:"asc"},select:{accessToken:true}})
      : await prisma.entitlement.findFirst({where:{orderId:transitioned.order.id,accessToken:{not:null}},select:{accessToken:true}});
    if(access?.accessToken){
      const baseUrl=(process.env.APP_BASE_URL??"").replace(/\/$/,"");
      const mail=fulfillmentEmail({name:transitioned.order.customer.name,accessUrl:`${baseUrl}/access/${access.accessToken}`,productCodes});
      try{
        const pdfUrl=productCodes.includes("emotional_eating_reset_7d")?process.env.DIGITAL_PRODUCT_PDF_URL:undefined;
        await emailService.send({to:transitioned.order.customer.email,...mail,attachments:pdfUrl?[{filename:"下班後嘴饞止損包-閱讀版.pdf",path:pdfUrl}]:undefined});
      }catch{
        // EmailService 已留下 failed EmailLog；寄信失敗不回滾付款與產品權限。
      }
      const notificationEmail=process.env.ORDER_NOTIFICATION_EMAIL||process.env.SMTP_USER;
      if(notificationEmail){
        try{
          await emailService.send({to:notificationEmail,...ownerOrderNotification({orderNo:transitioned.order.orderNo,name:transitioned.order.customer.name,email:transitioned.order.customer.email,amount:transitioned.order.amount,items:transitioned.order.items.map(item=>({name:item.name,price:item.price,quantity:item.quantity}))})});
        }catch{
          // 管理者通知失敗只寫入 EmailLog，不影響訂單與客戶交付。
        }
      }
    }
  }
  return transitioned;
}
