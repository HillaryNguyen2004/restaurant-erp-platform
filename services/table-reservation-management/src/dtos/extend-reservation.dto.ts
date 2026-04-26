// dtos/extend-reservation.dto.ts

import { ApiProperty } from '@nestjs/swagger';

export class ExtendReservationDto {
  @ApiProperty({ example: '2026-04-27T22:00:00.000Z' })
  newEndTime!: string;
}
