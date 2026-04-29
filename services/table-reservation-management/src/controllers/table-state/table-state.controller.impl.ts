import { Controller, Get, Inject, Param, Patch } from '@nestjs/common';
import { ApiOperation, ApiParam, ApiResponse, ApiTags } from '@nestjs/swagger';
import { TABLE_STATE_SERVICE } from '../../constants/injection-tokens';
import { TableResponseDto } from '../../dtos/table-response.dto';
import type { ITableStateService } from '../../services/table-state/table-state.service.interface';
import { ITableStateController } from './table-state.controller.interface';

@ApiTags('tables')
@Controller('tables')
export class TableStateControllerImpl implements ITableStateController {
  constructor(
    @Inject(TABLE_STATE_SERVICE)
    private readonly tableStateService: ITableStateService,
  ) {}

  @Get(':tableId')
  @ApiOperation({ summary: 'Get table state by ID' })
  @ApiParam({ name: 'tableId', example: 'uuid' })
  @ApiResponse({ status: 200, type: TableResponseDto })
  getTableState(@Param('tableId') tableId: string): Promise<TableResponseDto> {
    return this.tableStateService.getTableState(tableId);
  }

  @Get()
  @ApiOperation({ summary: 'Get all table states' })
  @ApiResponse({ status: 200, type: [TableResponseDto] })
  getAllTableStates(): Promise<TableResponseDto[]> {
    return this.tableStateService.getAllTableStates();
  }

  @Patch(':tableId/available')
  @ApiOperation({ summary: 'Mark table as available' })
  @ApiParam({ name: 'tableId', example: 'uuid' })
  @ApiResponse({ status: 200 })
  markTableAvailable(@Param('tableId') tableId: string): Promise<void> {
    return this.tableStateService.markTableAvailable(tableId);
  }

  @Patch(':tableId/reserved')
  @ApiOperation({ summary: 'Mark table as reserved' })
  @ApiParam({ name: 'tableId', example: 'uuid' })
  @ApiResponse({ status: 200 })
  markTableReserved(@Param('tableId') tableId: string): Promise<void> {
    return this.tableStateService.markTableReserved(tableId);
  }

  @Patch(':tableId/occupied')
  @ApiOperation({ summary: 'Mark table as occupied' })
  @ApiParam({ name: 'tableId', example: 'uuid' })
  @ApiResponse({ status: 200 })
  markTableOccupied(@Param('tableId') tableId: string): Promise<void> {
    return this.tableStateService.markTableOccupied(tableId);
  }

  @Patch(':tableId/out-of-order')
  @ApiOperation({ summary: 'Mark table as out of order' })
  @ApiParam({ name: 'tableId', example: 'uuid' })
  @ApiResponse({ status: 200 })
  markTableOutOfOrder(@Param('tableId') tableId: string): Promise<void> {
    return this.tableStateService.markTableOutOfOrder(tableId);
  }
}
