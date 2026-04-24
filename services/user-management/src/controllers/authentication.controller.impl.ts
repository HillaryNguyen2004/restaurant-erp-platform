// controllers/authentication.controller.ts

import { Body, Controller, Inject, Post } from '@nestjs/common';
import { ApiBody, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';

import { IAuthenticationController } from './interfaces/authentication.controller.interface';

import { LoginDto } from '../dtos/login.dto';
import { TokenPair } from '../domains/value-objects/token-pair.vo';
import { AUTHENTICATION_SERVICE } from '../constants/injection-tokens';
import * as authenticationServiceInterface from '../services/interfaces/authentication.service.interface';

@ApiTags('authentication')
@Controller('auth')
export class AuthenticationController implements IAuthenticationController {
  constructor(
    @Inject(AUTHENTICATION_SERVICE)
    private readonly authService: authenticationServiceInterface.IAuthenticationService,
  ) {}

  @Post('login')
  @ApiOperation({ summary: 'Authenticate user and issue tokens' })
  @ApiBody({ type: LoginDto })
  @ApiResponse({
    status: 201,
    description: 'Login successful',
    type: TokenPair,
  })
  @ApiResponse({ status: 401, description: 'Invalid credentials' })
  async login(@Body() dto: LoginDto): Promise<TokenPair> {
    return this.authService.login(dto);
  }
}
