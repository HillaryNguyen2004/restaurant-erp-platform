import {
  Body,
  Controller,
  Get,
  Inject,
  Param,
  Patch,
  Post,
} from '@nestjs/common';
import { ApiOperation, ApiParam, ApiResponse, ApiTags } from '@nestjs/swagger';
import { DINING_SESSION_SERVICE } from '../../constants/injection-tokens';
import { DiningSessionResponseDto } from '../../dtos/dining-session-response.dto';
import { ExtendDiningSessionDto } from '../../dtos/extend-dining-session.dto';
import { ServiceTimeResponseDto } from '../../dtos/service-time-response.dto';
import { StartDiningSessionDto } from '../../dtos/start-dining-session.dto';
import type { IDiningSessionService } from '../../services/dining-session/dining-session.service.interface';
import { IDiningSessionController } from './dining-session.controller.interface';

@ApiTags('dining-sessions')
@Controller('dining-sessions')
export class DiningSessionControllerImpl implements IDiningSessionController {
  constructor(
    @Inject(DINING_SESSION_SERVICE)
    private readonly diningSessionService: IDiningSessionService,
  ) {}

  @Post()
  @ApiOperation({ summary: 'Start a dining session manually' })
  @ApiResponse({ status: 201, type: DiningSessionResponseDto })
  startSession(
    @Body() dto: StartDiningSessionDto,
  ): Promise<DiningSessionResponseDto> {
    return this.diningSessionService.startSession(dto);
  }

  @Post('from-reservation/:reservationId')
  @ApiOperation({ summary: 'Start a dining session from a reservation' })
  @ApiParam({ name: 'reservationId', example: 'uuid' })
  @ApiResponse({ status: 201, type: DiningSessionResponseDto })
  startFromReservation(
    @Param('reservationId') reservationId: string,
  ): Promise<DiningSessionResponseDto> {
    return this.diningSessionService.startFromReservation(reservationId);
  }

  @Patch(':sessionId/extend')
  @ApiOperation({ summary: 'Extend a dining session' })
  @ApiParam({ name: 'sessionId', example: 'uuid' })
  @ApiResponse({ status: 200, type: DiningSessionResponseDto })
  extendSession(
    @Param('sessionId') sessionId: string,
    @Body() dto: ExtendDiningSessionDto,
  ): Promise<DiningSessionResponseDto> {
    return this.diningSessionService.extendSession(sessionId, dto);
  }

  @Patch(':sessionId/finish')
  @ApiOperation({ summary: 'Finish a dining session' })
  @ApiParam({ name: 'sessionId', example: 'uuid' })
  @ApiResponse({ status: 200 })
  finishSession(@Param('sessionId') sessionId: string): Promise<void> {
    return this.diningSessionService.finishSession(sessionId);
  }

  @Get(':sessionId/remaining-time')
  @ApiOperation({ summary: 'Get remaining service time for a dining session' })
  @ApiParam({ name: 'sessionId', example: 'uuid' })
  @ApiResponse({ status: 200, type: ServiceTimeResponseDto })
  getRemainingServiceTime(
    @Param('sessionId') sessionId: string,
  ): Promise<ServiceTimeResponseDto> {
    return this.diningSessionService.getRemainingServiceTime(sessionId);
  }
}
