// dtos/create-reservation.dto.ts

import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateReservationDto {
  @ApiProperty({ example: 'John Doe' })
  customerName!: string;

  @ApiProperty({ example: '0901234567' })
  contactNumber!: string;

  @ApiProperty({ example: 4 })
  partySize!: number;

  @ApiProperty({ example: '2026-04-27T19:00:00.000Z' })
  startTime!: string;

  @ApiProperty({ example: '2026-04-27T21:00:00.000Z' })
  endTime!: string;

  @ApiPropertyOptional({ example: 'Window seat preferred' })
  notes?: string;
}
