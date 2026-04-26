import { Module } from '@nestjs/common';
import { TableReservationManagementModule } from './table-reservation-management.module';

@Module({
  imports: [TableReservationManagementModule],
})
export class AppModule {}
