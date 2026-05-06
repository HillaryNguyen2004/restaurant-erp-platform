import { Injectable } from '@nestjs/common';
import { JwtService, type JwtSignOptions } from '@nestjs/jwt';
import { ITokenProvider } from '../ports/token-provider.interface';
import { User } from '../domains/entities/user.entity';
import { TokenPair } from '../domains/value-objects/token-pair.vo';

type JwtPayload = {
  sub: string;
  email: string;
  roles: string[];
};

@Injectable()
export class JwtTokenProviderAdapter implements ITokenProvider {
  constructor(private readonly jwtService: JwtService) {}

  async issueTokens(user: User): Promise<TokenPair> {
    const payload: JwtPayload = {
      sub: user.id,
      email: user.email,
      roles: user.roles.map((r) => r.name),
    };

    const accessOptions: JwtSignOptions = {
      expiresIn: 60 * 15,
    };

    const refreshOptions: JwtSignOptions = {
      expiresIn: 60 * 60 * 24 * 7,
    };

    const accessToken: string = await this.jwtService.signAsync(
      payload,
      accessOptions,
    );

    const refreshToken: string = await this.jwtService.signAsync(
      payload,
      refreshOptions,
    );

    return new TokenPair(accessToken, refreshToken);
  }
}
