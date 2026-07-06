"use client";
import {usePathname,useRouter} from "next/navigation";
import {useEffect,useState} from "react";

export default function NavigationFeedback(){
  const pathname=usePathname();
  const router=useRouter();
  const [busy,setBusy]=useState(false);
  useEffect(()=>{setBusy(false)},[pathname]);
  useEffect(()=>{
    let timer:ReturnType<typeof setTimeout>|undefined;
    const internalUrl=(target:EventTarget|null)=>{
      const element=target as Element|null;
      const anchor=element?.closest("a[href]") as HTMLAnchorElement|null;
      if(!anchor||anchor.target==="_blank"||anchor.hasAttribute("download"))return null;
      const url=new URL(anchor.href,location.href);
      return url.origin===location.origin?url:null;
    };
    const onIntent=(event:Event)=>{
      const url=internalUrl(event.target);
      if(url&&url.pathname!==location.pathname)router.prefetch(`${url.pathname}${url.search}`);
    };
    const onClick=(event:MouseEvent)=>{
      if(event.defaultPrevented||event.button!==0||event.metaKey||event.ctrlKey||event.shiftKey||event.altKey)return;
      const url=internalUrl(event.target);
      if(!url||url.hash&&url.pathname===location.pathname&&url.search===location.search)return;
      if(url.pathname===location.pathname&&url.search===location.search)return;
      setBusy(true);
      clearTimeout(timer);
      timer=setTimeout(()=>setBusy(false),8000);
    };
    document.addEventListener("pointerover",onIntent,true);
    document.addEventListener("focusin",onIntent,true);
    document.addEventListener("touchstart",onIntent,{capture:true,passive:true});
    document.addEventListener("click",onClick,true);
    return()=>{document.removeEventListener("pointerover",onIntent,true);document.removeEventListener("focusin",onIntent,true);document.removeEventListener("touchstart",onIntent,true);document.removeEventListener("click",onClick,true);clearTimeout(timer)};
  },[router]);
  if(!busy)return null;
  return <div className="navigation-feedback" role="status" aria-live="polite"><i/><span><b>正在前往下一頁</b><small>請稍候一下…</small></span></div>;
}
