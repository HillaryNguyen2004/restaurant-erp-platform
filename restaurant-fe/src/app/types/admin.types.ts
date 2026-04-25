// types/admin.types.ts

export type AdminStats = {
  dailyRevenue: number;
  dailyRevenueChange: string;
  newOrders: number;
  newOrdersChange: string;
  customers: number;
  customersChange: string;
  outOfStock: number;
  outOfStockChange: string;
};

export type TopItem = {
  id: number;
  name: string;
  sales: number;
  revenue: number;
  trend: "up" | "down";
};

export type RecentOrder = {
  id: string;
  table: string;
  items: number;
  total: number;
  status: "completed" | "pending" | "preparing";
  time: string;
};
