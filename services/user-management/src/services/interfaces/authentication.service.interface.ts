// services/interfaces/authentication-service.interface.ts

import { LoginDto } from '../../dtos/login.dto';
import { TokenPair } from '../../domains/value-objects/token-pair.vo';

export interface IAuthenticationService {
  login(dto: LoginDto): Promise<TokenPair>;
}
