import { Body, Controller, Post } from '@nestjs/common';
import { UserManagementFacade } from '../facade/user-management.facade';
import { LoginDto } from '../dtos/login.dto';

@Controller('auth')
export class AuthenticationController {
  constructor(private readonly facade: UserManagementFacade) {}

  @Post('login')
  login(@Body() dto: LoginDto) {
    return this.facade.login(dto);
  }
}
