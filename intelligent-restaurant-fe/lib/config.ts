export const CONFIG = {
  IS_MOCK: false, // Default to true for now as requested
  API_URL: 'http://localhost:8000',
  WS_URL: 'ws://localhost:8000',
};

export type Role = 'TABLE' | 'KITCHEN_STAFF' | 'CASHIER' | 'TABLE_STAFF' | 'ADMIN';
