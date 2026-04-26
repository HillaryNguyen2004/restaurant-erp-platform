import { RestaurantTable } from '../../domains/entities/restaurant-table.entity';
import { TableResponseDto } from '../../dtos/table-response.dto';

export interface ITableMapper {
  toResponseDto(table: RestaurantTable): TableResponseDto;
  toResponseDtoList(tables: RestaurantTable[]): TableResponseDto[];
}
