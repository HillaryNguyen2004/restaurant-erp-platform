'use client'; 

import { createContext, useContext, useEffect, ReactNode } from 'react';
import { CONFIG } from '@/lib/config';
import { useQueryClient } from '@tanstack/react-query';

import { useAuth } from '@/features/auth/components/auth-provider';

interface RealtimeContextType {
  emit: (event: string, data: unknown) => void;
}

const RealtimeContext = createContext<RealtimeContextType | undefined>(undefined);

export function RealtimeProvider({ children }: { children: ReactNode }) {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const role = user?.roles?.[0];

  useEffect(() => {
    if (CONFIG.IS_MOCK) {
      const handleStorageChange = (e: StorageEvent) => {
        if (e.key === 'realtime_event' && e.newValue) {
          const { event, data } = JSON.parse(e.newValue);
          processEvent(event, data);
        }
      };

      window.addEventListener('storage', handleStorageChange);
      return () => window.removeEventListener('storage', handleStorageChange);
    } else if (user) {
      // Real WebSocket implementation
      let wsPath = '/order-menu/ws/orders';
      if (role === 'CHEF' || role === 'KITCHEN_STAFF') {
        wsPath = '/kitchen-operation/ws/kds';
      }

      const socket = new WebSocket(`${CONFIG.WS_URL}${wsPath}`);
      socket.onmessage = (event) => {
        try {
          const payload = JSON.parse(event.data);
          // Backend uses 'eventType' for the name and 'data' for the body
          const eventName = payload.eventType || payload.event;
          const data = payload.data;
          
          if (eventName) {
            processEvent(eventName, data);
          }
        } catch (err) {
          console.error('[Realtime] Failed to parse message', err);
        }
      };
      socket.onerror = (err) => console.error('[Realtime] WebSocket error', err);
      
      return () => socket.close();
    }
  }, [queryClient, user, role]);

  const processEvent = (event: string, data: unknown) => {
    console.log(`[Realtime] Received event: ${event}`, data);
    
    // Dispatch a custom event for components to listen to
    window.dispatchEvent(new CustomEvent('realtime_event', { detail: { event, data } }));
    
    // Global invalidations based on event names
    switch (event) {
      case 'ORDER_STATUS_UPDATED':
      case 'NEW_ORDER_PLACED':
        queryClient.invalidateQueries({ queryKey: ['orders'] });
        break;
      case 'NEW_TICKET_CREATED':
        queryClient.invalidateQueries({ queryKey: ['tickets'] });
        break;
      case 'TABLE_STATUS_CHANGED':
        queryClient.invalidateQueries({ queryKey: ['tables'] });
        break;
      default:
        break;
    }
  };

  const emit = (event: string, data: unknown) => {
    if (CONFIG.IS_MOCK) {
      // In mock mode, we use localStorage to trigger events across tabs
      // We use a timestamp to ensure the value changes even if data is the same
      localStorage.setItem('realtime_event', JSON.stringify({
        event,
        data,
        timestamp: Date.now()
      }));
    } else {
      // Send via WebSocket (if needed, usually mutations go via REST API)
    }
  };

  return (
    <RealtimeContext.Provider value={{ emit }}>
      {children}
    </RealtimeContext.Provider>
  );
}

export function useRealtime() {
  const context = useContext(RealtimeContext);
  if (context === undefined) {
    throw new Error('useRealtime must be used within a RealtimeProvider');
  }
  return context;
}
