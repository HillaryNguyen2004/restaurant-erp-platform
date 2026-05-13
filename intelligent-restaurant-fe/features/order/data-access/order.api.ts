import { CONFIG } from '@/lib/config';
import { Order, OrderStatus } from '../config/order.config';

export interface IOrderApi {
  getOrdersBySession(sessionId: string): Promise<Order[]>;
  getSessionByTable(tableId: string): Promise<any>;
  placeOrder(sessionId: string, items: any[]): Promise<Order>;
  cancelOrder(sessionId: string, orderId: string, reason: string): Promise<void>;
}

const API_URL = `${CONFIG.API_URL}/order-menu`

class RealOrderApi implements IOrderApi {
  async getOrdersBySession(sessionId: string): Promise<Order[]> {
    const response = await fetch(`${API_URL}/order-sessions/${sessionId}`);
    if (!response.ok) throw new Error("Failed to fetch order session");
    const data = await response.json();
    return data.orders || [];
  }

  async getSessionByTable(tableId: string): Promise<any> {
    const response = await fetch(`${API_URL}/order-sessions/table/${tableId}`);
    if (!response.ok) throw new Error("No active session for table");
    return response.json();
  }

  async placeOrder(sessionId: string, items: any[]): Promise<Order> {
    const response = await fetch(`${API_URL}/order-sessions/${sessionId}/orders`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ items }),
    });
    if (!response.ok) throw new Error("Failed to place order");
    return response.json();
  }

  async cancelOrder(sessionId: string, orderId: string, reason: string): Promise<void> {
    const response = await fetch(`${API_URL}/order-sessions/${sessionId}/orders/${orderId}/cancel`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(reason),
    });
    if (!response.ok) throw new Error("Failed to cancel order");
  }
}

export const orderApi: IOrderApi = new RealOrderApi();
