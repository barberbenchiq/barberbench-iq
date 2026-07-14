"use client";

import { useEffect, useMemo, useState } from "react";
import { BusinessInputs, Service, calculate, defaultInputs, defaultServices } from "../lib/model";

type Tab = "dashboard" | "sales" | "clients" | "expenses" | "services" | "coach";
type Sale = { id:string; date:string; client:string; service:string; amount:number; payment:"EFTPOS"|"Cash"|"Online"; rebooked:boolean };
type Client = { id:string; name:string; phone:string; lastVisit:string; visits:number; spend:number; rebooked:boolean };
type Expense = { id:string; date:string; category:string; description:string; amount:number };
type Store = { inputs:BusinessInputs; services:Service[]; sales:Sale[]; clients:Client[]; expenses:Expense[] };

const money = new Intl.NumberFormat("en-NZ", { style:"currency", currency:"NZD", maximumFractionDigits:0 });
const today = () => new Date().toISOString().slice(0,10);
const uid = () => Math.random().toString(36).slice(2,10);

const demoSales: Sale[] = [
  {id:"s1",date:today(),client:"Jayden R.",service:"Skin Fade",amount:60,payment:"EFTPOS",rebooked:true},
  {id:"s2",date:today(),client:"Marcus T.",service:"Cut + Beard",amount:72,payment:"EFTPOS",rebooked:true},
  {id:"s3",date:today(),client:"Liam P.",service:"Standard Cut",amount:50,payment:"Cash",rebooked:false},
  {id:"s4",date:new Date(Date.now()-86400000).toISOString().slice(0,10),client:"Noah K.",service:"Skin Fade",amount:60,payment:"Online",rebooked:true},
];
const demoClients: Client[] = [
  {id:"c1",name:"Jayden R.",phone:"021 555 0142",lastVisit:today(),visits:8,spend:480,rebooked:true},
  {id:"c2",name:"Marcus T.",phone:"022 410 7721",lastVisit:today(),visits:5,spend:360,rebooked:true},
  {id:"c3",name:"Liam P.",phone:"027 822 1139",lastVisit:today(),visits:2,spend:100,rebooked:false},
];
const demoExpenses: Expense[] = [
  {id:"e1",date:today(),category:"Supplies",description:"Blades and neck strips",amount:86},
  {id:"e2",date:new Date(Date.now()-172800000).toISOString().slice(0,10),category:"Rent",description:"Weekly chair rent",amount:350},
];

