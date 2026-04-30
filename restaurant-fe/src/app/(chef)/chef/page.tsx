"use client";
import { useKitchenTickets, useUpdateItemStatus } from "@/features/kds/data-access/kds.queries";
import { KitchenTicket } from "@/features/kds/config/kds.config";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { AlertCircle, CheckCircle2, Clock } from "lucide-react";

type TicketItem = KitchenTicket['items'][number];

export default function ChefKDSPage() {
  const { data: tickets, isLoading } = useKitchenTickets();
  const updateStatusMutation = useUpdateItemStatus();

  const nextStatus: Record<string, string | null> = {
    "PENDING": "PREPARING",
    "PREPARING": "READY",
    "READY": "SERVED",
    "SERVED": null,
  };

  const statusColor: Record<string, string> = {
    "PENDING": "bg-gray-100 text-gray-600",
    "PREPARING": "bg-amber-100 text-amber-600",
    "READY": "bg-emerald-100 text-emerald-600",
    "SERVED": "bg-blue-100 text-blue-600",
  };

  if (isLoading)
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-6">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="h-64 rounded-xl bg-slate-900 animate-pulse" />
        ))}
      </div>
    );

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-6">
      {(!tickets || tickets.length === 0) && (
        <p className="col-span-full text-center text-slate-500 mt-20 italic">
          No active kitchen tickets.
        </p>
      )}

      {tickets?.map((ticket: KitchenTicket) => (
        <Card
          key={ticket.id}
          className="bg-slate-900 border-slate-800 text-slate-100 shadow-xl"
        >
          <CardHeader className="pb-2 border-b border-slate-800 mb-2">
            <CardTitle className="flex justify-between text-base">
              <span className="font-bold tracking-tight text-rose-500 uppercase">
                #{ticket.id.slice(-4)}
              </span>
              <span className="flex items-center gap-1 text-xs text-slate-400 font-medium">
                <Clock className="w-3 h-3 text-rose-500" /> {new Date(ticket.createdAt).toLocaleTimeString()}
              </span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 pt-2">
            {ticket.items.map((item: TicketItem) => (
              <div
                key={item.id}
                className="p-3 rounded-xl bg-slate-950/50 border border-slate-800/50 space-y-2 transition-colors hover:bg-slate-950"
              >
                <div className="flex justify-between items-start">
                  <div>
                    <span className="font-bold text-base block">
                      {item.quantity}x {item.name}
                    </span>
                    {item.note && (
                      <p className="text-xs text-rose-400 flex items-center gap-1 mt-1 font-medium bg-rose-950/20 p-1 rounded">
                        <AlertCircle className="w-3 h-3" /> {item.note}
                      </p>
                    )}
                  </div>
                  <Badge className={cn("border-none", statusColor[item.status])}>
                    {item.status}
                  </Badge>
                </div>

                {nextStatus[item.status] && (
                  <Button
                    size="sm"
                    variant="secondary"
                    className="w-full mt-2 text-xs font-bold bg-slate-800 hover:bg-rose-600 hover:text-white transition-all active:scale-95"
                    onClick={() =>
                      updateStatusMutation.mutate({
                        ticketId: ticket.id,
                        itemId: item.id,
                        status: nextStatus[item.status]!,
                      })
                    }
                    disabled={updateStatusMutation.isPending}
                  >
                    <CheckCircle2 className="w-3 h-3 mr-1" />
                    MOVE TO "{nextStatus[item.status]}"
                  </Button>
                )}
              </div>
            ))}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
