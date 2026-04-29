import { Injectable } from '@nestjs/common';
import { DiningSession } from '../../domains/entities/dining-session.entity';
import { RestaurantTable } from '../../domains/entities/restaurant-table.entity';
import { DiningSessionResponseDto } from '../../dtos/dining-session-response.dto';
import { IDiningSessionMapper } from './dining-session-mapper.interface';

@Injectable()
export class DiningSessionMapper implements IDiningSessionMapper {
  toResponseDto(
    session: DiningSession,
    table?: RestaurantTable | null,
  ): DiningSessionResponseDto {
    return {
      sessionId: session.sessionId,
      tableId: session.tableId,
      tableNumber: table?.tableNumber ?? '',
      startedAt: session.startedAt.toISOString(),
      expectedEndAt: session.expectedEndAt.toISOString(),
      remainingMinutes: session.getRemainingTime(new Date()),
      status: session.status,
      billingStatus: session.billingStatus,
    };
  }
}
