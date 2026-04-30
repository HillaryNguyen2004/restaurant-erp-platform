'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuth } from '@/features/auth/components/auth-provider';
import { kdsApi } from '@/features/kds/data-access/kds.api';
import { ItemDialog } from '@/features/menu/components/item-dialog';
import { MenuCard } from '@/features/menu/components/menu-card';
import { MenuItem } from '@/features/menu/config/menu.config';
import { menuQueries } from '@/features/menu/data-access/menu.queries';
import { ActiveOrdersSheet } from '@/features/order/components/active-orders-sheet';
import { OrderItem } from '@/features/order/config/order.config';
import { orderQueries } from '@/features/order/data-access/order.queries';
import { useRealtime } from '@/providers/realtime-provider';
import { useQueryClient } from '@tanstack/react-query';
import { Loader2, LogOut, ShoppingCart } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';

export default function MenuPage() {
  const queryClient = useQueryClient();
  const { emit } = useRealtime();
  const { logout } = useAuth();
  const [cart, setCart] = useState<OrderItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<MenuItem | null>(null);

  const { data: categories, isLoading: isLoadingCats } = menuQueries.useCategories();
  const { data: items, isLoading: isLoadingItems } = menuQueries.useItems();
  const placeOrderMutation = orderQueries.usePlaceOrder();

  const handlePlaceOrder = () => {
    if (cart.length === 0) return;

    placeOrderMutation.mutate({
      tableNumber: 'A1',
      items: cart,
      total: cart.reduce((acc, item) => acc + item.price * item.quantity, 0),
    }, {
      onSuccess: async (order) => {
        // Mock KDS integration
        await kdsApi.createTicketFromOrder(order);

        toast.success('Order placed successfully!');
        setCart([]);
        setIsCartOpen(false);
        emit('NEW_ORDER_PLACED', order);
        emit('NEW_TICKET_CREATED', order);
      }
    });
  };

  const onConfirmAdd = (quantity: number, note: string) => {
    if (!selectedItem) return;

    setCart((prev) => {
      const existing = prev.find((i) => i.menuItemId === selectedItem.id);
      if (existing) {
        return prev.map((i) =>
          i.menuItemId === selectedItem.id ? { ...i, quantity: i.quantity + quantity, specialInstructions: note } : i
        );
      }
      return [
        ...prev,
        {
          id: Math.random().toString(),
          menuItemId: selectedItem.id,
          menuItemName: selectedItem.name,
          quantity: quantity,
          price: selectedItem.price,
          specialInstructions: note,
        },
      ];
    });

    toast.success(`Added ${quantity}x ${selectedItem.name} to cart`);
    setSelectedItem(null);
  };

  if (isLoadingCats || isLoadingItems) {
    return (
      <div className="container mx-auto p-4 space-y-4">
        <Skeleton className="h-10 w-64" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-48 w-full" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-8">
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-4">
          <h1 className="text-3xl font-bold">Our Menu</h1>
          <Button variant="ghost" size="icon" onClick={logout} title="Logout">
            <LogOut className="w-5 h-5" />
          </Button>
        </div>

        <div className="flex items-center gap-2">
          <ActiveOrdersSheet />

          <Sheet open={isCartOpen} onOpenChange={setIsCartOpen}>
            <SheetTrigger asChild>
              <Button variant="outline" className="relative gap-2">
                <ShoppingCart className="w-4 h-4" />
                Cart
                {cart.length > 0 && (
                  <Badge className="absolute -top-2 -right-2 px-2 py-1 rounded-full text-[10px]">
                    {cart.reduce((acc, i) => acc + i.quantity, 0)}
                  </Badge>
                )}
              </Button>
            </SheetTrigger>
            <SheetContent>
              <SheetHeader>
                <SheetTitle>Your Cart</SheetTitle>
              </SheetHeader>
              <div className="mt-8 flex flex-col h-full pb-10 px-3">
                {cart.length === 0 ? (
                  <div className="text-center py-10 text-muted-foreground">
                    Your cart is empty
                  </div>
                ) : (
                  <>
                    <div className="flex-grow space-y-4 overflow-y-auto pr-2">
                      {cart.map((item) => (
                        <div key={item.menuItemId} className="flex justify-between items-center border-b pb-2">
                          <div>
                            <div className="font-medium">{item.menuItemName}</div>
                            <div className="text-sm text-muted-foreground">
                              {item.quantity} x ${item.price}
                            </div>
                            {item.specialInstructions && (
                              <div className="text-xs italic text-muted-foreground">
                                Note: {item.specialInstructions}
                              </div>
                            )}
                          </div>
                          <div className="font-bold">${item.quantity * item.price}</div>
                        </div>
                      ))}
                    </div>
                    <Separator className="my-4" />
                    <div className="space-y-4">
                      <div className="flex justify-between text-lg font-bold">
                        <span>Total</span>
                        <span>${cart.reduce((acc, i) => acc + i.price * i.quantity, 0)}</span>
                      </div>
                      <Button
                        className="w-full"
                        onClick={handlePlaceOrder}
                        disabled={placeOrderMutation.isPending}
                      >
                        {placeOrderMutation.isPending ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          'Place Order'
                        )}
                      </Button>
                    </div>
                  </>
                )}
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>

      <ItemDialog
        item={selectedItem}
        onClose={() => setSelectedItem(null)}
        onConfirm={onConfirmAdd}
      />

      <Tabs defaultValue={categories?.[0]?.id || ''} className="w-full">
        <TabsList className="mb-4">
          {categories?.map((cat) => (
            <TabsTrigger key={cat.id} value={cat.id}>
              {cat.name}
            </TabsTrigger>
          ))}
        </TabsList>

        {categories?.map((cat) => (
          <TabsContent key={cat.id} value={cat.id}>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {items
                ?.filter((item) => item.categoryId === cat.id)
                .map((item) => (
                  <MenuCard
                    key={item.id}
                    item={item}
                    onAddClick={(item) => setSelectedItem(item)}
                  />
                ))}
            </div>
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}
