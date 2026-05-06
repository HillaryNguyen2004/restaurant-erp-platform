// dtos/reservation-calendar-query.dto.ts

import { ApiProperty } from '@nestjs/swagger';

export class ReservationCalendarQueryDto {
  @ApiProperty({ example: '2026-04-27T00:00:00.000Z' })
  startDate!: string;

  @ApiProperty({ example: '2026-04-28T00:00:00.000Z' })
  endDate!: string;
}
