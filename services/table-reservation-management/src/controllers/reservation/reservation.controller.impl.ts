import {
  Body,
  Controller,
  Get,
  Inject,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { RESERVATION_SERVICE } from '../../constants/injection-tokens';
import { CreateReservationDto } from '../../dtos/create-reservation.dto';
import { ExtendReservationDto } from '../../dtos/extend-reservation.dto';
import { ReservationCalendarQueryDto } from '../../dtos/reservation-calendar-query.dto';
import { ReservationResponseDto } from '../../dtos/reservation-response.dto';
import { DiningSessionResponseDto } from '../../dtos/dining-session-response.dto';
import type { IReservationService } from '../../services/reservation/reservation.service.interface';
import { IReservationController } from './reservation.controller.interface';

@Controller('reservations')
export class ReservationControllerImpl implements IReservationController {
  constructor(
    @Inject(RESERVATION_SERVICE)
    private readonly reservationService: IReservationService,
  ) {}

  @Post()
  createReservation(
    @Body() dto: CreateReservationDto,
  ): Promise<ReservationResponseDto> {
    return this.reservationService.createReservation(dto);
  }

  @Patch(':id/extend')
  extendReservation(
    @Param('id') id: string,
    @Body() dto: ExtendReservationDto,
  ): Promise<ReservationResponseDto> {
    return this.reservationService.extendReservation(id, dto);
  }

  @Patch(':id/cancel')
  cancelReservation(@Param('id') id: string): Promise<void> {
    return this.reservationService.cancelReservation(id);
  }

  @Patch(':id/check-in')
  checkInReservation(
    @Param('id') id: string,
  ): Promise<DiningSessionResponseDto> {
    return this.reservationService.checkInReservation(id);
  }

  @Patch(':id/no-show')
  markNoShow(@Param('id') id: string): Promise<void> {
    return this.reservationService.markNoShow(id);
  }

  @Get(':id')
  getReservation(@Param('id') id: string): Promise<ReservationResponseDto> {
    return this.reservationService.getReservation(id);
  }

  @Get()
  getReservationsByDateRange(
    @Query() dto: ReservationCalendarQueryDto,
  ): Promise<ReservationResponseDto[]> {
    return this.reservationService.getReservationsByDateRange(dto);
  }
}
