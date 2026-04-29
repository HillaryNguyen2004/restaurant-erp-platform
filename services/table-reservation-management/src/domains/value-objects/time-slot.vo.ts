export class TimeSlot {
  constructor(
    public readonly start: Date,
    public readonly end: Date,
  ) {
    if (end <= start) {
      throw new Error('TimeSlot end must be after start');
    }
  }

  overlaps(other: TimeSlot): boolean {
    return this.start < other.end && other.start < this.end;
  }

  extendTo(newEnd: Date): TimeSlot {
    return new TimeSlot(this.start, newEnd);
  }
}
