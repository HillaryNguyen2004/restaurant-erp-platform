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
import { useGetAllMenuItems, useCategories } from '@/features/menu/data-access/menu.queries';
import { ActiveOrdersSheet } from '@/features/order/components/active-orders-sheet';
import { OrderItem } from '@/features/order/config/order.config';
import { usePlaceOrder, useSessionByTable } from '@/features/order/data-access/order.queries';
import { useRealtime } from '@/providers/realtime-provider';
import { useQueryClient } from '@tanstack/react-query';
import { Loader2, LogOut, ShoppingCart } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';

export default function MenuPage() {
  const queryClient = useQueryClient();
  const { emit } = useRealtime();
  const { user, logout } = useAuth();
  const [cart, setCart] = useState<OrderItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<MenuItem | null>(null);

  const { data: categories, isLoading: isLoadingCats } = useCategories();
  const { data: items, isLoading: isLoadingItems } = useGetAllMenuItems();
  
  // For customers, we assume they are at a table and have a session
  const { data: session, isLoading: isLoadingSession } = useSessionByTable(user?.id);
  const sessionId = session?.orderSessionId;
  const placeOrderMutation = usePlaceOrder();

  const handlePlaceOrder = () => {
    if (cart.length === 0) return;

    if (!sessionId) {
      toast.error("No active session found for this table");
      return;
    }

    placeOrderMutation.mutate({
      sessionId,
      items: cart.map(i => ({
        menuItemId: i.menuItemId,
        quantity: i.quantity,
        specialInstructions: i.specialInstructions || "",
      }))
    }, {
      onSuccess: async (order) => {
        toast.success('Order placed successfully!');
        setCart([]);
        setIsCartOpen(false);
        emit('NEW_ORDER_PLACED', order);
      }
    });
  };

  const onConfirmAdd = (quantity: number, note: string) => {
    if (!selectedItem) return;

    setCart((prev) => {
      const existing = prev.find((i) => i.menuItemId === selectedItem.itemId);
      if (existing) {
        return prev.map((i) =>
          i.menuItemId === selectedItem.itemId ? { ...i, quantity: i.quantity + quantity, specialInstructions: note } : i
        );
      }
      return [
        ...prev,
        {
          itemId: Math.random().toString(),
          menuItemId: selectedItem.itemId,
          menuItemName: selectedItem.name,
          quantity: quantity,
          unitPrice: selectedItem.price,
          subtotal: selectedItem.price * quantity,
          specialInstructions: note,
        },
      ];
    });

    toast.success(`Added ${quantity}x ${selectedItem.name} to cart`);
    setSelectedItem(null);
  };

  if (isLoadingCats || isLoadingItems || isLoadingSession) {
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
                        <div key={item.itemId} className="flex justify-between items-center border-b pb-2">
                          <div>
                            <div className="font-medium">{item.menuItemName}</div>
                            <div className="text-sm text-muted-foreground">
                              {item.quantity} x ${item.unitPrice}
                            </div>
                            {item.specialInstructions && (
                              <div className="text-xs italic text-muted-foreground">
                                Note: {item.specialInstructions}
                              </div>
                            )}
                          </div>
                          <div className="font-bold">${item.subtotal}</div>
                        </div>
                      ))}
                    </div>
                    <Separator className="my-4" />
                    <div className="space-y-4">
                      <div className="flex justify-between text-lg font-bold">
                        <span>Total</span>
                        <span>${cart.reduce((acc, i) => acc + i.subtotal, 0)}</span>
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

      <Tabs defaultValue={categories?.[0]?.categoryId || ''} className="w-full">
        <TabsList className="mb-4">
          {categories?.map((cat) => (
            <TabsTrigger key={cat.categoryId} value={cat.categoryId}>
              {cat.name}
            </TabsTrigger>
          ))}
        </TabsList>

        {categories?.map((cat) => (
          <TabsContent key={cat.categoryId} value={cat.categoryId}>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {items
                ?.filter((item) => item.categoryId === cat.categoryId)
                .map((item) => (
                  <MenuCard
                    key={item.itemId}
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
