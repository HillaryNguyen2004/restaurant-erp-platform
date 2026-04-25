"use client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getTickets, updateItemStatus } from "@/app/services/chef.service";
import type { TicketItemStatus } from "@/app/types/chef.types";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { AlertCircle, CheckCircle2, Clock } from "lucide-react";

export default function ChefKDSPage() {
  const queryClient = useQueryClient();

  // Fetch tickets
  const { data: tickets, isLoading } = useQuery({
    queryKey: ["chef-tickets"],
    queryFn: getTickets,
    refetchInterval: 5 * 1000,
  });

  // Mutation
  const { mutate: updateStatus } = useMutation({
    mutationFn: ({
      ticketId,
      itemId,
      status,
    }: {
      ticketId: string;
      itemId: string;
      status: TicketItemStatus;
    }) => updateItemStatus(ticketId, itemId, status),

    // Refresh
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["chef-tickets"] });
    },
  });

  const nextStatus: Record<TicketItemStatus, TicketItemStatus | null> = {
    pending: "cooking",
    cooking: "started",
    started: "ready",
    ready: null,
  };

  const statusColor: Record<TicketItemStatus, string> = {
    pending: "bg-gray-100 text-gray-600",
    cooking: "bg-amber-100 text-amber-600",
    started: "bg-blue-100 text-blue-600",
    ready: "bg-emerald-100 text-emerald-600",
  };

  const priorityBorder: Record<string, string> = {
    normal: "border-gray-200",
    high: "border-amber-400",
    urgent: "border-rose-500",
  };

  if (isLoading)
    return (
      <div className="grid grid-cols-3 gap-4 p-6">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="h-64 rounded-xl bg-gray-100 animate-pulse" />
        ))}
      </div>
    );

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-6">
      {tickets?.length === 0 && (
        <p className="col-span-3 text-center text-gray-400 mt-20">
          No tickets yet. Waiting for orders to come in!
        </p>
      )}

      {tickets?.map((ticket) => (
        <Card
          key={ticket.id}
          className={cn("border-2", priorityBorder[ticket.priority])}
        >
          <CardHeader className="pb-2">
            <CardTitle className="flex justify-between text-base">
              <span>
                {ticket.table} — #{ticket.id}
              </span>
              <span className="flex items-center gap-1 text-sm text-gray-500">
                <Clock className="w-4 h-4" /> {ticket.elapsed}
              </span>
            </CardTitle>
          </CardHeader>

          <CardContent className="space-y-3">
            {ticket.items.map((item) => (
              <div
                key={item.id}
                className="p-2 rounded-lg bg-gray-50 space-y-1"
              >
                <div className="flex justify-between items-center">
                  <span className="font-medium text-sm">
                    x{item.qty} {item.name}
                  </span>
                  <Badge className={statusColor[item.status]}>
                    {item.status}
                  </Badge>
                </div>

                {item.note && (
                  <p className="text-xs text-rose-500 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" /> {item.note}
                  </p>
                )}

                {/* Button to move to the next status */}
                {nextStatus[item.status] && (
                  <Button
                    size="sm"
                    variant="outline"
                    className="w-full mt-1 text-xs"
                    onClick={() =>
                      updateStatus({
                        ticketId: ticket.id,
                        itemId: item.id,
                        status: nextStatus[item.status]!,
                      })
                    }
                  >
                    <CheckCircle2 className="w-3 h-3 mr-1" />
                    Move on to "{nextStatus[item.status]}"
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
