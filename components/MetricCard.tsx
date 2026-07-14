import type { LucideIcon } from "lucide-react";
export function MetricCard({title,value,detail,Icon}:{title:string;value:string;detail:string;Icon:LucideIcon}){return <article className="metricCard"><div className="metricTop"><span>{title}</span><i><Icon size={19}/></i></div><strong>{value}</strong><small>{detail}</small></article>}
