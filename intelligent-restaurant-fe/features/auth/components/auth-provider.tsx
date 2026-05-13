'use client';

import { usePathname, useRouter } from 'next/navigation';
import { createContext, useContext, useEffect, useState } from 'react';
import { toast } from 'sonner';
import { Role, User } from '../config/auth.config';
import { authQueries } from '../data-access/auth.queries';

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  hasRole: (roles: Role[]) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const { mutateAsync: useLogin, error: loginError } = authQueries.useLogin();
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    // Restore session
    const savedAuth = localStorage.getItem('auth_user');
    if (savedAuth) {
      const { user } = JSON.parse(savedAuth);
      setUser(user);
    }
    setIsLoading(false);
  }, []);

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      const newUser = await useLogin({
        email, password
      });
      setUser(newUser.user);
      localStorage.setItem('auth_user', JSON.stringify(newUser));

      // Redirect based on role
      const role = newUser.user.roles[0];
      if (role === 'TABLE') router.push('/menu');
      else if (role === 'KITCHEN_STAFF' || role === 'CHEF') router.push('/kds');
      else if (role === 'CASHIER') router.push('/billing');
      else if (role === 'TABLE_STAFF' || role === 'SERVER') router.push('/tables');
      else if (role === 'ADMIN' || role === 'MANAGER') router.push('/analytics');
    } catch (error) {
      toast.error('Login failed. Please check your credentials.');
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('auth_user');
    router.push('/login');
  };

  const hasRole = (roles: Role[]) => {
    if (!user || !user.roles) return false;
    return user.roles.some((r) => roles.includes(r as Role));
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, login, logout, hasRole }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
