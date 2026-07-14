"use client";
import { useEffect,useMemo,useState } from "react";
import { Area,AreaChart,CartesianGrid,ResponsiveContainer,Tooltip,XAxis,YAxis } from "recharts";
import { CalendarDays,Clock3,DollarSign,Receipt,RefreshCw,Scissors,Target,Users } from "lucide-react";
import { demoWeeks } from "@/lib/demo-data";
import { coaching,metrics,money,score } from "@/lib/metrics";
import type { WeekEntry } from "@/lib/types";
import { MetricCard } from "./MetricCard";
import { WeeklyForm } from "./WeeklyForm";

export function DashboardClient(){
 const [weeks,setWeeks]=useState<WeekEntry[]>(demoWeeks); const [loaded,setLoaded]=useState(false); const current=weeks.at(-1)!;
 useEffect(()=>{const saved=localStorage.getItem("barberbench-weeks");if(saved)try{setWeeks(JSON.parse(saved))}catch{}setLoaded(true)},[]);
 useEffect(()=>{if(loaded)localStorage.setItem("barberbench-weeks",JSON.stringify(weeks))},[weeks,loaded]);
 const m=metrics(current),s=score(current),coach=coaching(current); const opportunity=useMemo(()=>Math.round(current.clients*5*48),[current.clients]);
 const update=(v:WeekEntry)=>setWeeks(old=>[...old.slice(0,-1),v]);
 return <div className="dashboardContent"><header className="dashHeader"><div><span className="eyebrow">Tuesday performance check-in</span><h1>Good evening, Benji.</h1><p>Here is what your business is telling you this week.</p></div><button className="period"><CalendarDays size={17}/>Last 6 weeks</button></header>
 <section className="metrics"><MetricCard title="Weekly revenue" value={money(current.revenue)} detail="Current trading week" Icon={DollarSign}/><MetricCard title="Revenue per hour" value={money(m.hourly)} detail="Target: $90+" Icon={Clock3}/><MetricCard title="Average ticket" value={money(m.ticket)} detail="Revenue per client" Icon={Receipt}/><MetricCard title="Rebooking rate" value={`${m.rebook.toFixed(0)}%`} detail={`${current.rebooked} clients secured`} Icon={RefreshCw}/></section>
 <section className="dashGrid"><article className="panel chartPanel"><div className="panelHead"><div><span>Revenue trend</span><h2>Weekly performance</h2></div><b>+23.4% <small>six-week growth</small></b></div><div className="chart"><ResponsiveContainer width="100%" height="100%"><AreaChart data={weeks}><defs><linearGradient id="fill" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="currentColor" stopOpacity={0.25}/><stop offset="95%" stopColor="currentColor" stopOpacity={0}/></linearGradient></defs><CartesianGrid strokeDasharray="3 3" vertical={false}/><XAxis dataKey="label" axisLine={false} tickLine={false}/><YAxis axisLine={false} tickLine={false} tickFormatter={v=>`$${v/1000}k`}/><Tooltip formatter={(v)=>money(Number(v))}/><Area type="monotone" dataKey="revenue" stroke="currentColor" strokeWidth={3} fill="url(#fill)"/></AreaChart></ResponsiveContainer></div></article>
 <article className="panel scorePanel"><div className="panelHead"><div><span>BarberBench score</span><h2>Business health</h2></div></div><div className="scoreRing large" style={{background:`conic-gradient(#c9a86a ${s*3.6}deg,#263347 0)`}}><div><span>{s}</span><small>{s>=80?"Strong":s>=60?"Building":"Needs focus"}</small></div></div><p>Calculated from productivity, ticket value and client retention.</p></article>
 <article className="panel entryPanel"><div className="panelHead"><div><span>Weekly check-in</span><h2>Update your numbers</h2></div><Scissors size={22}/></div><WeeklyForm value={current} onChange={update}/><small className="saved">Changes save automatically on this device.</small></article>
 <article className="panel coachPanel"><div className="coachIcon"><Target size={24}/></div><span>IQ Coach recommendation</span><h2>{coach.title}</h2><p>{coach.text}</p><div className="opportunity"><Users size={20}/><div><small>Potential annual upside</small><strong>{money(opportunity)}</strong></div><em>from a $5 ticket lift</em></div></article></section></div>
}
