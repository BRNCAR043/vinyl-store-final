export type CustomerDoc = {
  id: string;
  name: string;
  email: string;
  country: string;
  age: number | null;
  gender: string;
};

export type CustomerOrder = {
  userId: string;
  totalAmount: number;
  totalCost: number;
  totalProfit: number;
  createdAt: { seconds: number } | null;
};

export type CustomerAggregated = CustomerDoc & {
  totalOrders: number;
  totalSpent: number;
  averageOrderValue: number;
  lastPurchaseDate: Date | null;
};

export type CustomerKpiData = {
  totalCustomers: number;
  totalRevenue: number;
  averageCLV: number;
  topSpendingCustomer: CustomerAggregated | null;
  returningCustomersPercent: number;
  mostCommonCountry: string;
};

export type CountryRevenue = {
  country: string;
  revenue: number;
};

export type AgeDistribution = {
  range: string;
  count: number;
};

export type GenderDistribution = {
  gender: string;
  count: number;
};

export type PurchaseFrequency = {
  range: string;
  count: number;
};

export type CustomerSortKey =
  | "name"
  | "email"
  | "country"
  | "age"
  | "gender"
  | "totalOrders"
  | "totalSpent"
  | "averageOrderValue"
  | "lastPurchaseDate";

export type CustomerSortConfig = {
  key: CustomerSortKey;
  direction: "asc" | "desc";
};
