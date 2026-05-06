import { Inject, Injectable, NotFoundException } from '@nestjs/common';

import {
  EVENT_PUBLISHER,
  TABLE_MAPPER,
  TABLE_REPOSITORY,
} from '../../constants/injection-tokens';

import { TableResponseDto } from '../../dtos/table-response.dto';
import { RestaurantTable } from '../../domains/entities/restaurant-table.entity';

import type { ITableRepository } from '../../repositories/table/table-repository.interface';
import type { IEventPublisher } from '../../ports/event-publisher.interface';
import type { ITableMapper } from '../../mappers/table/table-mapper.interface';
import { ITableStateService } from './table-state.service.interface';

@Injectable()
export class TableStateServiceImpl implements ITableStateService {
  constructor(
    @Inject(TABLE_REPOSITORY)
    private readonly tableRepo: ITableRepository,

    @Inject(EVENT_PUBLISHER)
    private readonly eventPublisher: IEventPublisher,

    @Inject(TABLE_MAPPER)
    private readonly tableMapper: ITableMapper,
  ) {}

  async getTableState(tableId: string): Promise<TableResponseDto> {
    const table = await this.getTableOrThrow(tableId);

    return this.tableMapper.toResponseDto(table);
  }

  async getAllTableStates(): Promise<TableResponseDto[]> {
    const tables = await this.tableRepo.findAll();

    return this.tableMapper.toResponseDtoList(tables);
  }

  async markTableAvailable(tableId: string): Promise<void> {
    const table = await this.getTableOrThrow(tableId);

    table.markAvailable();

    const savedTable = await this.tableRepo.save(table);
    await this.eventPublisher.publishTableStateChanged(savedTable);
  }

  async markTableReserved(tableId: string): Promise<void> {
    const table = await this.getTableOrThrow(tableId);

    table.markReserved();

    const savedTable = await this.tableRepo.save(table);
    await this.eventPublisher.publishTableStateChanged(savedTable);
  }

  async markTableOccupied(tableId: string): Promise<void> {
    const table = await this.getTableOrThrow(tableId);

    table.markOccupied();

    const savedTable = await this.tableRepo.save(table);
    await this.eventPublisher.publishTableStateChanged(savedTable);
  }

  async markTableOutOfOrder(tableId: string): Promise<void> {
    const table = await this.getTableOrThrow(tableId);

    table.markOutOfOrder();

    const savedTable = await this.tableRepo.save(table);
    await this.eventPublisher.publishTableStateChanged(savedTable);
  }

  private async getTableOrThrow(tableId: string): Promise<RestaurantTable> {
    const table = await this.tableRepo.findById(tableId);

    if (!table) {
      throw new NotFoundException(`Table ${tableId} not found`);
    }

    return table;
  }
}
