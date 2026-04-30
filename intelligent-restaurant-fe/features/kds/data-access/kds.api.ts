import { CONFIG } from '@/lib/config';
import { KitchenTicket, KitchenTicketStatus } from '../config/kds.config';
import { Order } from '@/features/order/config/order.config';

export interface IKdsApi {
  getTickets(): Promise<KitchenTicket[]>;
  updateTicketStatus(ticketId: string, status: KitchenTicketStatus): Promise<KitchenTicket>;
  createTicketFromOrder(order: Order): Promise<KitchenTicket>;
}

class MockKdsApi implements IKdsApi {
  async getTickets(): Promise<KitchenTicket[]> {
    const saved = localStorage.getItem('mock_tickets');
    return saved ? JSON.parse(saved) : [];
  }

  async updateTicketStatus(ticketId: string, status: KitchenTicketStatus): Promise<KitchenTicket> {
    const saved = localStorage.getItem('mock_tickets');
    const tickets = saved ? JSON.parse(saved) : [];
    const ticket = tickets.find((t: KitchenTicket) => t.id === ticketId);
    if (ticket) {
      ticket.status = status;
      
      // Sync with mock_orders for consistency in mock mode
      const savedOrders = localStorage.getItem('mock_orders');
      if (savedOrders) {
        const orders = JSON.parse(savedOrders);
        const order = orders.find((o: Order) => o.id === ticket.orderId);
        if (order) {
          if (status === 'IN_PROGRESS') order.status = 'PREPARING';
          else if (status === 'READY') order.status = 'READY';
          else if (status === 'COMPLETED') order.status = 'SERVED';
          else if (status === 'CANCELLED') order.status = 'CANCELLED';
          localStorage.setItem('mock_orders', JSON.stringify(orders));
        }
      }
    }
    localStorage.setItem('mock_tickets', JSON.stringify(tickets));
    return ticket;
  }

  async createTicketFromOrder(order: Order): Promise<KitchenTicket> {
    const newTicket: KitchenTicket = {
      id: `tk-${Math.random().toString(36).substr(2, 9)}`,
      orderId: order.id,
      tableNumber: order.tableNumber,
      status: 'PENDING',
      items: order.items,
      priority: 1,
      prepTimeMinutes: 15,
      createdAt: new Date().toISOString(),
    };
    const saved = localStorage.getItem('mock_tickets');
    const tickets = saved ? JSON.parse(saved) : [];
    tickets.push(newTicket);
    localStorage.setItem('mock_tickets', JSON.stringify(tickets));
    return newTicket;
  }
}

class RealKdsApi implements IKdsApi {
  async getTickets(): Promise<KitchenTicket[]> {
    const response = await fetch(`${CONFIG.API_URL}/kds/tickets`);
    return response.json();
  }

  async updateTicketStatus(ticketId: string, status: KitchenTicketStatus): Promise<KitchenTicket> {
    const response = await fetch(`${CONFIG.API_URL}/kds/tickets/${ticketId}/status`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    });
    return response.json();
  }

  async createTicketFromOrder(order: Order): Promise<KitchenTicket> {
    const response = await fetch(`${CONFIG.API_URL}/kds/tickets`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ orderId: order.id }),
    });
    return response.json();
  }
}

export const kdsApi: IKdsApi = CONFIG.IS_MOCK ? new MockKdsApi() : new RealKdsApi();
