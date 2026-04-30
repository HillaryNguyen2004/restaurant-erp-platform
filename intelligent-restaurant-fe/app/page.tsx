'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/features/auth/components/auth-provider';

export default function HomePage() {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading) {
      if (!user) {
        router.push('/login');
      } else {
        const role = user?.roles?.[0];
        if (role === 'TABLE') router.push('/menu');
        else if (role === 'KITCHEN_STAFF') router.push('/kds');
        else if (role === 'CASHIER') router.push('/billing');
        else if (role === 'TABLE_STAFF') router.push('/tables');
        else if (role === 'ADMIN') router.push('/analytics');
        else router.push('/login'); // Fallback if no roles
      }
    }
  }, [user, isLoading, router]);

  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="animate-pulse text-xl font-medium">Loading...</div>
    </div>
  );
}
