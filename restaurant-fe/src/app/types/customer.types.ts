export type MenuItem = {
  id: number;
  name: string;
  price: number;
  category: string;
  image: string;
  tags: string[];
};

export type CartItem = {
  id: string;
  menuItemId: number;
  name: string;
  price: number;
  qty: number;
};

export type Cart = {
  items: CartItem[];
  total: number;
};

export type Order = {
  id: string;
  table: string;
  items: CartItem[];
  total: number;
  status: "pending" | "preparing" | "ready" | "completed";
  createdAt: string;
};