export default function Page(){
  const [tab,setTab]=useState<Tab>("dashboard");
  const [store,setStore]=useState<Store>({inputs:defaultInputs,services:defaultServices,sales:demoSales,clients:demoClients,expenses:demoExpenses});
  const [ready,setReady]=useState(false);
  const [menu,setMenu]=useState(false);

  useEffect(()=>{ const raw=localStorage.getItem("barberbench-iq-v03"); if(raw){try{setStore(JSON.parse(raw))}catch{}} setReady(true); },[]);
  useEffect(()=>{if(ready)localStorage.setItem("barberbench-iq-v03",JSON.stringify(store))},[store,ready]);

  const analytics=useMemo(()=>{
    const month=today().slice(0,7);
    const monthSales=store.sales.filter(x=>x.date.startsWith(month));
    const monthExpenses=store.expenses.filter(x=>x.date.startsWith(month));
    const revenue=monthSales.reduce((s,x)=>s+x.amount,0);
    const expenses=monthExpenses.reduce((s,x)=>s+x.amount,0);
    const profit=revenue-expenses;
    const avg=monthSales.length?revenue/monthSales.length:0;
    const rebook=monthSales.length?monthSales.filter(x=>x.rebooked).length/monthSales.length:0;
    const calc=calculate({...store.inputs,totalClients:monthSales.length||store.inputs.totalClients,rebookedClients:monthSales.filter(x=>x.rebooked).length||store.inputs.rebookedClients,serviceRevenue:revenue||store.inputs.serviceRevenue},store.services);
    return {revenue,expenses,profit,avg,rebook,calc,monthSales};
  },[store]);

  const go=(t:Tab)=>{setTab(t);setMenu(false)};
  if(!ready)return <main className="splash"><span className="logo">B</span><h1>BarberBench IQ</h1></main>;
  return <main className="app">
    <aside className={menu?"sidebar open":"sidebar"}>
      <button className="brand" onClick={()=>go("dashboard")}><span className="logo">B</span><span>BarberBench <b>IQ</b></span></button>
      <div className="version">FOUNDER BETA 0.3</div>
      <nav>{(["dashboard","sales","clients","expenses","services","coach"] as Tab[]).map(t=><button key={t} className={tab===t?"active":""} onClick={()=>go(t)}><span>{icons[t]}</span>{labels[t]}</button>)}</nav>
      <div className="side-foot"><small>THIS MONTH</small><strong>{money.format(analytics.profit)}</strong><span>estimated profit</span></div>
    </aside>
    {menu&&<button className="scrim" aria-label="Close menu" onClick={()=>setMenu(false)}/>} 
    <section className="workspace">
      <header className="mobile-head"><button onClick={()=>setMenu(true)}>☰</button><div><span className="logo small">B</span>BarberBench <b>IQ</b></div><span className="status-dot"/></header>
      <div className="page">
        {tab==="dashboard"&&<Dashboard store={store} analytics={analytics} go={go}/>} 
        {tab==="sales"&&<Sales sales={store.sales} services={store.services} setSales={(sales)=>setStore({...store,sales})}/>} 
        {tab==="clients"&&<Clients clients={store.clients} setClients={(clients)=>setStore({...store,clients})}/>} 
        {tab==="expenses"&&<Expenses expenses={store.expenses} setExpenses={(expenses)=>setStore({...store,expenses})}/>} 
        {tab==="services"&&<Services services={store.services} setServices={(services)=>setStore({...store,services})} result={analytics.calc}/>} 
        {tab==="coach"&&<Coach analytics={analytics} store={store} setStore={setStore}/>} 
      </div>
      <nav className="bottom-nav">{(["dashboard","sales","clients","expenses","coach"] as Tab[]).map(t=><button key={t} className={tab===t?"active":""} onClick={()=>go(t)}><span>{icons[t]}</span>{labels[t]}</button>)}</nav>
    </section>
  </main>
}

const labels:Record<Tab,string>={dashboard:"Dashboard",sales:"Sales",clients:"Clients",expenses:"Expenses",services:"Services",coach:"IQ Coach"};
const icons:Record<Tab,string>={dashboard:"▦",sales:"$",clients:"♙",expenses:"↘",services:"✂",coach:"✦"};

function Heading({eyebrow,title,copy,action}:{eyebrow:string,title:string,copy?:string,action?:React.ReactNode}){return <div className="heading"><div><small>{eyebrow}</small><h1>{title}</h1>{copy&&<p>{copy}</p>}</div>{action}</div>}
function Card({children,className=""}:{children:React.ReactNode,className?:string}){return <div className={`card ${className}`}>{children}</div>}
function Empty({text}:{text:string}){return <div className="empty">{text}</div>}

