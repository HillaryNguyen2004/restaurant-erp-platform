// dtos/wait-time-response.dto.ts

import { ApiProperty } from '@nestjs/swagger';

export class WaitTimeResponseDto {
  @ApiProperty({ example: 15 })
  estimatedMinutes!: number;
}
