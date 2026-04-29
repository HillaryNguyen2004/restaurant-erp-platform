// dtos/dining-session-response.dto.ts

import { ApiProperty } from '@nestjs/swagger';
import {
  DiningSessionStatus,
  TableBillingStatus,
} from '../domains/entities/dining-session.entity';

export class DiningSessionResponseDto {
  @ApiProperty({ example: 'session-uuid' })
  sessionId!: string;

  @ApiProperty({ example: 'table-uuid' })
  tableId!: string;

  @ApiProperty({ example: 'T02' })
  tableNumber!: string;

  @ApiProperty({ example: '2026-04-27T19:00:00.000Z' })
  startedAt!: string;

  @ApiProperty({ example: '2026-04-27T21:00:00.000Z' })
  expectedEndAt!: string;

  @ApiProperty({ example: 90 })
  remainingMinutes!: number;

  @ApiProperty({
    enum: DiningSessionStatus,
    example: DiningSessionStatus.ACTIVE,
  })
  status!: DiningSessionStatus;

  @ApiProperty({
    enum: TableBillingStatus,
    example: TableBillingStatus.NOT_READY,
  })
  billingStatus!: TableBillingStatus;
}
