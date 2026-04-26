// dtos/start-dining-session.dto.ts

import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class StartDiningSessionDto {
  @ApiProperty({ example: 'table-uuid' })
  tableId!: string;

  @ApiPropertyOptional({ example: 'reservation-uuid' })
  reservationId?: string;

  @ApiProperty({ example: '2026-04-27T21:00:00.000Z' })
  expectedEndAt!: string;
}
