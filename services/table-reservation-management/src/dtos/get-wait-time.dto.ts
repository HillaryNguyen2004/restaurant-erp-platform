// dtos/get-wait-time.dto.ts

import { ApiProperty } from '@nestjs/swagger';

export class GetWaitTimeDto {
  @ApiProperty({ example: 4 })
  partySize!: number;
}
