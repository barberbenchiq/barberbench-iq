import Link from "next/link";

export default function Home(){
  return <main className="landing">
    <nav className="landingNav"><div className="brand"><span className="mark">B</span> BarberBench <b>IQ</b></div><Link className="button ghost" href="/dashboard">Founder demo</Link></nav>
    <section className="hero">
      <div className="heroCopy"><span className="eyebrow">YOUR BARBER BUSINESS COACH</span><h1>Know your numbers.<br/><em>Grow your business.</em></h1><p>See what is profitable, where money is leaking, and exactly what to do next.</p><div className="heroButtons"><Link className="button gold" href="/dashboard">Launch Founder Beta</Link><a className="button ghost" href="#features">See what it does</a></div></div>
      <div className="preview"><div className="previewTop"><span>Business score</span><b>84</b></div><div className="miniRing"><strong>84</strong><span>/100</span></div><div className="previewGrid"><div><small>Money this month</small><b>$18,430</b><span className="up">▲ 8%</span></div><div><small>Money every hour</small><b>$112</b><span className="up">Above target</span></div></div><div className="alert"><b>Biggest opportunity</b><span>Retail sales · +$8,200/year</span></div></div>
    </section>
    <section id="features" className="featureStrip"><div><b>Know your numbers</b><span>Profit, price and time clarity</span></div><div><b>Find opportunities</b><span>See where money is leaking</span></div><div><b>Take action</b><span>Simple steps with dollar value</span></div><div><b>Grow your future</b><span>Targets and forecasts</span></div></section>
  </main>
}
