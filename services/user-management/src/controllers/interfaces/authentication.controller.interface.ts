// controllers/interfaces/authentication-controller.interface.ts
import { LoginDto } from '../../dtos/login.dto';

export interface IAuthenticationController {
  login(dto: LoginDto): Promise<{
    accessToken: string;
    refreshToken: string;
  }>;
}
