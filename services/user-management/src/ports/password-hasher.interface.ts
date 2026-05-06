export interface IPasswordHasher {
  hash(value: string): Promise<string>;
  compare(plain: string, hash: string): Promise<boolean>;
}
