"use client";
import { useRouter } from "next/navigation";
import { salesPage as c } from "@/content/emotionalEatingSalesPage";

export default function SalesLeadForm(){
  const router=useRouter();
  function submit(e:React.FormEvent<HTMLFormElement>){
    e.preventDefault();
    const data=Object.fromEntries(new FormData(e.currentTarget));
    sessionStorage.setItem("emotionalEatingLead",JSON.stringify(data));
    router.push("/checkout");
  }
  return <form className="card sales-lead-form" onSubmit={submit}>
    <h2>{c.leadForm.title}</h2>
    <div className="lead-fields">
      <label>{c.leadForm.fields.name}<input name="name" required pattern="[A-Za-z\u4e00-\u9fff ·]{2,50}" autoComplete="name" /></label>
      <label>{c.leadForm.fields.email}<input name="email" required type="email" autoComplete="email" /></label>
      <label>{c.leadForm.fields.phone}<input name="phone" required inputMode="numeric" autoComplete="tel" /></label>
      <label>{c.leadForm.fields.lineId}<input name="lineId" autoComplete="off" /></label>
    </div>
    <button className="btn" type="submit">{c.leadForm.button}</button>
    <p className="muted lead-note">{c.leadForm.note}</p>
  </form>;
}
