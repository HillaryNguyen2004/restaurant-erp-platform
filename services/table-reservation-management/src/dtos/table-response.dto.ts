// dtos/table-response.dto.ts

import { ApiProperty } from '@nestjs/swagger';
import { TableStatus } from '../domains/entities/restaurant-table.entity';

export class TableResponseDto {
  @ApiProperty({ example: 'table-uuid' })
  tableId!: string;

  @ApiProperty({ example: 'T02' })
  tableNumber!: string;

  @ApiProperty({ example: 4 })
  capacity!: number;

  @ApiProperty({ enum: TableStatus, example: TableStatus.FREE })
  status!: TableStatus;

  @ApiProperty({ example: 'A' })
  zone!: string;
}
