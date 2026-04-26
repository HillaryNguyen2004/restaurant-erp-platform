// dtos/service-time-response.dto.ts

import { ApiProperty } from '@nestjs/swagger';

export class ServiceTimeResponseDto {
  @ApiProperty({ example: 45 })
  remainingMinutes!: number;

  @ApiProperty({ example: false })
  isOvertime!: boolean;
}
