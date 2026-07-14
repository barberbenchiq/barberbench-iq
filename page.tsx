"use client";

import { useEffect, useMemo, useState } from "react";
import { BusinessInputs, Service, calculate, defaultInputs, defaultServices } from "../lib/model";

type Tab = "home" | "setup" | "checkin" | "services" | "coach";
const money = new Intl.NumberFormat("en-NZ", { style: "currency", currency: "NZD", maximumFractionDigits: 0 });
const percent = new Intl.NumberFormat("en-NZ", { style: "percent", maximumFractionDigits: 0 });

function statusClass(value: number, target: number) {
  if (!value) return "neutral";
  if (value < target * 0.9) return "urgent";
  if (value < target * 1.1) return "stable";
  return "good";
}

export default function Page() {
  const [tab, setTab] = useState<Tab>("home");
  const [inputs, setInputs] = useState<BusinessInputs>(defaultInputs);
  const [services, setServices] = useState<Service[]>(defaultServices);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem("barberbench-iq-v01");
    if (saved) {
      try {
        const data = JSON.parse(saved);
        setInputs({ ...defaultInputs, ...data.inputs });
        setServices(data.services?.length ? data.services : defaultServices);
      } catch {}
    }
    setReady(true);
  }, []);

  useEffect(() => {
    if (ready) localStorage.setItem("barberbench-iq-v01", JSON.stringify({ inputs, services }));
  }, [inputs, services, ready]);

  const result = useMemo(() => calculate(inputs, services), [inputs, services]);
  const biggest = result.opportunities[0];

  function updateInput(key: keyof BusinessInputs, value: string) {
    setInputs((old) => ({ ...old, [key]: key === "name" || key === "role" ? value : Number(value) }));
  }

  function updateService(id: string, key: keyof Service, value: string) {
    setServices((old) => old.map((s) => s.id === id ? { ...s, [key]: key === "name" ? value : Number(value) } : s));
  }

  return (
    <main className="app-shell">
      <header className="topbar">
        <button className="brand" onClick={() => setTab("home")} aria-label="Home">
          <span className="brand-mark">B</span><span>BarberBench <b>IQ</b></span>
        </button>
        <span className="beta">FOUNDER BETA</span>
      </header>

      <section className="content">
        {tab === "home" && <Home inputs={inputs} result={result} biggest={biggest} setTab={setTab} />}
        {tab === "setup" && <Setup inputs={inputs} updateInput={updateInput} />}
        {tab === "checkin" && <Checkin inputs={inputs} updateInput={updateInput} />}
        {tab === "services" && <Services services={services} updateService={updateService} result={result} />}
        {tab === "coach" && <Coach result={result} />}
      </section>

      <nav className="bottom-nav" aria-label="Main navigation">
        {(["home","setup","checkin","services","coach"] as Tab[]).map((item) => (
          <button key={item} className={tab === item ? "active" : ""} onClick={() => setTab(item)}>
            <span>{({home:"⌂",setup:"◎",checkin:"＋",services:"✂",coach:"★"} as Record<Tab,string>)[item]}</span>
            {({home:"Home",setup:"Goals",checkin:"Check-in",services:"Services",coach:"Coach"} as Record<Tab,string>)[item]}
          </button>
        ))}
      </nav>
    </main>
  );
}

function Home({ inputs, result, biggest, setTab }: any) {
  return <>
    <div className="welcome"><p>Kia ora, {inputs.name || "barber"}</p><h1>How’s your business going?</h1></div>
    <div className="score-card">
      <div><small>BUSINESS SCORE</small><strong>{result.healthScore}</strong><span>/100</span></div>
      <p>{result.healthScore >= 80 ? "You’re doing well. Keep building." : result.healthScore >= 60 ? "Stable. A few changes can lift your income." : "There are clear opportunities to improve."}</p>
    </div>
    <div className="grid two">
      <Kpi label="Money every booked hour" value={money.format(result.currentRevenuePerHour)} target={money.format(result.salesPerHour)} status={statusClass(result.currentRevenuePerHour, result.salesPerHour)} />
      <Kpi label="Clients booking again" value={percent.format(result.rebooking)} target="65% goal" status={statusClass(result.rebooking, .65)} />
      <Kpi label="Clients coming back" value={percent.format(result.retention)} target="75% goal" status={statusClass(result.retention, .75)} />
      <Kpi label="Clients buying product" value={percent.format(result.productAttachment)} target="20% goal" status={statusClass(result.productAttachment, .20)} />
    </div>
    <div className="focus-card">
      <small>YOUR BIGGEST OPPORTUNITY</small>
      <h2>{biggest ? biggest.name : "Add your services"}</h2>
      <p>{biggest ? biggest.action : "Enter service prices and times to get advice."}</p>
      <strong>{biggest ? `${money.format(biggest.annualPriceOpportunity)} / year opportunity` : ""}</strong>
      <button onClick={() => setTab("coach")}>Show my plan</button>
    </div>
  </>
}

function Kpi({label,value,target,status}:{label:string,value:string,target:string,status:string}) {
  return <div className={`kpi ${status}`}><small>{label}</small><strong>{value}</strong><span>{target}</span></div>
}

function Field({ label, value, onChange, type="number", suffix }: any) {
  return <label className="field"><span>{label}</span><div><input type={type} value={value} onChange={(e)=>onChange(e.target.value)} />{suffix && <em>{suffix}</em>}</div></label>
}

