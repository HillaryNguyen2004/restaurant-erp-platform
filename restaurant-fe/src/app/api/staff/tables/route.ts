import { Table } from "@/app/types/staff.types";

export const tableStore = {
  tables: [
    {
      id: "T1",
      number: 1,
      status: "occupied",
      capacity: 4,
      orders: 3,
      time: "45m",
    },
    {
      id: "T2",
      number: 2,
      status: "available",
      capacity: 2,
      orders: 0,
      time: "-",
    },
    {
      id: "T3",
      number: 3,
      status: "occupied",
      capacity: 6,
      orders: 5,
      time: "12m",
    },
    {
      id: "T4",
      number: 4,
      status: "cleaning",
      capacity: 4,
      orders: 0,
      time: "-",
    },
    {
      id: "T5",
      number: 5,
      status: "reserved",
      capacity: 2,
      orders: 0,
      time: "19:00",
    },
    {
      id: "T6",
      number: 6,
      status: "occupied",
      capacity: 4,
      orders: 2,
      time: "1h 10m",
      alert: true,
    },
    {
      id: "T7",
      number: 7,
      status: "available",
      capacity: 4,
      orders: 0,
      time: "-",
    },
    {
      id: "T8",
      number: 8,
      status: "occupied",
      capacity: 8,
      orders: 12,
      time: "30m",
    },
  ] as Table[],
};

export async function GET() {
  return Response.json(tableStore.tables);
}
