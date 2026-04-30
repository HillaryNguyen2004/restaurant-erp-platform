import { CONFIG } from '@/lib/config';
import { User, Role } from '../config/auth.config';

export interface IAuthApi {
  login(email: string, password: string): Promise<{ user: User; token: string }>;
}

const MOCK_USERS: Record<string, User & { password: string }> = {
  'customer@example.com': {
    id: 'u1',
    email: 'customer@example.com',
    name: 'Mock Customer',
    roles: ['CUSTOMER'],
    password: 'password'
  },
  'chef@example.com': {
    id: 'u2',
    email: 'chef@example.com',
    name: 'Mock Chef',
    roles: ['CHEF'],
    password: 'password'
  },
  'cashier@example.com': {
    id: 'u3',
    email: 'cashier@example.com',
    name: 'Mock Cashier',
    roles: ['CASHIER'],
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
