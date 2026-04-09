import { randomUUID } from 'crypto';
import { Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import { IUserRepository } from '../repositories/user/user.repository.interface';
import { ISessionRepository } from '../repositories/session/session.repository.interface';
import { IPasswordHasher } from '../ports/password-hasher.interface';
import { ITokenProvider } from '../ports/token-provider.interface';
import {
  PASSWORD_HASHER,
  SESSION_REPOSITORY,
  TOKEN_PROVIDER,
  USER_REPOSITORY,
} from '../constants/injection-tokens';
import { LoginDto } from '../dtos/login.dto';
import { TokenPair } from '../domains/value-objects/token-pair.vo';
import { UserSession } from '../domains/entities/user-session.entity';

@Injectable()
export class Authenticator {
  constructor(
    @Inject(USER_REPOSITORY) private readonly userRepo: IUserRepository,
    @Inject(SESSION_REPOSITORY)
    private readonly sessionRepo: ISessionRepository,
    @Inject(PASSWORD_HASHER) private readonly hasher: IPasswordHasher,
    @Inject(TOKEN_PROVIDER) private readonly tokenProvider: ITokenProvider,
  ) {}

  async login(dto: LoginDto): Promise<TokenPair> {
    const user = await this.userRepo.findByEmail(dto.email);

    if (!user || !user.isActive) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const matched = await this.hasher.compare(dto.password, user.passwordHash);
    if (!matched) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const tokenPair = await this.tokenProvider.issueTokens(user);

    const session = new UserSession(
      randomUUID(),
      user.id,
      tokenPair.refreshToken,
      new Date(),
    );

    await this.sessionRepo.save(session);

    return tokenPair;
  }
}
