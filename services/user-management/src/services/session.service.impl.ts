// src/services/session.service.ts

import { ISessionService } from './interfaces/session.service.interface';
import { Inject, Injectable } from '@nestjs/common';
import * as sessionRepositoryInterface from '../repositories/session/session.repository.interface';
import { SESSION_REPOSITORY } from '../constants/injection-tokens';

@Injectable()
export class SessionServiceImpl implements ISessionService {
  constructor(
    @Inject(SESSION_REPOSITORY)
    private readonly sessionRepo: sessionRepositoryInterface.ISessionRepository,
  ) {}

  async revokeAll(userId: string): Promise<void> {
    await this.sessionRepo.revokeByUserId(userId);
  }
}
