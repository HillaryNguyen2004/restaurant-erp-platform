// dtos/reservation-response.dto.ts

import { ApiProperty } from '@nestjs/swagger';
import { ReservationStatus } from '../domains/entities/reservation.entity';

export class ReservationResponseDto {
  @ApiProperty({ example: 'reservation-uuid' })
  reservationId!: string;

  @ApiProperty({ example: 'John Doe' })
  customerName!: string;

  @ApiProperty({ example: 4 })
  partySize!: number;

  @ApiProperty({ example: '2026-04-27T19:00:00.000Z' })
  startTime!: string;

  @ApiProperty({ example: '2026-04-27T21:00:00.000Z' })
  endTime!: string;

  @ApiProperty({
    enum: ReservationStatus,
    example: ReservationStatus.CONFIRMED,
  })
  status!: ReservationStatus;

  @ApiProperty({ example: 'T02' })
  tableNumber!: string;
}
