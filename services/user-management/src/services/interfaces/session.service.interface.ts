// services/interfaces/session-service.interface.ts

export interface ISessionService {
  revokeAll(userId: string): Promise<void>;
}
