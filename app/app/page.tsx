import Link from "next/link";
import { ArrowRight, BarChart3, BrainCircuit, Scissors, ShieldCheck, TrendingUp } from "lucide-react";

const features = [
  [BarChart3, "Know your numbers", "Track weekly revenue, clients, hours, average ticket and rebooking in one place."],
  [BrainCircuit, "Get practical coaching", "Turn raw business data into clear actions you can use behind the chair this week."],
  [TrendingUp, "See the upside", "Model pricing, capacity and retention improvements before making changes."],
];

export default function Home() {
  return <main>
    <nav className="nav container"><Link href="/" className="brand"><span className="brandMark"><Scissors size={20}/></span>BarberBench <b>IQ</b></Link><div className="navLinks"><a href="#features">Features</a><Link className="button ghost" href="/login">Sign in</Link><Link className="button" href="/dashboard">Open demo <ArrowRight size={16}/></Link></div></nav>
    <section className="hero container"><div className="heroCopy"><span className="eyebrow">Built for ambitious barbers and shop owners</span><h1>Build a better barber business with <span>numbers you understand.</span></h1><p>BarberBench IQ turns your weekly performance into a clear scorecard, growth opportunities and practical coaching.</p><div className="heroActions"><Link className="button large" href="/dashboard">Launch the founder demo <ArrowRight size={18}/></Link><a className="button ghost large" href="#features">See what it does</a></div><div className="trust"><ShieldCheck size={18}/> Your data stays private and under your control.</div></div><div className="heroCard"><div className="miniHeader"><span>Business score</span><strong>84</strong></div><div className="scoreRing"><span>84</span><small>Strong</small></div><div className="miniStats"><div><small>Revenue / hour</small><b>$78.40</b><em>+8.2%</em></div><div><small>Rebooking</small><b>72%</b><em>+6%</em></div></div><div className="coach"><BrainCircuit size={20}/><p><b>Best next move</b>Raise average ticket by $4 through a premium finish add-on.</p></div></div></section>
    <section id="features" className="section container"><div className="sectionHead"><span className="eyebrow">One weekly habit. Better decisions.</span><h2>Everything you need to improve performance.</h2></div><div className="featureGrid">{features.map(([Icon,title,text]) => <article className="featureCard" key={String(title)}><span><Icon size={24}/></span><h3>{String(title)}</h3><p>{String(text)}</p></article>)}</div></section>
    <footer className="footer container"><div className="brand"><span className="brandMark"><Scissors size={18}/></span>BarberBench <b>IQ</b></div><p>Founder beta · Built in New Zealand</p></footer>
  </main>
}
