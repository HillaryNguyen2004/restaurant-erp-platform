import { RestaurantTable } from '../../domains/entities/restaurant-table.entity';

export interface ITableRepository {
  save(table: RestaurantTable): Promise<RestaurantTable>;
  findById(id: string): Promise<RestaurantTable | null>;
  findAll(): Promise<RestaurantTable[]>;
  findByMinimumCapacity(capacity: number): Promise<RestaurantTable[]>;
}
