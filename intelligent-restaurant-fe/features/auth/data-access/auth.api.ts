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
      const userWithoutPassword: User = {
        id: user.id,
        email: user.email,
        name: user.name,
        roles: user.roles,
      };
      return { user: userWithoutPassword, token: 'mock-token' };
    }
    throw new Error('Invalid email or password');
  }
}

class RealAuthApi implements IAuthApi {
  async login(email: string, password: string): Promise<{ user: User; token: string }> {
    const response = await fetch(`${CONFIG.API_URL}/user-management/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    if (!response.ok) throw new Error('Login failed');
    const data = await response.json();
    const token = data.accessToken ?? data.token;
    const payload = decodeJwtPayload(token);
    const roles = mapBackendRoles(payload.roles);

    return {
      token,
      user: {
        id: payload.sub ?? email,
        email: payload.email ?? email,
        name: payload.email ?? email,
        roles,
      },
    };
  }
}

export const authApi: IAuthApi = CONFIG.IS_MOCK ? new MockAuthApi() : new RealAuthApi();

type AuthTokenPayload = {
  sub?: string;
  email?: string;
  roles?: string[];
};

function decodeJwtPayload(token: string): AuthTokenPayload {
  if (!token) return {};
  const [, payload] = token.split('.');
  if (!payload) return {};

  return JSON.parse(atob(payload.replace(/-/g, '+').replace(/_/g, '/')));
}

function mapBackendRoles(roles: string[] | undefined): Role[] {
  if (!roles || roles.length === 0) return ['TABLE'];

  return roles.map((role) => {
    if (role === 'CHEF') return 'KITCHEN_STAFF';
    if (role === 'SERVER' || role === 'MANAGER') return 'TABLE_STAFF';
    if (role === 'CASHIER') return 'CASHIER';
    if (role === 'ADMIN') return 'ADMIN';
    return 'TABLE';
  });
}
