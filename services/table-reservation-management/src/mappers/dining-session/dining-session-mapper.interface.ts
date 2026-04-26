import { DiningSession } from '../../domains/entities/dining-session.entity';
import { RestaurantTable } from '../../domains/entities/restaurant-table.entity';
import { DiningSessionResponseDto } from '../../dtos/dining-session-response.dto';

export interface IDiningSessionMapper {
  toResponseDto(
    session: DiningSession,
    table?: RestaurantTable | null,
  ): DiningSessionResponseDto;
}