function Dashboard({store,analytics,go}:{store:Store;analytics:any;go:(t:Tab)=>void}){
 const score=analytics.calc.healthScore; const max=Math.max(...[analytics.revenue,analytics.expenses,1]);
 return <>
  <Heading eyebrow="BUSINESS OVERVIEW" title={`Kia ora${store.inputs.name?`, ${store.inputs.name}`:""}.`} copy="Here’s the clearest view of your business right now." action={<button className="primary" onClick={()=>go("sales")}>+ Add sale</button>}/>
  <div className="metric-grid">
   <Metric label="Revenue this month" value={money.format(analytics.revenue)} note={`${analytics.monthSales.length} completed services`} tone="good"/>
   <Metric label="Expenses this month" value={money.format(analytics.expenses)} note="Logged business costs" tone="warn"/>
   <Metric label="Estimated profit" value={money.format(analytics.profit)} note="Revenue minus expenses" tone={analytics.profit>=0?"good":"bad"}/>
   <Metric label="Average ticket" value={money.format(analytics.avg)} note={`${Math.round(analytics.rebook*100)}% rebooked`} tone="neutral"/>
  </div>
  <div className="dashboard-grid">
   <Card className="chart-card"><div className="card-head"><div><small>MONTHLY PULSE</small><h2>Money in vs money out</h2></div><span className="pill">Live</span></div>
    <div className="bar-chart"><Bar label="Revenue" value={analytics.revenue} max={max}/><Bar label="Expenses" value={analytics.expenses} max={max}/><Bar label="Profit" value={Math.max(analytics.profit,0)} max={max}/></div>
   </Card>
   <Card className="score"><div className="score-ring" style={{"--score":`${score*3.6}deg`} as React.CSSProperties}><div><strong>{score}</strong><span>/100</span></div></div><h2>Business health</h2><p>{score>=80?"Strong foundations. Protect your consistency.":score>=60?"Healthy base with clear room to improve.":"Focus on pricing, rebooking and cost control."}</p><button className="secondary" onClick={()=>go("coach")}>View IQ actions</button></Card>
  </div>
  <Card><div className="card-head"><div><small>RECENT ACTIVITY</small><h2>Latest sales</h2></div><button className="text-button" onClick={()=>go("sales")}>View all →</button></div><div className="table">{store.sales.slice(0,5).map(s=><div className="row" key={s.id}><div className="avatar">{s.client[0]}</div><div><strong>{s.client}</strong><span>{s.service} · {s.date}</span></div><b>{money.format(s.amount)}</b><em className={s.rebooked?"good-tag":"muted-tag"}>{s.rebooked?"Rebooked":"Not booked"}</em></div>)}</div></Card>
 </>
}
function Metric({label,value,note,tone}:{label:string,value:string,note:string,tone:string}){return <Card className={`metric ${tone}`}><small>{label}</small><strong>{value}</strong><span>{note}</span></Card>}
function Bar({label,value,max}:{label:string,value:number,max:number}){return <div className="bar-row"><span>{label}</span><div><i style={{width:`${Math.max(2,value/max*100)}%`}}/></div><strong>{money.format(value)}</strong></div>}

function Sales({sales,services,setSales}:{sales:Sale[];services:Service[];setSales:(x:Sale[])=>void}){
 const [open,setOpen]=useState(false); const [form,setForm]=useState({date:today(),client:"",service:services[0]?.name||"Standard Cut",amount:services[0]?.price||50,payment:"EFTPOS" as Sale["payment"],rebooked:true});
 const submit=(e:React.FormEvent)=>{e.preventDefault();if(!form.client.trim())return;setSales([{id:uid(),...form},...sales]);setForm({...form,client:""});setOpen(false)};
 return <><Heading eyebrow="DAILY TAKINGS" title="Sales" copy="Log every service so your dashboard reflects the real business." action={<button className="primary" onClick={()=>setOpen(!open)}>+ Add sale</button>}/>
 {open&&<Card><form className="form" onSubmit={submit}><Input label="Date" type="date" value={form.date} onChange={v=>setForm({...form,date:v})}/><Input label="Client name" value={form.client} onChange={v=>setForm({...form,client:v})}/><label><span>Service</span><select value={form.service} onChange={e=>{const s=services.find(x=>x.name===e.target.value);setForm({...form,service:e.target.value,amount:s?.price||form.amount})}}>{services.map(s=><option key={s.id}>{s.name}</option>)}</select></label><Input label="Amount" type="number" value={form.amount} onChange={v=>setForm({...form,amount:Number(v)})}/><label><span>Payment</span><select value={form.payment} onChange={e=>setForm({...form,payment:e.target.value as Sale["payment"]})}><option>EFTPOS</option><option>Cash</option><option>Online</option></select></label><label className="check"><input type="checkbox" checked={form.rebooked} onChange={e=>setForm({...form,rebooked:e.target.checked})}/> Client rebooked</label><button className="primary" type="submit">Save sale</button></form></Card>}
 <Card><div className="table">{sales.length?sales.map(s=><div className="row sale-row" key={s.id}><div className="date-box"><b>{new Date(s.date+"T12:00:00").getDate()}</b><span>{new Date(s.date+"T12:00:00").toLocaleString("en-NZ",{month:"short"})}</span></div><div><strong>{s.client}</strong><span>{s.service} · {s.payment}</span></div><b>{money.format(s.amount)}</b><button className="delete" onClick={()=>setSales(sales.filter(x=>x.id!==s.id))}>×</button></div>):<Empty text="No sales logged yet."/>}</div></Card></>
}

