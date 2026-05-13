import { StartDiningSessionDto } from '../../dtos/start-dining-session.dto';
import { ExtendDiningSessionDto } from '../../dtos/extend-dining-session.dto';
import { DiningSessionResponseDto } from '../../dtos/dining-session-response.dto';
import { ServiceTimeResponseDto } from '../../dtos/service-time-response.dto';

export interface IDiningSessionService {
  startSession(dto: StartDiningSessionDto): Promise<DiningSessionResponseDto>;

  startFromReservation(
    reservationId: string,
  ): Promise<DiningSessionResponseDto>;

  extendSession(
    sessionId: string,
    dto: ExtendDiningSessionDto,
  ): Promise<DiningSessionResponseDto>;

  finishSession(sessionId: string): Promise<void>;

  checkoutActiveSessionByTable(tableId: string): Promise<void>;

  getRemainingServiceTime(sessionId: string): Promise<ServiceTimeResponseDto>;
}
