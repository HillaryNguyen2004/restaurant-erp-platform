import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { ClipboardList, Clock } from 'lucide-react';
import { useOrdersBySession, useSessionByTable } from '../data-access/order.queries';
import { useAuth } from '@/features/auth/components/auth-provider';

export function ActiveOrdersSheet() {
  const { user } = useAuth();
  const { data: session } = useSessionByTable(user?.id);
  const sessionId = session?.orderSessionId;
  const { data: orders, isLoading } = useOrdersBySession(sessionId || '');

  const tableOrders = orders || [];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PLACED': return 'bg-blue-100 text-blue-700';
      case 'PREPARING': return 'bg-amber-100 text-amber-700';
      case 'READY': return 'bg-emerald-100 text-emerald-700';
      case 'SERVED': return 'bg-slate-100 text-slate-700';
      case 'CANCELLED': return 'bg-rose-100 text-rose-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="outline" className="gap-2">
          <ClipboardList className="w-4 h-4" />
          Orders
          {tableOrders.length > 0 && (
            <Badge variant="secondary" className="ml-1">
              {tableOrders.filter(o => o.status !== 'SERVED' && o.status !== 'CANCELLED').length}
            </Badge>
          )}
        </Button>
      </SheetTrigger>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>Order Status</SheetTitle>
        </SheetHeader>
        <div className="mt-8 space-y-6 overflow-y-auto max-h-[calc(100vh-100px)] px-3">
          {isLoading ? (
            <div className="text-center py-10">Loading orders...</div>
          ) : tableOrders.length === 0 ? (
            <div className="text-center py-10 text-muted-foreground italic">
              No active orders yet.
            </div>
          ) : (
            tableOrders.map((order) => (
              <div key={order.orderId} className="space-y-3 p-4 rounded-lg border bg-card">
                <div className="flex justify-between items-center">
                  <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                    #{order.orderId.slice(-6)}
                  </span>
                  <Badge className={`border-none ${getStatusColor(order.status)}`}>
                    {order.status}
                  </Badge>
                </div>

                <div className="space-y-2">
                  {order.items.map((item, idx) => (
                    <div key={idx} className="flex justify-between text-sm">
                      <span>{item.quantity}x {item.menuItemName}</span>
                      <span className="text-muted-foreground">${item.unitPrice * item.quantity}</span>
                    </div>
                  ))}
                </div>

                <Separator />

                <div className="flex justify-between items-center pt-1">
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Clock className="w-3 h-3" />
                    {new Date(order.placedAt).toLocaleTimeString()}
                  </div>
                  <div className="font-bold">Total: ${order.subtotal}</div>
                </div>
              </div>
            )).reverse() // Show newest first
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}
