export async function GET() {
  const data = [
    {
      id: 1,
      name: "Phở Bò Đặc Biệt",
      sales: 320,
      revenue: 25600000,
      trend: "up",
    },
    { id: 2, name: "Bún Bò Huế", sales: 280, revenue: 19600000, trend: "up" },
    {
      id: 3,
      name: "Cơm Tấm Sườn Bì",
      sales: 245,
      revenue: 17150000,
      trend: "down",
    },
    {
      id: 4,
      name: "Bánh Mì Thịt Nướng",
      sales: 198,
      revenue: 9900000,
      trend: "up",
    },
    { id: 5, name: "Chè Ba Màu", sales: 170, revenue: 5100000, trend: "down" },
  ];

  return Response.json(data);
}
