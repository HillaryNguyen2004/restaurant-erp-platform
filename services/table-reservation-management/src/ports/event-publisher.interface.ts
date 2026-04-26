// ports/event-publisher.interface.ts

import { Reservation } from '../domains/entities/reservation.entity';
import { RestaurantTable } from '../domains/entities/restaurant-table.entity';
import { DiningSession } from '../domains/entities/dining-session.entity';

export interface IEventPublisher {
  publishReservationCreated(reservation: Reservation): Promise<void>;
  publishReservationExtended(reservation: Reservation): Promise<void>;
  publishReservationCancelled(reservation: Reservation): Promise<void>;
  publishReservationCheckedIn(reservation: Reservation): Promise<void>;
  publishReservationNoShow(reservation: Reservation): Promise<void>;

  publishTableStateChanged(table: RestaurantTable): Promise<void>;

  publishDiningSessionStarted(session: DiningSession): Promise<void>;
  publishDiningSessionExtended(session: DiningSession): Promise<void>;
  publishDiningSessionFinished(session: DiningSession): Promise<void>;
}
