export async function GET() {
  const data = {
    dailyRevenue: 12450000,
    dailyRevenueChange: "+12.5%",
    newOrders: 148,
    newOrdersChange: "+8.2%",
    customers: 2150,
    customersChange: "+2.1%",
    outOfStock: 4,
    outOfStockChange: "-2 items",
  };

  return Response.json(data);
}
