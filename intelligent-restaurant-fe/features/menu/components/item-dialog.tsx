import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Clock } from "lucide-react"
import { useState, useEffect } from "react"
import { MenuItem } from "../config/menu.config"

interface ItemDialogProps {
  item: MenuItem | null
  onClose: () => void
  onConfirm: (quantity: number, note: string) => void
}

export function ItemDialog({ item, onClose, onConfirm }: ItemDialogProps) {
  const [quantity, setQuantity] = useState(1)
  const [note, setNote] = useState("")

  useEffect(() => {
    if (item) {
      setQuantity(1)
      setNote("")
    }
  }, [item])

  if (!item) return null

  return (
    <Dialog open={!!item} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="overflow-hidden p-0 sm:max-w-md">
        <div className="space-y-4 p-6 pt-10">
          <DialogHeader>
            <div className="flex items-center justify-between">
              <DialogTitle className="text-xl">{item.name}</DialogTitle>
              <Badge className="gap-1 bg-slate-100 text-slate-700">
                <Clock className="h-3 w-3" />
                {item.prepTimeMinutes} min
              </Badge>
            </div>
            <p className="text-sm text-slate-500">{item.description}</p>
            <p className="text-lg font-bold text-emerald-600">${item.price}</p>
          </DialogHeader>

          {/* Allergy tags */}
          {item.allergyTags.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {item.allergyTags.map((tag) => (
                <Badge key={tag} variant="outline" className="text-xs">
                  {tag}
                </Badge>
              ))}
            </div>
          )}

          {/* Quantity */}
          <div className="space-y-1">
            <Label>Quantity</Label>
            <Input
              type="number"
              min={1}
              value={quantity}
              onChange={(e) => setQuantity(parseInt(e.target.value) || 1)}
            />
          </div>

          {/* Note */}
          <div className="space-y-1">
            <Label>Special Instructions</Label>
            <Textarea
              placeholder="E.g. no onions, extra spicy..."
              value={note}
              onChange={(e) => setNote(e.target.value)}
              rows={2}
            />
          </div>

          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button
              className="bg-emerald-600 hover:bg-emerald-700"
              onClick={() => onConfirm(quantity, note)}
            >
              Add to Order · ${(item.price * quantity).toFixed(2)}
            </Button>
          </DialogFooter>
        </div>
      </DialogContent>
    </Dialog>
  )
}
