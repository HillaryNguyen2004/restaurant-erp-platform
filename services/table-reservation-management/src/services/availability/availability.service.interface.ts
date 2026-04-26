import { FindAvailableTablesDto } from '../../dtos/find-available-tables.dto';
import { GetWaitTimeDto } from '../../dtos/get-wait-time.dto';
import { TableResponseDto } from '../../dtos/table-response.dto';
import { WaitTimeResponseDto } from '../../dtos/wait-time-response.dto';

export interface IAvailabilityService {
  findAvailableTables(dto: FindAvailableTablesDto): Promise<TableResponseDto[]>;

  getWaitTime(dto: GetWaitTimeDto): Promise<WaitTimeResponseDto>;
}
