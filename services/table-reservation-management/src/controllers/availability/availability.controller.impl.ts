import { Body, Controller, Inject, Post } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { AVAILABILITY_SERVICE } from '../../constants/injection-tokens';
import { FindAvailableTablesDto } from '../../dtos/find-available-tables.dto';
import { GetWaitTimeDto } from '../../dtos/get-wait-time.dto';
import { TableResponseDto } from '../../dtos/table-response.dto';
import { WaitTimeResponseDto } from '../../dtos/wait-time-response.dto';
import type { IAvailabilityService } from '../../services/availability/availability.service.interface';
import { IAvailabilityController } from './availability.controller.interface';

@ApiTags('availability')
@Controller('availability')
export class AvailabilityControllerImpl implements IAvailabilityController {
  constructor(
    @Inject(AVAILABILITY_SERVICE)
    private readonly availabilityService: IAvailabilityService,
  ) {}

  @Post('tables')
  @ApiOperation({
    summary: 'Find available tables for a time slot and party size',
  })
  @ApiResponse({ status: 200, type: [TableResponseDto] })
  findAvailableTables(
    @Body() dto: FindAvailableTablesDto,
  ): Promise<TableResponseDto[]> {
    return this.availabilityService.findAvailableTables(dto);
  }

  @Post('wait-time')
  @ApiOperation({ summary: 'Estimate wait time for a party size' })
  @ApiResponse({ status: 200, type: WaitTimeResponseDto })
  getWaitTime(@Body() dto: GetWaitTimeDto): Promise<WaitTimeResponseDto> {
    return this.availabilityService.getWaitTime(dto);
  }
}