function Clients({clients,setClients}:{clients:Client[];setClients:(x:Client[])=>void}){
 const [q,setQ]=useState(""); const [open,setOpen]=useState(false); const [form,setForm]=useState({name:"",phone:""}); const filtered=clients.filter(c=>c.name.toLowerCase().includes(q.toLowerCase())||c.phone.includes(q));
 const submit=(e:React.FormEvent)=>{e.preventDefault();if(!form.name)return;setClients([{id:uid(),name:form.name,phone:form.phone,lastVisit:today(),visits:0,spend:0,rebooked:false},...clients]);setForm({name:"",phone:""});setOpen(false)};
 return <><Heading eyebrow="CLIENT BOOK" title="Clients" copy="Know who is returning, who spends most and who needs a follow-up." action={<button className="primary" onClick={()=>setOpen(!open)}>+ Add client</button>}/>{open&&<Card><form className="form compact" onSubmit={submit}><Input label="Name" value={form.name} onChange={v=>setForm({...form,name:v})}/><Input label="Phone" value={form.phone} onChange={v=>setForm({...form,phone:v})}/><button className="primary">Save client</button></form></Card>}<div className="search"><span>⌕</span><input placeholder="Search clients" value={q} onChange={e=>setQ(e.target.value)}/></div><Card><div className="table">{filtered.map(c=><div className="row client-row" key={c.id}><div className="avatar">{c.name[0]}</div><div><strong>{c.name}</strong><span>{c.phone} · Last visit {c.lastVisit}</span></div><div className="client-stat"><b>{c.visits}</b><span>visits</span></div><div className="client-stat"><b>{money.format(c.spend)}</b><span>spend</span></div><em className={c.rebooked?"good-tag":"muted-tag"}>{c.rebooked?"Booked":"Follow up"}</em><button className="delete" onClick={()=>setClients(clients.filter(x=>x.id!==c.id))}>×</button></div>)}</div></Card></>
}

function Expenses({expenses,setExpenses}:{expenses:Expense[];setExpenses:(x:Expense[])=>void}){
 const [open,setOpen]=useState(false);const [form,setForm]=useState({date:today(),category:"Supplies",description:"",amount:0}); const total=expenses.reduce((s,x)=>s+x.amount,0);
 const submit=(e:React.FormEvent)=>{e.preventDefault();if(!form.description||form.amount<=0)return;setExpenses([{id:uid(),...form},...expenses]);setForm({...form,description:"",amount:0});setOpen(false)};
 return <><Heading eyebrow="COST CONTROL" title="Expenses" copy="Track the costs that quietly reduce your take-home pay." action={<button className="primary" onClick={()=>setOpen(!open)}>+ Add expense</button>}/><div className="metric-grid two"><Metric label="Logged expenses" value={money.format(total)} note={`${expenses.length} transactions`} tone="warn"/><Metric label="Average expense" value={money.format(expenses.length?total/expenses.length:0)} note="Per transaction" tone="neutral"/></div>{open&&<Card><form className="form" onSubmit={submit}><Input label="Date" type="date" value={form.date} onChange={v=>setForm({...form,date:v})}/><label><span>Category</span><select value={form.category} onChange={e=>setForm({...form,category:e.target.value})}>{["Rent","Supplies","Software","Marketing","Utilities","Other"].map(x=><option key={x}>{x}</option>)}</select></label><Input label="Description" value={form.description} onChange={v=>setForm({...form,description:v})}/><Input label="Amount" type="number" value={form.amount} onChange={v=>setForm({...form,amount:Number(v)})}/><button className="primary">Save expense</button></form></Card>}<Card><div className="table">{expenses.map(e=><div className="row" key={e.id}><div className="expense-icon">↘</div><div><strong>{e.description}</strong><span>{e.category} · {e.date}</span></div><b>-{money.format(e.amount)}</b><button className="delete" onClick={()=>setExpenses(expenses.filter(x=>x.id!==e.id))}>×</button></div>)}</div></Card></>
}

