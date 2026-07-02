"use client";
import { useEffect,useRef,useState } from "react";
import Link from "next/link";
import { workbookDays,workbookPreparation,type WorkbookField } from "@/content/workbook";

type DayState={data:Record<string,unknown>;isCompleted:boolean;completedAt:string|null};
type SaveState="idle"|"saving"|"saved"|"error";

function FieldControl({field,value,onChange}:{field:WorkbookField;value:unknown;onChange:(value:unknown)=>void}){
  if(field.type==="slider"){
    const current=typeof value==="number"?value:5;
    return <div className="wb-field"><div className="wb-slider-label"><label>{field.label}</label><strong>{current}</strong></div><input className="wb-slider" type="range" min={field.min} max={field.max} value={current} onChange={e=>onChange(Number(e.target.value))}/>{field.help&&<small>{field.help}</small>}<div className="wb-scale"><span>{field.min}</span><span>{field.max}</span></div></div>;
  }
  if(field.type==="radio")return <fieldset className="wb-field"><legend>{field.label}</legend><div className="wb-options">{field.options.map(option=><label className={`wb-option ${value===option?"selected":""}`} key={option}><input type="radio" checked={value===option} onChange={()=>onChange(option)}/><span>{option}</span></label>)}</div>{field.help&&<small>{field.help}</small>}</fieldset>;
  if(field.type==="checkbox"){
    const values=Array.isArray(value)?value as string[]:[];
    return <fieldset className="wb-field"><legend>{field.label}</legend><div className="wb-options">{field.options.map(option=><label className={`wb-option checkbox ${values.includes(option)?"selected":""}`} key={option}><input type="checkbox" checked={values.includes(option)} onChange={e=>onChange(e.target.checked?[...values,option]:values.filter(x=>x!==option))}/><span>{option}</span></label>)}</div>{field.help&&<small>{field.help}</small>}</fieldset>;
  }
  if(field.type==="repeat"){
    const items=Array.isArray(value)?value as Record<string,unknown>[]:[];
    const visible=items.length?items:[{}];
    return <div className="wb-repeat"><label className="wb-repeat-title">{field.label}</label>{visible.map((item,index)=><article className="wb-repeat-card" key={index}><div className="wb-repeat-head"><strong>{field.itemLabel.replace("{n}",String(index+1))}</strong>{visible.length>1&&<button type="button" onClick={()=>onChange(visible.filter((_,i)=>i!==index))}>移除</button>}</div>{field.fields.map(child=><FieldControl key={child.key} field={child} value={item[child.key]} onChange={next=>{const copy=visible.map(x=>({...x}));copy[index][child.key]=next;onChange(copy)}}/>)}</article>)}{visible.length<field.max&&<button className="wb-add-event" type="button" onClick={()=>onChange([...visible,{}])}>＋ 新增第 {visible.length+1} 次嘴饞事件</button>}</div>;
  }
  const common={value:typeof value==="string"||typeof value==="number"?value:"",placeholder:field.placeholder??"",onChange:(e:React.ChangeEvent<HTMLInputElement|HTMLTextAreaElement>)=>onChange(field.type==="number"?Number(e.target.value):e.target.value)};
  if(field.type==="textarea")return <label className="wb-field"><span>{field.label}</span><textarea rows={4} {...common}/>{field.help&&<small>{field.help}</small>}</label>;
  return <label className="wb-field"><span>{field.label}</span><input type={field.type==="datetime"?"datetime-local":field.type} {...common}/>{field.help&&<small>{field.help}</small>}</label>;
}

