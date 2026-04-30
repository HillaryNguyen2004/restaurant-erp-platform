import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { MenuItem } from '../config/menu.config';

interface MenuCardProps {
  item: MenuItem;
  onAddClick: (item: MenuItem) => void;
}

export function MenuCard({ item, onAddClick }: MenuCardProps) {
  return (
    <Card className="overflow-hidden hover:shadow-lg transition-shadow">
      <CardHeader>
        <div className="flex justify-between items-start">
          <CardTitle>{item.name}</CardTitle>
          <Badge variant="secondary">${item.price}</Badge>
        </div>
        <CardDescription>{item.description}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex flex-wrap gap-1">
          {item.allergyTags.map((tag) => (
            <Badge key={tag} variant="outline" className="text-[10px]">
              {tag}
            </Badge>
          ))}
        </div>
      </CardContent>
      <CardFooter>
        <Button className="w-full gap-2" onClick={() => onAddClick(item)}>
          <Plus className="w-4 h-4" /> Add to Order
        </Button>
      </CardFooter>
    </Card>
  );
}
