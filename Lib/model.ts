export type Role = "employee" | "contractor" | "chair" | "owner" | "team";

export type BusinessInputs = {
  name: string;
  role: Role;
  annualIncomeGoal: number;
  annualProfitGoal: number;
  monthlyCosts: number;
  daysPerWeek: number;
  hoursPerDay: number;
  weeksPerYear: number;
  bookedPercent: number;
  directCostPercent: number;
  totalClients: number;
  returningClients: number;
  rebookedClients: number;
  productClients: number;
  serviceRevenue: number;
  productRevenue: number;
  bookedHours: number;
};

export type Service = {
  id: string;
  name: string;
  price: number;
  minutes: number;
  directCost: number;
  clientsPerMonth: number;
};

export const defaultInputs: BusinessInputs = {
  name: "Ben",
  role: "chair",
  annualIncomeGoal: 90000,
  annualProfitGoal: 10000,
  monthlyCosts: 4200,
  daysPerWeek: 5,
  hoursPerDay: 8,
  weeksPerYear: 48,
  bookedPercent: 75,
  directCostPercent: 10,
  totalClients: 210,
  returningClients: 145,
  rebookedClients: 120,
  productClients: 24,
  serviceRevenue: 12600,
  productRevenue: 1200,
  bookedHours: 122,
};

export const defaultServices: Service[] = [
  { id: "cut", name: "Standard Cut", price: 50, minutes: 35, directCost: 3, clientsPerMonth: 95 },
  { id: "fade", name: "Skin Fade", price: 60, minutes: 50, directCost: 4, clientsPerMonth: 70 },
  { id: "beard", name: "Beard Trim", price: 30, minutes: 20, directCost: 2, clientsPerMonth: 30 },
  { id: "combo", name: "Cut + Beard", price: 72, minutes: 55, directCost: 5, clientsPerMonth: 28 },
];

export function calculate(inputs: BusinessInputs, services: Service[]) {
  const annualNeed = inputs.annualIncomeGoal + inputs.annualProfitGoal + inputs.monthlyCosts * 12;
  const availableHours = inputs.daysPerWeek * inputs.hoursPerDay * inputs.weeksPerYear;
  const targetBookedHours = availableHours * (inputs.bookedPercent / 100);
  const contributionPerHour = targetBookedHours > 0 ? annualNeed / targetBookedHours : 0;
  const salesPerHour = contributionPerHour / Math.max(0.01, 1 - inputs.directCostPercent / 100);
  const contributionPerMinute = contributionPerHour / 60;
  const currentRevenuePerHour = inputs.bookedHours > 0 ? inputs.serviceRevenue / inputs.bookedHours : 0;
  const averageTicket = inputs.totalClients > 0 ? inputs.serviceRevenue / inputs.totalClients : 0;
  const rebooking = inputs.totalClients > 0 ? inputs.rebookedClients / inputs.totalClients : 0;
  const retention = inputs.totalClients > 0 ? inputs.returningClients / inputs.totalClients : 0;
  const productAttachment = inputs.totalClients > 0 ? inputs.productClients / inputs.totalClients : 0;

  const serviceResults = services.map((service) => {
    const moneyLeft = service.price - service.directCost;
    const profitPerHour = service.minutes > 0 ? moneyLeft / service.minutes * 60 : 0;
    const targetPrice = Math.ceil(service.minutes * contributionPerMinute + service.directCost);
    const priceGap = Math.max(targetPrice - service.price, 0);
    const maxMinutes = contributionPerMinute > 0 ? moneyLeft / contributionPerMinute : 0;
    const minutesToSave = Math.max(Math.ceil(service.minutes - maxMinutes), 0);
    const annualPriceOpportunity = priceGap * service.clientsPerMonth * 12;
    const pricePct = service.price > 0 ? priceGap / service.price : 1;
    const timePct = service.minutes > 0 ? minutesToSave / service.minutes : 1;
    const action = priceGap === 0 && minutesToSave === 0
      ? "Keep and promote"
      : pricePct <= timePct
        ? `Raise price by $${priceGap}`
        : `Save ${minutesToSave} minutes`;
    return { ...service, moneyLeft, profitPerHour, targetPrice, priceGap, maxMinutes, minutesToSave, annualPriceOpportunity, action };
  });

  const pricingScore = Math.min(100, (currentRevenuePerHour / Math.max(salesPerHour, 1)) * 100);
  const rebookingScore = Math.min(100, (rebooking / 0.65) * 100);
  const retentionScore = Math.min(100, (retention / 0.75) * 100);
  const retailScore = Math.min(100, (productAttachment / 0.20) * 100);
  const serviceScore = serviceResults.length
    ? serviceResults.reduce((sum, s) => sum + Math.min(100, s.profitPerHour / Math.max(contributionPerHour, 1) * 100), 0) / serviceResults.length
    : 0;
  const healthScore = Math.round((pricingScore + rebookingScore + retentionScore + retailScore + serviceScore) / 5);

  const opportunities = serviceResults
    .filter((s) => s.annualPriceOpportunity > 0)
    .sort((a, b) => b.annualPriceOpportunity - a.annualPriceOpportunity);

  return {
    annualNeed, availableHours, targetBookedHours, contributionPerHour, salesPerHour,
    contributionPerMinute, currentRevenuePerHour, averageTicket, rebooking, retention,
    productAttachment, serviceResults, healthScore, opportunities,
  };
}
