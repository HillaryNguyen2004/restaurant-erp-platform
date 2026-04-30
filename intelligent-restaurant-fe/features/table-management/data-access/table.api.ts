import { CONFIG } from '@/lib/config';
import { Table, TableStatus } from '../config/table.config';

export interface ITableApi {
  getTables(): Promise<Table[]>;
  updateTableStatus(tableId: string, status: TableStatus): Promise<Table>;
}

class MockTableApi implements ITableApi {
  async getTables(): Promise<Table[]> {
    const saved = localStorage.getItem('mock_tables');
    if (saved) return JSON.parse(saved);

    const initialTables: Table[] = [
      { id: 't1', tableNumber: '1', capacity: 4, status: 'AVAILABLE' },
      { id: 't2', tableNumber: '2', capacity: 2, status: 'OCCUPIED' },
      { id: 't3', tableNumber: '3', capacity: 6, status: 'RESERVED' },
      { id: 't4', tableNumber: '4', capacity: 4, status: 'AVAILABLE' },
    ];
    localStorage.setItem('mock_tables', JSON.stringify(initialTables));
    return initialTables;
  }

  async updateTableStatus(tableId: string, status: TableStatus): Promise<Table> {
    const saved = localStorage.getItem('mock_tables');
    const tables = saved ? JSON.parse(saved) : [];
    const table = tables.find((t: Table) => t.id === tableId);
    if (table) table.status = status;
    localStorage.setItem('mock_tables', JSON.stringify(tables));
    return table;
  }
}

class RealTableApi implements ITableApi {
  async getTables(): Promise<Table[]> {
    const response = await fetch(`${CONFIG.API_URL}/tables`);
    return response.json();
  }

  async updateTableStatus(tableId: string, status: TableStatus): Promise<Table> {
    const response = await fetch(`${CONFIG.API_URL}/tables/${tableId}/status`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    });
    return response.json();
  }
}

export const tableApi: ITableApi = CONFIG.IS_MOCK ? new MockTableApi() : new RealTableApi();
