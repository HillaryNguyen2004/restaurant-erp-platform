'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { kdsApi } from '@/features/kds/data-access/kds.api';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { KitchenTicketStatus } from '@/features/kds/config/kds.config';
import { useRealtime } from '@/providers/realtime-provider';
import { toast } from 'sonner';
import { useAuth } from '@/features/auth/components/auth-provider';
import { LogOut } from 'lucide-react';

export default function KDSPage() {
  const queryClient = useQueryClient();
  const { emit } = useRealtime();
  const { logout } = useAuth();

  const { data: tickets, isLoading } = useQuery({
    queryKey: ['tickets'],
    queryFn: kdsApi.getTickets,
  });

  const mutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: KitchenTicketStatus }) =>
      kdsApi.updateTicketStatus(id, status),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['tickets'] });
      // Emit event for other roles (e.g., Customer needs to know status changed)
      emit('ORDER_STATUS_UPDATED', { orderId: data.orderId, status: data.status });
      toast.success(`Ticket updated to ${data.status}`);
    },
  });

  if (isLoading) return <div className="p-8">Loading Tickets...</div>;

  const getStatusColor = (status: KitchenTicketStatus) => {
    switch (status) {
      case 'PENDING': return 'bg-yellow-500';
      case 'IN_PROGRESS': return 'bg-blue-500';
      case 'READY': return 'bg-green-500';
      case 'COMPLETED': return 'bg-gray-500';
      default: return 'bg-red-500';
    }
  };

  return (
    <div className="p-4 h-screen flex flex-col">
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-4">
          <h1 className="text-3xl font-bold">Kitchen Display System</h1>
          <Button variant="ghost" size="icon" onClick={() => logout()} title="Logout">
            <LogOut className="w-5 h-5" />
          </Button>
        </div>
        <Badge variant="outline" className="text-lg py-1 px-3">
          {tickets?.filter(t => t.status !== 'COMPLETED').length} Active Tickets
        </Badge>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 overflow-y-auto">
        {tickets?.filter(t => t.status !== 'COMPLETED').map((ticket) => (
          <Card key={ticket.id} className="border-l-4 border-l-primary flex flex-col">
            <CardHeader className="pb-2">
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-xl">Table {ticket.tableNumber}</CardTitle>
                  <CardDescription>Order #{ticket.orderId.slice(-4)}</CardDescription>
                </div>
                <Badge className={getStatusColor(ticket.status)}>{ticket.status}</Badge>
              </div>
            </CardHeader>
            <CardContent className="flex-grow">
              <ul className="space-y-2">
                {ticket.items.map((item, idx) => (
                  <li key={idx} className="flex justify-between">
                    <span className="font-medium">{item.quantity}x {item.menuItemName}</span>
                    {item.specialInstructions && (
                      <span className="text-xs text-muted-foreground block italic">
                        {item.specialInstructions}
                      </span>
                    )}
                  </li>
                ))}
              </ul>
            </CardContent>
            <CardFooter className="pt-2 gap-2">
              {ticket.status === 'PENDING' && (
                <Button 
                  className="w-full" 
                  onClick={() => mutation.mutate({ id: ticket.id, status: 'IN_PROGRESS' })}
                >
                  Start Cooking
                </Button>
              )}
              {ticket.status === 'IN_PROGRESS' && (
                <Button 
                  className="w-full" 
                  variant="secondary"
                  onClick={() => mutation.mutate({ id: ticket.id, status: 'READY' })}
                >
                  Mark Ready
                </Button>
              )}
              {ticket.status === 'READY' && (
                <Button 
                  className="w-full" 
                  variant="outline"
                  onClick={() => mutation.mutate({ id: ticket.id, status: 'COMPLETED' })}
                >
                  Finish
                </Button>
              )}
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  );
}
