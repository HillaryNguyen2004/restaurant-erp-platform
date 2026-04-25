import { MenuItem } from "@/app/types/customer.types";

const MOCK_MENU: MenuItem[] = [
  {
    id: 1,
    name: "Phở Bò Đặc Biệt",
    price: 85000,
    category: "Soup",
    image:
      "https://images.unsplash.com/photo-1582878826629-29b7ad1cdc43?w=400&q=80",
    tags: ["Bestseller", "Gluten-Free"],
  },
  {
    id: 2,
    name: "Cơm Tấm Sườn Bì",
    price: 65000,
    category: "Rice",
    image:
      "https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=400&q=80",
    tags: [],
  },
  {
    id: 3,
    name: "Bún Chả Hà Nội",
    price: 75000,
    category: "Noodles",
    image:
      "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400&q=80",
    tags: ["Special"],
  },
  {
    id: 4,
    name: "Gỏi Cuốn Tôm Thịt",
    price: 45000,
    category: "Appetizer",
    image:
      "https://plus.unsplash.com/premium_photo-1663850685017-10929f5f5409?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8NXx8Z29pJTIwY3VvbnxlbnwwfHwwfHx8MA%3D%3D",
    tags: ["Healthy"],
  },
  {
    id: 5,
    name: "Bánh Mì Thịt Nướng",
    price: 35000,
    category: "Sandwich",
    image:
      "https://images.unsplash.com/photo-1677138164658-c7cc1dae4cb2?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8NHx8QiVDMyVBMW5oJTIwbSVDMyVBQyUyMHRoJUUxJUJCJThCdHxlbnwwfHwwfHx8MA%3D%3D",
    tags: ["Bestseller"],
  },
  {
    id: 6,
    name: "Cà Phê Sữa Đá",
    price: 29000,
    category: "Beverage",
    image:
      "https://images.unsplash.com/photo-1461023058943-07fcbe16d735?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTh8fGNvZmZlZXxlbnwwfHwwfHx8MA%3D%3D0",
    tags: [],
  },
];

export async function GET() {
  return Response.json(MOCK_MENU);
}

export { MOCK_MENU };
