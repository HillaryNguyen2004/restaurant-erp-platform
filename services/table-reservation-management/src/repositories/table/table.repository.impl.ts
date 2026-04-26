import { Injectable } from '@nestjs/common';
import { RestaurantTable as PrismaRestaurantTable } from '@prisma/client';
import {
  RestaurantTable,
  TableStatus,
} from '../../domains/entities/restaurant-table.entity';
import { PrismaService } from '../../prisma/prisma.service';
import { ITableRepository } from './table-repository.interface';

@Injectable()
export class TableRepositoryImpl implements ITableRepository {
  constructor(private readonly prisma: PrismaService) {}

  async save(table: RestaurantTable): Promise<RestaurantTable> {
    const row = await this.prisma.restaurantTable.upsert({
      where: { tableId: table.tableId },
      update: {
        tableNumber: table.tableNumber,
        capacity: table.capacity,
        status: table.status,
        zone: table.zone,
      },
      create: {
        tableId: table.tableId,
        tableNumber: table.tableNumber,
        capacity: table.capacity,
        status: table.status,
        zone: table.zone,
      },
    });

    return this.toDomain(row);
  }

  async findById(id: string): Promise<RestaurantTable | null> {
    const row = await this.prisma.restaurantTable.findUnique({
      where: { tableId: id },
    });

    return row ? this.toDomain(row) : null;
  }

  async findAll(): Promise<RestaurantTable[]> {
    const rows = await this.prisma.restaurantTable.findMany({
      orderBy: { tableNumber: 'asc' },
    });

    return rows.map((row) => this.toDomain(row));
  }

  async findByMinimumCapacity(capacity: number): Promise<RestaurantTable[]> {
    const rows = await this.prisma.restaurantTable.findMany({
      where: {
        capacity: { gte: capacity },
        status: { not: TableStatus.OUT_OF_ORDER },
      },
      orderBy: { capacity: 'asc' },
    });

    return rows.map((row) => this.toDomain(row));
  }

  private toDomain(row: PrismaRestaurantTable): RestaurantTable {
    return new RestaurantTable(
      row.tableId,
      row.tableNumber,
      row.capacity,
      row.status as TableStatus,
      row.zone,
    );
  }
}
