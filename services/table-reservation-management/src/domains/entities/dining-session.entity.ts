// domains/entities/dining-session.entity.ts

export enum DiningSessionStatus {
  ACTIVE = 'ACTIVE',
  EXTENDED = 'EXTENDED',
  FINISHED = 'FINISHED',
}

export enum TableBillingStatus {
  NOT_READY = 'NOT_READY',
  READY_TO_PAY = 'READY_TO_PAY',
  PAID = 'PAID',
}

export class DiningSession {
  constructor(
    public readonly sessionId: string,
    public tableId: string,
    public reservationId: string | null,
    public startedAt: Date,
    public expectedEndAt: Date,
    public actualEndAt: Date | null,
    public status: DiningSessionStatus,
    public billingStatus: TableBillingStatus,
  ) {
    if (expectedEndAt <= startedAt) {
      throw new Error('Expected end time must be after session start time');
    }
  }

  extend(newExpectedEndAt: Date): void {
    if (this.status === DiningSessionStatus.FINISHED) {
      throw new Error('Finished dining session cannot be extended');
    }

    if (newExpectedEndAt <= this.expectedEndAt) {
      throw new Error(
        'New expected end time must be later than current expected end time',
      );
    }

    this.expectedEndAt = newExpectedEndAt;
    this.status = DiningSessionStatus.EXTENDED;
  }

  markReadyToPay(): void {
    if (this.status === DiningSessionStatus.FINISHED) {
      throw new Error('Finished dining session cannot be marked ready to pay');
    }

    this.billingStatus = TableBillingStatus.READY_TO_PAY;
  }

  markPaid(): void {
    this.billingStatus = TableBillingStatus.PAID;
  }

  finish(): void {
    if (this.status === DiningSessionStatus.FINISHED) {
      throw new Error('Dining session is already finished');
    }

    if (this.billingStatus !== TableBillingStatus.PAID) {
      throw new Error(
        'Dining session cannot finish before payment is completed',
      );
    }

    this.actualEndAt = new Date();
    this.status = DiningSessionStatus.FINISHED;
  }

  getRemainingTime(currentTime: Date): number {
    const remainingMs = this.expectedEndAt.getTime() - currentTime.getTime();

    return Math.max(0, Math.ceil(remainingMs / 60000));
  }

  isOvertime(currentTime: Date): boolean {
    return (
      currentTime > this.expectedEndAt &&
      this.status !== DiningSessionStatus.FINISHED
    );
  }
}
