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
    return readCachedOrders();
  }

  async placeOrder(order: Omit<Order, 'id' | 'createdAt' | 'status'>): Promise<Order> {
    const sessionId = await getOrOpenOrderSession(CONFIG.DEFAULT_TABLE_ID);
    const response = await fetch(`${CONFIG.API_URL}/order-menu/order-sessions/${sessionId}/orders`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        items: order.items.map((item) => ({
          menuItemId: item.menuItemId,
          quantity: item.quantity,
          modifiers: [],
          specialInstructions: item.specialInstructions ?? '',
        })),
      }),
    });
    if (!response.ok) throw new Error('Failed to place order');
    const createdOrder = mapOrder(await response.json(), order);
    cacheOrder(createdOrder);
    return createdOrder;
  }

  async updateStatus(orderId: string, status: OrderStatus): Promise<Order> {
    const orders = readCachedOrders();
    const order = orders.find((candidate) => candidate.id === orderId);
    if (!order) throw new Error('Order not found');
    order.status = status;
    localStorage.setItem('real_orders', JSON.stringify(orders));
    return order;
  }
}

export const orderApi: IOrderApi = CONFIG.IS_MOCK ? new MockOrderApi() : new RealOrderApi();

async function getOrOpenOrderSession(tableId: string): Promise<string> {
  const key = `real_order_session:${tableId}`;
  const saved = localStorage.getItem(key);
  if (saved) return saved;

  const response = await fetch(`${CONFIG.API_URL}/order-menu/order-sessions`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ tableId }),
  });
  if (!response.ok) throw new Error('Failed to open order session');
  const session = await response.json();
  localStorage.setItem(key, session.sessionId);
  return session.sessionId;
}

type BackendOrder = {
  orderId: string;
  status: OrderStatus;
  placedAt: string;
  subtotal: number | string;
  items: BackendOrderItem[];
};

type BackendOrderItem = {
  itemId: string;
  menuItemId: string;
  quantity: number;
  unitPrice?: number | string;
  specialInstructions?: string | null;
};

function mapOrder(
  backendOrder: BackendOrder,
  originalOrder: Omit<Order, 'id' | 'createdAt' | 'status'>,
): Order {
  const items = backendOrder.items.map((item) => {
    const original = originalOrder.items.find(
      (candidate) => candidate.menuItemId === item.menuItemId,
    );
    return {
      id: item.itemId,
      menuItemId: item.menuItemId,
      menuItemName: original?.menuItemName ?? item.menuItemId,
      quantity: item.quantity,
      price: Number(item.unitPrice ?? original?.price ?? 0),
      specialInstructions: item.specialInstructions ?? undefined,
    };
  });

  return {
    id: backendOrder.orderId,
    tableNumber: originalOrder.tableNumber,
    status: backendOrder.status,
    items,
    total: Number(backendOrder.subtotal),
    createdAt: backendOrder.placedAt,
  };
}

function readCachedOrders(): Order[] {
  if (typeof window === 'undefined') return [];
  const saved = localStorage.getItem('real_orders');
  return saved ? JSON.parse(saved) : [];
}

function cacheOrder(order: Order): void {
  const orders = readCachedOrders();
  orders.push(order);
  localStorage.setItem('real_orders', JSON.stringify(orders));
}
