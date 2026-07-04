"use client";
import {useState} from "react";
export default function SalesAssetImage({src,alt,label,className=""}:{src:string;alt:string;label:string;className?:string}){const [failed,setFailed]=useState(false);return <div className={`sales-asset ${className} ${failed?"placeholder":""}`}>{!failed?<img src={src} alt={alt} loading="lazy" onError={()=>setFailed(true)}/>:<div><span>IMAGE PLACEHOLDER</span><strong>{label}</strong><small>圖片上傳後會自動顯示</small></div>}</div>}
