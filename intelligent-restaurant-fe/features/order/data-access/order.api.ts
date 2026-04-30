import { CONFIG } from '@/lib/config';
import { Order, OrderStatus } from '../config/order.config';
import { KitchenTicket } from '@/features/kds/config/kds.config';

export interface IOrderApi {
  getOrders(): Promise<Order[]>;
  placeOrder(order: Omit<Order, 'id' | 'createdAt' | 'status'>): Promise<Order>;
  updateStatus(orderId: string, status: OrderStatus): Promise<Order>;
}

class MockOrderApi implements IOrderApi {
  async getOrders(): Promise<Order[]> {
    const saved = localStorage.getItem('mock_orders');
    return saved ? JSON.parse(saved) : [];
  }

  async placeOrder(order: Omit<Order, 'id' | 'createdAt' | 'status'>): Promise<Order> {
    const newOrder: Order = {
      ...order,
      id: `ord-${Math.random().toString(36).substr(2, 9)}`,
      status: 'PLACED',
      createdAt: new Date().toISOString(),
    };
    const saved = localStorage.getItem('mock_orders');
    const orders = saved ? JSON.parse(saved) : [];
    orders.push(newOrder);
    localStorage.setItem('mock_orders', JSON.stringify(orders));
    return newOrder;
  }

  async updateStatus(orderId: string, status: OrderStatus): Promise<Order> {
    const saved = localStorage.getItem('mock_orders');
    const orders = saved ? JSON.parse(saved) : [];
    const order = orders.find((o: Order) => o.id === orderId);
    if (order) {
      order.status = status;
      
      // Sync with mock_tickets for consistency
      if (status === 'CANCELLED') {
        const savedTickets = localStorage.getItem('mock_tickets');
        if (savedTickets) {
          const tickets = JSON.parse(savedTickets);
          const ticket = tickets.find((t: KitchenTicket) => t.orderId === orderId);
          if (ticket) {
            ticket.status = 'CANCELLED';
            localStorage.setItem('mock_tickets', JSON.stringify(tickets));
          }
        }
      }
    }
    localStorage.setItem('mock_orders', JSON.stringify(orders));
    return order;
  }
}

class RealOrderApi implements IOrderApi {
  async getOrders(): Promise<Order[]> {
    const response = await fetch(`${CONFIG.API_URL}/orders`);
    return response.json();
  }

  async placeOrder(order: Omit<Order, 'id' | 'createdAt' | 'status'>): Promise<Order> {
    const response = await fetch(`${CONFIG.API_URL}/orders`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(order),
    });
    return response.json();
  }

  async updateStatus(orderId: string, status: OrderStatus): Promise<Order> {
    const response = await fetch(`${CONFIG.API_URL}/orders/${orderId}/status`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    });
    return response.json();
  }
}

export const orderApi: IOrderApi = CONFIG.IS_MOCK ? new MockOrderApi() : new RealOrderApi();
