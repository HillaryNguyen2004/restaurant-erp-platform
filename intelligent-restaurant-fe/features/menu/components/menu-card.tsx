import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Clock, Plus } from "lucide-react"
import { MenuItem } from "../config/menu.config"

interface MenuCardProps {
  item: MenuItem
  onAddClick: (item: MenuItem) => void
}

export function MenuCard({ item, onAddClick }: MenuCardProps) {
  return (
    <Card
      className={`overflow-hidden transition-all duration-200 hover:shadow-md ${!item.available ? "opacity-60" : "cursor-pointer"}`}
    >
      {!item.available && (
        <div className="flex items-center justify-center bg-white/70 py-4">
          <Badge variant="secondary" className="font-semibold">
            Sold Out
          </Badge>
        </div>
      )}

      {/* Prep time badge */}
      <div className="absolute bottom-2 left-2">
        <Badge className="gap-1 border-0 bg-black/50 text-xs text-white backdrop-blur-sm">
          <Clock className="h-3 w-3" />
          {item.prepTimeMinutes}m
        </Badge>
      </div>

      <CardContent className="space-y-1 p-3">
        <div className="flex items-start justify-between gap-2">
          <h3 className="line-clamp-1 text-sm leading-tight font-semibold text-white">
            {item.name}
          </h3>
          <span className="text-sm font-bold whitespace-nowrap text-emerald-600">
            ${item.price}
          </span>
        </div>

        <p className="line-clamp-2 text-xs text-slate-400">
          {item.description}
        </p>

        {/* Allergy tags */}
        {item.allergyTags.length > 0 && (
          <div className="flex flex-wrap gap-1 pt-1">
            {item.allergyTags.map((tag) => (
              <Badge
                key={tag}
                variant="outline"
                className="h-5 px-1.5 py-0 text-xs"
              >
                {tag}
              </Badge>
            ))}
          </div>
        )}
      </CardContent>

      <CardFooter className="p-3 pt-0">
        <Button
          className="h-8 w-full gap-1 text-xs font-semibold"
          disabled={!item.available}
          onClick={() => onAddClick(item)}
        >
          <Plus className="h-3.5 w-3.5" />
          Add to Order
        </Button>
      </CardFooter>
    </Card>
  )
}
