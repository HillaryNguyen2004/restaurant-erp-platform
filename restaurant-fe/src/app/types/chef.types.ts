export type TicketItemStatus = "pending" | "cooking" | "started" | "ready";
export type TicketPriority = "normal" | "high" | "urgent";

export type TicketItem = {
  id: string;
  name: string;
  qty: number;
  note: string;
  status: TicketItemStatus;
};

export type Ticket = {
  id: string;
  table: string;
  time: string;
  elapsed: string;
  priority: TicketPriority;
  items: TicketItem[];
};
