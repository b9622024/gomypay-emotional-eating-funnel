"use client";
import { useEffect, useState } from "react";
import type { BadgeConfig } from "@/content/badgeConfig";
import UnlockBadgeModal from "./UnlockBadgeModal";
export default function BadgeUnlockHost(){const [reward,setReward]=useState<{badge:BadgeConfig;actionPoints:number;continueHref?:string}|null>(null);useEffect(()=>{const listener=(event:Event)=>setReward((event as CustomEvent).detail);window.addEventListener("badge-unlocked",listener);return()=>window.removeEventListener("badge-unlocked",listener)},[]);return <UnlockBadgeModal badge={reward?.badge??null} actionPoints={reward?.actionPoints??0} onContinue={()=>{const href=reward?.continueHref;setReward(null);if(href)window.location.href=href}}/>}