function Services({services,setServices,result}:{services:Service[];setServices:(x:Service[])=>void;result:any}){
 const update=(id:string,key:keyof Service,value:string)=>setServices(services.map(s=>s.id===id?{...s,[key]:key==="name"?value:Number(value)}:s));
 return <><Heading eyebrow="SERVICE ECONOMICS" title="Services" copy="See what each service earns per hour and whether its price supports your goals." action={<button className="primary" onClick={()=>setServices([...services,{id:uid(),name:"New Service",price:50,minutes:30,directCost:3,clientsPerMonth:10}])}>+ Add service</button>}/><div className="service-grid">{result.serviceResults.map((s:any)=><Card key={s.id} className="service-card"><div className="service-title"><input value={s.name} onChange={e=>update(s.id,"name",e.target.value)}/><button className="delete" onClick={()=>setServices(services.filter(x=>x.id!==s.id))}>×</button></div><div className="form service-form"><Input label="Price" type="number" value={s.price} onChange={v=>update(s.id,"price",v)}/><Input label="Minutes" type="number" value={s.minutes} onChange={v=>update(s.id,"minutes",v)}/><Input label="Direct cost" type="number" value={s.directCost} onChange={v=>update(s.id,"directCost",v)}/><Input label="Clients / month" type="number" value={s.clientsPerMonth} onChange={v=>update(s.id,"clientsPerMonth",v)}/></div><div className="service-stats"><div><span>Earns / hour</span><b>{money.format(s.profitPerHour)}</b></div><div><span>Target price</span><b>{money.format(s.targetPrice)}</b></div></div><p className={s.action==="Keep and promote"?"service-action good-text":"service-action"}>{s.action}</p></Card>)}</div></>
}

function Coach({analytics,store,setStore}:{analytics:any;store:Store;setStore:(x:Store)=>void}){
 const opp=analytics.calc.opportunities.slice(0,3); const actions=[
  {title:"Lift your rebooking",copy:`Current rebooking is ${Math.round(analytics.rebook*100)}%. Ask every client before they leave.`,value:"65% target"},
  {title:"Protect your hourly rate",copy:`You currently need about ${money.format(analytics.calc.salesPerHour)} per booked hour to hit your goals.`,value:`${money.format(analytics.calc.salesPerHour)}/hr`},
  ...(opp.map((x:any)=>({title:x.name,copy:x.action,value:money.format(Math.max(x.annualPriceOpportunity,x.annualTimeOpportunity))+"/yr"})))
 ].slice(0,3);
 return <><Heading eyebrow="BARBERBENCH INTELLIGENCE" title="Your three actions" copy="Clear recommendations based on the numbers currently saved in your business."/><Card className="coach-hero"><span>ESTIMATED ANNUAL OPPORTUNITY</span><strong>{money.format(opp.reduce((s:number,x:any)=>s+Math.max(x.annualPriceOpportunity,x.annualTimeOpportunity),0))}</strong><p>Small improvements, repeated every week, become meaningful income.</p></Card><div className="actions">{actions.map((a,i)=><Card key={a.title} className="action"><b>{i+1}</b><div><small>PRIORITY {i+1}</small><h2>{a.title}</h2><p>{a.copy}</p></div><strong>{a.value}</strong></Card>)}</div><Card><div className="card-head"><div><small>BUSINESS SETTINGS</small><h2>Your income target</h2></div></div><div className="form"><Input label="Your name" value={store.inputs.name} onChange={v=>setStore({...store,inputs:{...store.inputs,name:v}})}/><Input label="Annual personal income goal" type="number" value={store.inputs.annualIncomeGoal} onChange={v=>setStore({...store,inputs:{...store.inputs,annualIncomeGoal:Number(v)}})}/><Input label="Monthly business costs" type="number" value={store.inputs.monthlyCosts} onChange={v=>setStore({...store,inputs:{...store.inputs,monthlyCosts:Number(v)}})}/><Input label="Days worked each week" type="number" value={store.inputs.daysPerWeek} onChange={v=>setStore({...store,inputs:{...store.inputs,daysPerWeek:Number(v)}})}/></div></Card></>
}

function Input({label,value,onChange,type="text"}:{label:string;value:string|number;onChange:(v:string)=>void;type?:string}){return <label><span>{label}</span><input type={type} inputMode={type==="number"?"decimal":undefined} value={value} onChange={e=>onChange(e.target.value)}/></label>}
