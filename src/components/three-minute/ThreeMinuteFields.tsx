"use client";

export function SliderField({label,value,onChange}:{label:string;value:number;onChange:(value:number)=>void}){return <label className="tm-slider"><span>{label}<strong>{value}</strong></span><input type="range" min="0" max="10" value={value} onChange={event=>onChange(Number(event.target.value))}/><small><i>0</i><i>10</i></small></label>}

export function LargeCheckboxGroup({options,value,onChange}:{options:readonly string[];value:string[];onChange:(value:string[])=>void}){return <div className="tm-choice-grid">{options.map(option=><label className={value.includes(option)?"selected":""} key={option}><input type="checkbox" checked={value.includes(option)} onChange={event=>onChange(event.target.checked?[...value,option]:value.filter(item=>item!==option))}/><span>{option}</span></label>)}</div>}

export function LargeRadioGroup({options,value,onChange}:{options:readonly string[];value?:string;onChange:(value:string)=>void}){return <div className="tm-choice-grid radio">{options.map(option=><label className={value===option?"selected":""} key={option}><input type="radio" checked={value===option} onChange={()=>onChange(option)}/><span>{option}</span></label>)}</div>}