function collectNumbers(value:unknown,key:string,result:number[]=[]):number[]{
  if(Array.isArray(value)){value.forEach(x=>collectNumbers(x,key,result));return result}
  if(value&&typeof value==="object")Object.entries(value as Record<string,unknown>).forEach(([k,v])=>{if(k===key&&typeof v==="number")result.push(v);else collectNumbers(v,key,result)});
  return result;
}
function collectStrings(value:unknown,keys:string[],result:string[]=[]):string[]{
  if(Array.isArray(value)){value.forEach(x=>typeof x==="string"?result.push(x):collectStrings(x,keys,result));return result}
  if(value&&typeof value==="object")Object.entries(value as Record<string,unknown>).forEach(([k,v])=>{if(keys.includes(k)){if(typeof v==="string")result.push(v);if(Array.isArray(v))v.forEach(x=>typeof x==="string"&&result.push(x))}else collectStrings(v,keys,result)});
  return result;
}
const average=(values:number[])=>values.length?(values.reduce((a,b)=>a+b,0)/values.length).toFixed(1):"—";

function SummaryReport({days,ownsAiAssessment,accessToken,preview}:{days:Record<number,DayState>;ownsAiAssessment:boolean;accessToken:string;preview:boolean}){
  const [buying,setBuying]=useState(false),[purchaseError,setPurchaseError]=useState("");
  const all=Object.values(days).map(x=>x.data);
  const hunger=collectNumbers(all,"hungerScore"),stress=collectNumbers(all,"stressScore"),fatigue=collectNumbers(all,"fatigueScore");
  const triggers=collectStrings(all,["emotion","mainTrigger","mainEmotionTrigger"]);
  const counts=triggers.reduce<Record<string,number>>((map,x)=>(map[x]=(map[x]??0)+1,map),{});
  const commonTrigger=Object.entries(counts).sort((a,b)=>b[1]-a[1])[0]?.[0]??"資料不足";
  const day3=days[3]?.data??{},day5=days[5]?.data??{};
  const sugary=Boolean(day3.drinkName)||day5.afternoonSugarDrink==="有";
  const nutrition=Array.isArray(day5.gapSummary)&&day5.gapSummary.length>0||day5.ateTooLittle==="有";
  const avgStress=stress.length?Number(average(stress)):0,avgFatigue=fatigue.length?Number(average(fatigue)):0;
  const patterns=[avgStress>=6&&"壓力釋放型",avgFatigue>=6&&"疲憊失控型",sugary&&"含糖飲料依賴型",nutrition&&"營養不足型",triggers.includes("無聊")&&"無聊習慣型"].filter(Boolean) as string[];
  async function startAssessment(){if(preview)return;setBuying(true);setPurchaseError("");try{const response=await fetch("/api/orders/ai-assessment",{method:"POST",headers:{"content-type":"application/json"},body:JSON.stringify({accessToken})});const result=await response.json();if(!response.ok)throw new Error(result.error||"目前無法建立訂單");location.href=`/payment/redirect/${result.orderNo}`}catch(error){setPurchaseError(error instanceof Error?error.message:"目前無法建立訂單");setBuying(false)}}
  return <section className="wb-report"><span className="wb-kicker">7 DAY SUMMARY</span><h2>7 天總結報告</h2><p className="wb-disclaimer">以下是依照你的填寫內容整理的自我觀察結果，不是醫療或心理診斷。</p><div className="wb-stats"><article><span>平均飢餓</span><strong>{average(hunger)}</strong><small>/ 10</small></article><article><span>平均壓力</span><strong>{average(stress)}</strong><small>/ 10</small></article><article><span>平均疲憊</span><strong>{average(fatigue)}</strong><small>/ 10</small></article></div><div className="wb-insights"><article><span>最常出現的觸發點</span><strong>{commonTrigger}</strong></article><article><span>含糖飲料是否常出現</span><strong>{sugary?"有出現相關紀錄":"目前不明顯"}</strong></article><article><span>營養缺口是否常出現</span><strong>{nutrition?"有出現相關紀錄":"目前不明顯"}</strong></article></div><div className="wb-pattern"><span>初步模式提示</span><div>{patterns.length?patterns.map(x=><b key={x}>{x}</b>):<b>目前資料不足，持續觀察就好</b>}</div></div><div className="wb-report-cta"><h3>想知道自己更深層的減脂卡關原因？</h3><p>透過 5 分鐘、49 題的測驗填寫，能夠知道現在的脈輪能量狀態以及個人天賦優勢，會有專人一對一解析測驗結果找出問題，並且提供專屬對策方案。</p>{ownsAiAssessment?<a className="btn" href={`/ai-energy-assessment?accessToken=${encodeURIComponent(accessToken)}`}><span>我要領取 AI 能量減脂測驗</span><span>→</span></a>:<button className="btn" type="button" disabled={buying||preview} onClick={startAssessment}><span>{preview?"預覽模式不建立訂單":buying?"建立 NT$100 訂單中…":"我要領取 AI 能量減脂測驗"}</span><span>→</span></button>}{!ownsAiAssessment&&!preview&&<small className="wb-assessment-price">未於結帳時加購者，單獨購買價為 NT$100</small>}{purchaseError&&<p className="wb-purchase-error">{purchaseError}</p>}</div></section>;
}

