export type TableStatus = "available" | "occupied" | "cleaning" | "reserved";

export type Table = {
  id: string;
  number: number;
  status: TableStatus;
  capacity: number;
  orders: number;
  time: string;
  alert?: boolean;
};

export type StaffOrderItem = {
  menuItemId: number;
  name: string;
  price: number;
  qty: number;
};

export type StaffOrder = {
  id: string;
  tableId: string;
  tableNumber: number;
  items: StaffOrderItem[];
  total: number;
  status: "pending" | "preparing" | "ready" | "completed";
  createdAt: string;
};
