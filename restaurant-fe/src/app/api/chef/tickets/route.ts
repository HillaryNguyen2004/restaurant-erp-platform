import { Ticket } from "@/app/types/chef.types";

const MOCK_TICKETS: Ticket[] = [
  {
    id: "B12",
    table: "Bàn 06",
    time: "12:15",
    elapsed: "14m",
    priority: "high",
    items: [
      {
        id: "i1",
        name: "Phở Bò Đặc Biệt",
        qty: 2,
        note: "No onion",
        status: "cooking",
      },
      {
        id: "i2",
        name: "Bún Chả Hà Nội",
        qty: 1,
        note: "Extra meatballs",
        status: "pending",
      },
    ],
  },
  {
    id: "B15",
    table: "Bàn 01",
    time: "12:25",
    elapsed: "4m",
    priority: "normal",
    items: [
      {
        id: "i3",
        name: "Cơm Tấm Sườn Bì",
        qty: 3,
        note: "",
        status: "pending",
      },
    ],
  },
  {
    id: "B10",
    table: "Bàn 03",
    time: "12:05",
    elapsed: "24m",
    priority: "urgent",
    items: [
      {
        id: "i4",
        name: "Gỏi Cuốn Tôm Thịt",
        qty: 4,
        note: "Less herbs",
        status: "started",
      },
      {
        id: "i5",
        name: "Cà Phê Sữa Đá",
        qty: 2,
        note: "More ice",
        status: "ready",
      },
    ],
  },
];

export async function GET() {
  return Response.json(MOCK_TICKETS);
}
