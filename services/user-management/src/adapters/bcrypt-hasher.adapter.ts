import { Injectable } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { IPasswordHasher } from '../ports/password-hasher.interface';

@Injectable()
export class BcryptHasherAdapter implements IPasswordHasher {
  async hash(value: string): Promise<string> {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    return bcrypt.hash(value, 10);
  }

  async compare(plain: string, hash: string): Promise<boolean> {
    return bcrypt.compare(plain, hash);
  }
}
