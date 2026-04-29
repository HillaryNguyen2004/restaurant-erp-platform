import { TableResponseDto } from '../../dtos/table-response.dto';

export interface ITableStateService {
  getTableState(tableId: string): Promise<TableResponseDto>;

  getAllTableStates(): Promise<TableResponseDto[]>;

  markTableAvailable(tableId: string): Promise<void>;

  markTableReserved(tableId: string): Promise<void>;

  markTableOccupied(tableId: string): Promise<void>;

  markTableOutOfOrder(tableId: string): Promise<void>;
}
