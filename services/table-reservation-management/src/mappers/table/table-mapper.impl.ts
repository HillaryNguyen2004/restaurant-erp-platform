import { Injectable } from '@nestjs/common';

import { RestaurantTable } from '../../domains/entities/restaurant-table.entity';

import { TableResponseDto } from '../../dtos/table-response.dto';

import { ITableMapper } from './table-mapper.interface';

@Injectable()
export class TableMapper implements ITableMapper {
  toResponseDto(table: RestaurantTable): TableResponseDto {
    return {
      tableId: table.tableId,

      tableNumber: table.tableNumber,

      capacity: table.capacity,

      status: table.status,

      zone: table.zone,
    };
  }

  toResponseDtoList(tables: RestaurantTable[]): TableResponseDto[] {
    return tables.map((table) => this.toResponseDto(table));
  }
}
