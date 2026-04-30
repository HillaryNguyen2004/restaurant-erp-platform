'use client'; 

import { createContext, useContext, useEffect, ReactNode } from 'react';
import { CONFIG } from '@/lib/config';
import { useQueryClient } from '@tanstack/react-query';

interface RealtimeContextType {
  emit: (event: string, data: unknown) => void;
}

const RealtimeContext = createContext<RealtimeContextType | undefined>(undefined);

export function RealtimeProvider({ children }: { children: ReactNode }) {
  const queryClient = useQueryClient();

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
    } else {
      // Real WebSocket implementation
      const socket = new WebSocket(CONFIG.WS_URL);
      socket.onmessage = (event) => {
        const { event: eventName, data } = JSON.parse(event.data);
        processEvent(eventName, data);
      };
      return () => socket.close();
    }
  }, [queryClient]);

  const processEvent = (event: string, data: unknown) => {
    console.log(`[Realtime] Received event: ${event}`, data);
    
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
