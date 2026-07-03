"use client";
import {useEffect,useState} from "react";

export default function CharacterImageLightboxHost(){
 const [image,setImage]=useState<{src:string;alt:string}|null>(null);
 useEffect(()=>{const click=(event:MouseEvent)=>{const target=event.target as HTMLElement|null,img=target?.closest(".character-result-image,.bt-home-character img") as HTMLImageElement|null;if(img){event.preventDefault();setImage({src:img.currentSrc||img.src,alt:img.alt})}};document.addEventListener("click",click);return()=>document.removeEventListener("click",click)},[]);
 useEffect(()=>{if(!image)return;const key=(event:KeyboardEvent)=>event.key==="Escape"&&setImage(null);document.addEventListener("keydown",key);return()=>document.removeEventListener("keydown",key)},[image]);
 if(!image)return null;
 return <div className="character-lightbox" role="dialog" aria-modal="true" aria-label="放大查看角色圖片" onClick={()=>setImage(null)}><button type="button" aria-label="關閉圖片">×</button><img src={image.src} alt={image.alt} onClick={event=>event.stopPropagation()}/><p>點擊背景或按 Esc 關閉</p></div>;
}
