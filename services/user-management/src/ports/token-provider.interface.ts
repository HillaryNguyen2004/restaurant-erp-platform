import { User } from '../domains/entities/user.entity';
import { TokenPair } from '../domains/value-objects/token-pair.vo';

export interface ITokenProvider {
  issueTokens(user: User): Promise<TokenPair>;
}
