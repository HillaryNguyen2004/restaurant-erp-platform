export const CONFIG = {
  IS_MOCK: process.env.NEXT_PUBLIC_IS_MOCK === 'true' || true, // Default to true for now as requested
  API_URL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000',
  WS_URL: process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:3000',
};

export type Role = 'CUSTOMER' | 'CHEF' | 'CASHIER' | 'ADMIN';
