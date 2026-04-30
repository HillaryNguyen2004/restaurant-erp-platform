import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useState, useEffect } from 'react';
import { MenuItem } from '../config/menu.config';

interface ItemDialogProps {
  item: MenuItem | null;
  onClose: () => void;
  onConfirm: (quantity: number, note: string) => void;
}

export function ItemDialog({ item, onClose, onConfirm }: ItemDialogProps) {
  const [quantity, setQuantity] = useState(1);
  const [note, setNote] = useState('');

  useEffect(() => {
    if (item) {
      setQuantity(1);
      setNote('');
    }
  }, [item]);

  if (!item) return null;

  return (
    <Dialog open={!!item} onOpenChange={(open) => !open && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add {item.name} to Order</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="quantity">Quantity</Label>
            <Input
              id="quantity"
              type="number"
              min="1"
              value={quantity}
              onChange={(e) => setQuantity(parseInt(e.target.value) || 1)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="note">Special Instructions (Note)</Label>
            <Textarea
              id="note"
              placeholder="No onions, extra spicy, etc."
              value={note}
              onChange={(e) => setNote(e.target.value)}
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={() => onConfirm(quantity, note)}>Add to Order</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