export default function WorkbookClient({accessToken,preview=false,ownsAiAssessment=false}:{accessToken:string;preview?:boolean;ownsAiAssessment?:boolean}){
  const [days,setDays]=useState<Record<number,DayState>>({});
  const [selectedDay,setSelectedDay]=useState<number|null>(null);
  const [loading,setLoading]=useState(true);
  const [saveState,setSaveState]=useState<Record<number,SaveState>>({});
  const timers=useRef<Record<number,ReturnType<typeof setTimeout>>>({});
  useEffect(()=>{if(preview){const sample:Record<number,DayState>={};for(let day=1;day<=7;day++)sample[day]={data:day===1?{hungerScore:4,stressScore:7,fatigueScore:6,wouldEatNormalMeal:"不確定",needType:"放鬆"}:{},isCompleted:day===1,completedAt:day===1?new Date().toISOString():null};setDays(sample);setLoading(false);return}fetch(`/api/workbook/${accessToken}`).then(r=>r.ok?r.json():Promise.reject()).then(result=>{const mapped:Record<number,DayState>={};result.days.forEach((day:DayState&{dayNumber:number})=>mapped[day.dayNumber]={data:day.data,isCompleted:day.isCompleted,completedAt:day.completedAt});setDays(mapped)}).finally(()=>setLoading(false))},[accessToken,preview]);
  useEffect(()=>{if(typeof window!=="undefined"){const requested=Number(new URLSearchParams(window.location.search).get("day"));if(Number.isInteger(requested)&&requested>=1&&requested<=7)setSelectedDay(requested)}},[]);
  const completed=Object.values(days).filter(x=>x.isCompleted).length;
  const progress=Math.round(completed/7*100);
  async function saveDay(day:number,data:Record<string,unknown>){setSaveState(s=>({...s,[day]:"saving"}));if(preview){setTimeout(()=>setSaveState(s=>({...s,[day]:"saved"})),180);return}try{const r=await fetch(`/api/workbook/${accessToken}/day/${day}`,{method:"POST",headers:{"content-type":"application/json"},body:JSON.stringify({data})});if(!r.ok)throw new Error();setSaveState(s=>({...s,[day]:"saved"}))}catch{setSaveState(s=>({...s,[day]:"error"}))}}
  function updateData(day:number,key:string,value:unknown){const next={...(days[day]?.data??{}),[key]:value};setDays(current=>({...current,[day]:{data:next,isCompleted:current[day]?.isCompleted??false,completedAt:current[day]?.completedAt??null}}));setSaveState(s=>({...s,[day]:"saving"}));clearTimeout(timers.current[day]);timers.current[day]=setTimeout(()=>saveDay(day,next),500)}
  async function completeDay(day:number){clearTimeout(timers.current[day]);const data=days[day]?.data??{};setSaveState(s=>({...s,[day]:"saving"}));if(preview){setDays(current=>({...current,[day]:{...current[day],data,isCompleted:true,completedAt:new Date().toISOString()}}));setSaveState(s=>({...s,[day]:"saved"}));setSelectedDay(day<7?day+1:null);return}const r=await fetch(`/api/workbook/${accessToken}/day/${day}/complete`,{method:"POST",headers:{"content-type":"application/json"},body:JSON.stringify({data})});if(r.ok){const result=await r.json();setDays(current=>({...current,[day]:{...current[day],data,isCompleted:true,completedAt:result.completedAt}}));setSaveState(s=>({...s,[day]:"saved"}));setSelectedDay(day<7?day+1:null)}else setSaveState(s=>({...s,[day]:"error"}))}
  if(loading)return <div className="wb-loading">正在準備你的工作本…</div>;
  const day=selectedDay?workbookDays[selectedDay-1]:null;
  return <div className="workbook-app"><header className="wb-header"><div><Link href={preview?"#":`/access/${accessToken}`}>← 回到工具包</Link><span>可樂吉健康研究所</span></div><div className="wb-progress-copy"><strong>{completed} / 7 天完成</strong><span>{progress}%</span></div><div className="wb-progress"><i style={{width:`${progress}%`}}/></div></header>{!day?<main className="wb-overview"><div className="wb-intro"><span className="wb-kicker">MOBILE WORKBOOK</span><h1>手機互動版<br/>7 天嘴饞止損工作本</h1><p>每天花 5–10 分鐘，直接在手機上打勾、評分與寫下觀察。內容會自動儲存到你的專屬帳戶。</p></div><section className="wb-onboarding"><span className="wb-kicker">BEFORE YOU START</span><h2>{workbookPreparation.reminder.title}</h2><strong>{workbookPreparation.reminder.lead}</strong><p>{workbookPreparation.reminder.body}</p><div className="wb-howto">{workbookPreparation.steps.map((step,index)=><article key={step}><span>{index+1}</span><p>{step}</p></article>)}</div></section><section className="wb-day-grid">{workbookDays.map(item=>{const state=days[item.day];return <button type="button" className={`wb-day-card ${state?.isCompleted?"completed":""}`} key={item.day} onClick={()=>setSelectedDay(item.day)}><span>DAY {item.day}</span><strong>{item.title}</strong><small>{state?.isCompleted?"✓ 已完成":"開始填寫 →"}</small></button>})}</section>{days[7]?.isCompleted&&<SummaryReport days={days} ownsAiAssessment={ownsAiAssessment} accessToken={accessToken} preview={preview}/>}</main>:<main className="wb-day-page"><button type="button" className="wb-back" onClick={()=>setSelectedDay(null)}>← 回到 7 天總覽</button><div className="wb-day-title"><span>DAY {day.day}</span><h1>{day.title}</h1><p>{day.intro}</p><div className={`wb-save-state ${saveState[day.day]??"idle"}`}>{saveState[day.day]==="saving"?"儲存中…":saveState[day.day]==="saved"?"✓ 已儲存":saveState[day.day]==="error"?"儲存失敗，請重試":"填寫後會自動儲存"}</div></div>{day.sections.map(section=><section className="wb-form-section" key={section.title}><div className="wb-form-heading"><h2>{section.title}</h2>{section.description&&<p>{section.description}</p>}</div>{section.tips&&<div className="wb-tip-grid">{section.tips.map(tip=><article key={`${tip.label}-${tip.text}`}><strong>{tip.label}</strong><span>{tip.text}</span></article>)}</div>}{section.fields.map(field=><FieldControl key={field.key} field={field} value={days[day.day]?.data[field.key]} onChange={value=>updateData(day.day,field.key,value)}/>)}</section>)}<div className="wb-day-actions"><button type="button" className="wb-secondary" disabled={day.day===1} onClick={()=>setSelectedDay(day.day-1)}>← 上一天</button><button type="button" className="wb-save-button" onClick={()=>saveDay(day.day,days[day.day]?.data??{})}>儲存今天紀錄</button><button type="button" className="wb-complete" onClick={()=>completeDay(day.day)}>{days[day.day]?.isCompleted?"✓ 已完成":"完成 Day "+day.day}</button><button type="button" className="wb-secondary" disabled={day.day===7} onClick={()=>setSelectedDay(day.day+1)}>下一天 →</button></div></main>}</div>;
}