function Setup({ inputs, updateInput }: any) {
  return <section><PageTitle eyebrow="YOUR GOALS" title="What do you want your work to give you?" subtitle="There are no accounting questions here. Just tell us what you want and how you work." />
    <div className="panel form-grid">
      <Field label="Your name" type="text" value={inputs.name} onChange={(v:string)=>updateInput("name",v)} />
      <label className="field"><span>Which best describes you?</span><select value={inputs.role} onChange={(e)=>updateInput("role",e.target.value)}><option value="employee">Employee</option><option value="contractor">Contractor</option><option value="chair">Chair renter</option><option value="owner">Shop owner</option><option value="team">Team owner</option></select></label>
      <Field label="What do you want to personally earn each year?" value={inputs.annualIncomeGoal} onChange={(v:string)=>updateInput("annualIncomeGoal",v)} suffix="$" />
      <Field label="How much extra profit do you want left over?" value={inputs.annualProfitGoal} onChange={(v:string)=>updateInput("annualProfitGoal",v)} suffix="$" />
      <Field label="Your average business costs each month" value={inputs.monthlyCosts} onChange={(v:string)=>updateInput("monthlyCosts",v)} suffix="$" />
      <Field label="Days worked each week" value={inputs.daysPerWeek} onChange={(v:string)=>updateInput("daysPerWeek",v)} />
      <Field label="Hours available each day" value={inputs.hoursPerDay} onChange={(v:string)=>updateInput("hoursPerDay",v)} />
      <Field label="Weeks worked each year" value={inputs.weeksPerYear} onChange={(v:string)=>updateInput("weeksPerYear",v)} />
      <Field label="How much of your day is normally booked?" value={inputs.bookedPercent} onChange={(v:string)=>updateInput("bookedPercent",v)} suffix="%" />
      <Field label="Average direct costs from each service" value={inputs.directCostPercent} onChange={(v:string)=>updateInput("directCostPercent",v)} suffix="%" />
    </div>
  </section>
}

function Checkin({inputs,updateInput}:any) {
  return <section><PageTitle eyebrow="MONTHLY CHECK-IN" title="Copy the simple totals from your booking software" subtitle="Use one completed month. BarberBench turns those totals into clear actions." />
    <div className="panel form-grid">
      <Field label="Completed client visits" value={inputs.totalClients} onChange={(v:string)=>updateInput("totalClients",v)} />
      <Field label="Returning clients" value={inputs.returningClients} onChange={(v:string)=>updateInput("returningClients",v)} />
      <Field label="Clients who rebooked" value={inputs.rebookedClients} onChange={(v:string)=>updateInput("rebookedClients",v)} />
      <Field label="Clients who bought product" value={inputs.productClients} onChange={(v:string)=>updateInput("productClients",v)} />
      <Field label="Service sales" value={inputs.serviceRevenue} onChange={(v:string)=>updateInput("serviceRevenue",v)} suffix="$" />
      <Field label="Product sales" value={inputs.productRevenue} onChange={(v:string)=>updateInput("productRevenue",v)} suffix="$" />
      <Field label="Total booked service hours" value={inputs.bookedHours} onChange={(v:string)=>updateInput("bookedHours",v)} />
    </div>
  </section>
}

function Services({services,updateService,result}:any) {
  return <section><PageTitle eyebrow="SERVICE IQ" title="Which services help you grow—and which hold you back?" subtitle="Change a price or time and see the advice update instantly." />
    <div className="service-list">{result.serviceResults.map((s:any)=><article key={s.id} className={`service-card ${statusClass(s.profitPerHour,result.contributionPerHour)}`}>
      <div className="service-head"><input value={s.name} onChange={(e)=>updateService(s.id,"name",e.target.value)} /><span>{s.action}</span></div>
      <div className="service-fields">
        <Field label="Current price" value={s.price} onChange={(v:string)=>updateService(s.id,"price",v)} suffix="$" />
        <Field label="Minutes" value={s.minutes} onChange={(v:string)=>updateService(s.id,"minutes",v)} />
        <Field label="Direct cost" value={s.directCost} onChange={(v:string)=>updateService(s.id,"directCost",v)} suffix="$" />
        <Field label="Clients / month" value={s.clientsPerMonth} onChange={(v:string)=>updateService(s.id,"clientsPerMonth",v)} />
      </div>
      <div className="service-results"><div><small>Makes each hour</small><strong>{money.format(s.profitPerHour)}</strong></div><div><small>Recommended price</small><strong>{money.format(s.targetPrice)}</strong></div><div><small>Opportunity</small><strong>{money.format(s.annualPriceOpportunity)}/yr</strong></div></div>
    </article>)}</div>
  </section>
}

function Coach({result}:any) {
  const top = result.opportunities.slice(0,3);
  return <section><PageTitle eyebrow="YOUR COACH" title="Three simple things to work on next" subtitle="Focus on one change at a time. Small changes add up across a full year." />
    <div className="coach-total"><small>TOTAL PRICING OPPORTUNITY</small><strong>{money.format(top.reduce((sum:any,x:any)=>sum+x.annualPriceOpportunity,0))}</strong><span>per year from your top three service opportunities</span></div>
    <div className="action-list">{top.length ? top.map((s:any,i:number)=><article key={s.id}><b>{i+1}</b><div><small>{s.name}</small><h2>{s.action}</h2><p>Current: {money.format(s.price)} · Target: {money.format(s.targetPrice)}</p></div><strong>{money.format(s.annualPriceOpportunity)}/yr</strong></article>) : <p>Add services to build your plan.</p>}</div>
    <div className="plain-advice"><h3>What the numbers are saying</h3><p>Your target is <b>{money.format(result.salesPerHour)} in sales for every booked hour</b>. You are currently making <b>{money.format(result.currentRevenuePerHour)}</b>. Start with the biggest red service, then work on clients booking again and product conversations.</p></div>
  </section>
}

function PageTitle({eyebrow,title,subtitle}:{eyebrow:string,title:string,subtitle:string}) {
  return <div className="page-title"><small>{eyebrow}</small><h1>{title}</h1><p>{subtitle}</p></div>
}
