// dtos/find-available-tables.dto.ts

import { ApiProperty } from '@nestjs/swagger';

export class FindAvailableTablesDto {
  @ApiProperty({ example: 4 })
  partySize!: number;

  @ApiProperty({ example: '2026-04-27T19:00:00.000Z' })
  startTime!: string;

  @ApiProperty({ example: '2026-04-27T21:00:00.000Z' })
  endTime!: string;
}
