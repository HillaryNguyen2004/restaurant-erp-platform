import { CONFIG } from '@/lib/config';
import { User, Role } from '../config/auth.config';

export interface IAuthApi {
  login(email: string, password: string): Promise<{ user: User; token: string }>;
}

const MOCK_USERS: Record<string, User & { password: string }> = {
  'table1@example.com': {
    id: 'u1',
    email: 'table1@example.com',
    name: 'Table 1',
    roles: ['TABLE'],
    password: 'password'
  },
  'table2@example.com': {
    id: 'u1.2',
    email: 'table2@example.com',
    name: 'Table 2',
    roles: ['TABLE'],
    password: 'password'
  },
  'kitchen@example.com': {
    id: 'u2',
    email: 'kitchen@example.com',
    name: 'Kitchen Staff',
    roles: ['KITCHEN_STAFF'],
    password: 'password'
  },
  'cashier@example.com': {
    id: 'u3',
    email: 'cashier@example.com',
    name: 'Mock Cashier',
    roles: ['CASHIER'],
    password: 'password'
  },
  'staff@example.com': {
    id: 'u5',
    email: 'staff@example.com',
    name: 'Table Staff',
    roles: ['TABLE_STAFF'],
    password: 'password'
  },
  'admin@example.com': {
    id: 'u4',
    email: 'admin@example.com',
    name: 'Mock Admin',
    roles: ['ADMIN'],
    password: 'password'
  }
};

class MockAuthApi implements IAuthApi {
  async login(email: string, password: string): Promise<{ user: User; token: string }> {
    await new Promise(resolve => setTimeout(resolve, 500));
    const user = MOCK_USERS[email];
    if (user && user.password === password) {
      const { password: _, ...userWithoutPassword } = user;
      return { user: userWithoutPassword, token: 'mock-token' };
    }
    throw new Error('Invalid email or password');
  }
}

class RealAuthApi implements IAuthApi {
  async login(email: string, password: string): Promise<{ user: User; token: string }> {
    const response = await fetch(`${CONFIG.API_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    if (!response.ok) throw new Error('Login failed');
    return response.json();
  }
}

export const authApi: IAuthApi = CONFIG.IS_MOCK ? new MockAuthApi() : new RealAuthApi();
