export enum TableStatus {
  FREE = 'FREE',
  RESERVED = 'RESERVED',
  OCCUPIED = 'OCCUPIED',
  OUT_OF_ORDER = 'OUT_OF_ORDER',
}

export class RestaurantTable {
  constructor(
    public readonly tableId: string,
    public tableNumber: string,
    public capacity: number,
    public status: TableStatus,
    public zone: string,
  ) {}

  canFit(partySize: number): boolean {
    return this.capacity >= partySize;
  }

  markAvailable(): void {
    this.status = TableStatus.FREE;
  }

  markReserved(): void {
    if (this.status === TableStatus.OUT_OF_ORDER) {
      throw new Error('Out-of-order table cannot be reserved');
    }

    this.status = TableStatus.RESERVED;
  }

  markOccupied(): void {
    if (this.status === TableStatus.OUT_OF_ORDER) {
      throw new Error('Out-of-order table cannot be occupied');
    }

    this.status = TableStatus.OCCUPIED;
  }

  markOutOfOrder(): void {
    this.status = TableStatus.OUT_OF_ORDER;
  }
}
