"use client";
import Link from "next/link";
import { useState } from "react";
import { ArrowRight, Scissors } from "lucide-react";

export default function LoginPage(){
 const [email,setEmail]=useState(""); const [sent,setSent]=useState(false);
 return <main className="authShell"><section className="authPanel"><Link href="/" className="brand"><span className="brandMark"><Scissors size={20}/></span>BarberBench <b>IQ</b></Link><div className="authCopy"><span className="eyebrow">Welcome back</span><h1>Sign in to your business dashboard.</h1><p>The founder beta works immediately in demo mode. Supabase credentials can be added later for live accounts.</p></div>{sent ? <div className="successBox"><h3>Demo access ready</h3><p>Authentication wiring is prepared. Continue to the dashboard now.</p><Link className="button large" href="/dashboard">Continue <ArrowRight size={18}/></Link></div> : <form className="authForm" onSubmit={(e)=>{e.preventDefault();setSent(true)}}><label>Email address<input required type="email" value={email} onChange={e=>setEmail(e.target.value)} placeholder="you@barbershop.co.nz"/></label><button className="button large" type="submit">Continue with email <ArrowRight size={18}/></button><Link className="demoLink" href="/dashboard">Skip sign-in and open demo</Link></form>}</section><aside className="authAside"><blockquote>“The shop can feel busy while the numbers stand still. BarberBench IQ shows you exactly what to improve next.”</blockquote><p>Founder principle #1</p></aside></main>
}
