export class UserSession {
  constructor(
    public readonly id: string,
    public readonly userId: string,
    public readonly refreshToken: string,
    public readonly createdAt: Date,
    public isRevoked = false,
  ) {}

  revoke(): void {
    this.isRevoked = true;
  }
}
