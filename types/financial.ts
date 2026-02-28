export type MonthlyFinancialData = {
  month: string;
  revenue: number;
  cost: number;
  profit: number;
};

export type KpiData = {
  totalRevenue: number;
  totalCost: number;
  grossProfit: number;
  grossMarginPercent: number;
  averageOrderValue: number;
};

export type SortDirection = "asc" | "desc";

export type SortConfig = {
  key: keyof MonthlyFinancialData;
  direction: SortDirection;
};

export type FilterRange = "3" | "6" | "12";
