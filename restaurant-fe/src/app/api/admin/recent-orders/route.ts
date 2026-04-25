export async function GET() {
  const data = [
    {
      id: "ORD-001",
      table: "Table 01",
      items: 3,
      total: 450000,
      status: "completed",
      time: "08:32",
    },
    {
      id: "ORD-002",
      table: "Table 05",
      items: 5,
      total: 780000,
      status: "pending",
      time: "08:45",
    },
    {
      id: "ORD-003",
      table: "Table 03",
      items: 2,
      total: 220000,
      status: "completed",
      time: "09:01",
    },
    {
      id: "ORD-004",
      table: "Table 08",
      items: 4,
      total: 560000,
      status: "preparing",
      time: "09:15",
    },
    {
      id: "ORD-005",
      table: "Table 02",
      items: 6,
      total: 920000,
      status: "pending",
      time: "09:22",
    },
  ];

  return Response.json(data);
}
