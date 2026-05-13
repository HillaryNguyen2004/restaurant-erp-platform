import { CONFIG } from '@/lib/config';
import { User } from '../config/auth.config';

export interface IAuthResponse {
  accessToken: string;
  refreshToken: string;
}

export interface IAuthApi {
  login(email: string, password: string): Promise<{ user: User; tokens: IAuthResponse }>;
}

const API_URL = `${CONFIG.API_URL}/user-management`

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

function decodeJwt(token: string) {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      window.atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    return JSON.parse(jsonPayload);
  } catch (e) {
    console.error('Failed to decode JWT', e);
    return null;
  }
}

class MockAuthApi implements IAuthApi {
  async login(email: string, password: string): Promise<{ user: User; tokens: IAuthResponse }> {
    await new Promise(resolve => setTimeout(resolve, 500));
    const user = MOCK_USERS[email];
    if (user && user.password === password) {
      const { password: _, ...userWithoutPassword } = user;
      return { 
        user: userWithoutPassword, 
        tokens: { accessToken: 'mock-access', refreshToken: 'mock-refresh' } 
      };
    }
    throw new Error('Invalid email or password');
  }
}

class RealAuthApi implements IAuthApi {
  async login(email: string, password: string): Promise<{ user: User; tokens: IAuthResponse }> {
    const response = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    if (!response.ok) throw new Error('Login failed');
    const tokens: IAuthResponse = await response.json();
    
    const payload = decodeJwt(tokens.accessToken);
    if (!payload) throw new Error('Invalid token received');

    const user: User = {
      id: payload.sub,
      email: payload.email,
      name: payload.email.split('@')[0], // Fallback name
      roles: payload.roles,
    };

    return { user, tokens };
  }
}

export const authApi: IAuthApi = CONFIG.IS_MOCK ? new MockAuthApi() : new RealAuthApi();
