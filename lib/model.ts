export type Status = "good" | "warn" | "bad";
export type Service = { id:string; name:string; price:number; minutes:number; cost:number; clients:number };
export type Retail = { id:string; name:string; cost:number; price:number; units:number };
export type TeamMember = { id:string; name:string; revenue:number; hours:number; rebooking:number; retail:number };
export type Business = {
  name:string; monthlyOverheads:number; ownerWage:number; taxReserve:number;
  targetHourly:number; annualGoal:number; services:Service[]; retail:Retail[]; team:TeamMember[];
};

export const demoBusiness: Business = {
  name:"Ben", monthlyOverheads:7200, ownerWage:6500, taxReserve:18, targetHourly:108, annualGoal:150000,
  services:[
    {id:"fade",name:"Skin Fade",price:50,minutes:48,cost:4,clients:92},
    {id:"cut",name:"Classic Cut",price:45,minutes:34,cost:3,clients:118},
    {id:"beard",name:"Beard Trim",price:30,minutes:18,cost:2,clients:46},
    {id:"combo",name:"Cut + Beard",price:72,minutes:55,cost:5,clients:38},
    {id:"kids",name:"Kids Cut",price:35,minutes:32,cost:2,clients:42}
  ],
  retail:[
    {id:"clay",name:"Matte Clay",cost:14,price:32,units:28},
    {id:"oil",name:"Beard Oil",cost:11,price:28,units:18},
    {id:"spray",name:"Texture Spray",cost:16,price:36,units:14}
  ],
  team:[
    {id:"ben",name:"Ben",revenue:11320,hours:101,rebooking:72,retail:11},
    {id:"josh",name:"Josh",revenue:8560,hours:117,rebooking:54,retail:7},
    {id:"sam",name:"Sam",revenue:9780,hours:91,rebooking:68,retail:13},
    {id:"amber",name:"Amber",revenue:10420,hours:88,rebooking:81,retail:16}
  ]
};

export function status(value:number, good:number, warn:number): Status {
  return value >= good ? "good" : value >= warn ? "warn" : "bad";
}

export function analyse(b:Business){
  const serviceRevenue=b.services.reduce((s,x)=>s+x.price*x.clients,0);
  const serviceCosts=b.services.reduce((s,x)=>s+x.cost*x.clients,0);
  const bookedHours=b.services.reduce((s,x)=>s+x.minutes*x.clients/60,0);
  const retailRevenue=b.retail.reduce((s,x)=>s+x.price*x.units,0);
  const retailCosts=b.retail.reduce((s,x)=>s+x.cost*x.units,0);
  const revenue=serviceRevenue+retailRevenue;
  const grossProfit=revenue-serviceCosts-retailCosts;
  const operatingProfit=grossProfit-b.monthlyOverheads-b.ownerWage;
  const afterTax=operatingProfit*(1-b.taxReserve/100);
  const revenuePerHour=bookedHours?serviceRevenue/bookedHours:0;
  const retailPerClient=b.services.reduce((s,x)=>s+x.clients,0)?retailRevenue/b.services.reduce((s,x)=>s+x.clients,0):0;
  const serviceResults=b.services.map(x=>{
    const net=x.price-x.cost;
    const hourly=x.minutes?net/x.minutes*60:0;
    const recommended=Math.ceil((b.targetHourly*x.minutes/60+x.cost)/2)*2;
    const priceGap=Math.max(0,recommended-x.price);
    const targetMinutes=Math.floor(net/b.targetHourly*60);
    const minutesToSave=Math.max(0,x.minutes-targetMinutes);
    const priceOpportunity=priceGap*x.clients*12;
    const timeOpportunity=minutesToSave/60*b.targetHourly*x.clients*12;
    const score=Math.min(100,Math.round(hourly/b.targetHourly*100));
    return {...x,net,hourly,recommended,priceGap,targetMinutes,minutesToSave,priceOpportunity,timeOpportunity,score,status:status(score,95,75)};
  });
  const retailProfit=retailRevenue-retailCosts;
  const retailMargin=retailRevenue?retailProfit/retailRevenue*100:0;
  const rebooking=b.team.reduce((s,x)=>s+x.rebooking,0)/b.team.length;
  const pricingLoss=serviceResults.reduce((s,x)=>s+x.priceOpportunity,0);
  const timeLoss=serviceResults.reduce((s,x)=>s+x.timeOpportunity,0);
  const retailTarget=revenue*.08;
  const retailLoss=Math.max(0,(retailTarget-retailRevenue)*12);
  const rebookingLoss=Math.max(0,(70-rebooking)/100*serviceRevenue*.45*12);
  const totalOpportunity=pricingLoss+timeLoss+retailLoss+rebookingLoss;
  const profitabilityScore=Math.max(0,Math.min(100,50+operatingProfit/250));
  const serviceScore=serviceResults.reduce((s,x)=>s+x.score,0)/serviceResults.length;
  const retailScore=Math.min(100,retailMargin/55*70+Math.min(30,retailRevenue/revenue*375));
  const score=Math.round((profitabilityScore*.35+serviceScore*.3+Math.min(100,rebooking/70*100)*.2+retailScore*.15));
  const biggest=[
    {kind:"Pricing",value:pricingLoss,icon:"↗"},{kind:"Time",value:timeLoss,icon:"◷"},{kind:"Retail",value:retailLoss,icon:"▣"},{kind:"Rebooking",value:rebookingLoss,icon:"↻"}
  ].sort((a,c)=>c.value-a.value)[0];
  return {serviceRevenue,retailRevenue,revenue,grossProfit,operatingProfit,afterTax,bookedHours,revenuePerHour,retailProfit,retailMargin,retailPerClient,rebooking,serviceResults,pricingLoss,timeLoss,retailLoss,rebookingLoss,totalOpportunity,score,biggest};
}
