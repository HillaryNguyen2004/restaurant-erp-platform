// src/controllers/profile.controller.ts

import {
  Body,
  Controller,
  Get,
  Inject,
  Param,
  Patch,
  Post,
} from '@nestjs/common';
import {
  ApiBody,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';

import {
  PROFILE_SERVICE,
  SESSION_SERVICE,
} from '../constants/injection-tokens';

import { CreateUserDto } from '../dtos/create-user.dto';
import { UpdateProfileDto } from '../dtos/update-profile.dto';
import { User } from '../domains/entities/user.entity';

import * as sessionServiceInterface from '../services/interfaces/session.service.interface';
import * as profileServiceInterface from '../services/interfaces/profile.service.interface';
import { IProfileController } from './interfaces/profile.controller.interface';

@ApiTags('users')
@Controller('users')
export class ProfileControllerImpl implements IProfileController {
  constructor(
    @Inject(PROFILE_SERVICE)
    private readonly profileService: profileServiceInterface.IProfileService,

    @Inject(SESSION_SERVICE)
    private readonly sessionService: sessionServiceInterface.ISessionService,
  ) {}

  @Post()
  @ApiOperation({ summary: 'Create a new user' })
  @ApiBody({ type: CreateUserDto })
  @ApiResponse({ status: 201, description: 'User created' })
  create(@Body() dto: CreateUserDto): Promise<User> {
    return this.profileService.createUser(dto);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get user by ID' })
  @ApiParam({ name: 'id', type: String })
  @ApiResponse({ status: 200, description: 'User found' })
  @ApiResponse({ status: 404, description: 'User not found' })
  getById(@Param('id') id: string): Promise<User> {
    return this.profileService.getUserById(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update user profile' })
  @ApiParam({ name: 'id', type: String })
  @ApiBody({ type: UpdateProfileDto })
  @ApiResponse({ status: 200, description: 'Profile updated' })
  update(
    @Param('id') id: string,
    @Body() dto: UpdateProfileDto,
  ): Promise<User> {
    return this.profileService.updateProfile(id, dto);
  }

  @Patch(':id/deactivate')
  @ApiOperation({ summary: 'Deactivate a user' })
  @ApiParam({ name: 'id', type: String })
  @ApiResponse({ status: 200, description: 'User deactivated' })
  deactivate(@Param('id') id: string): Promise<void> {
    return this.profileService.deactivateUser(id);
  }

  @Patch(':id/sessions/revoke')
  @ApiOperation({ summary: 'Revoke all active sessions for a user' })
  @ApiParam({ name: 'id', type: String })
  @ApiResponse({ status: 200, description: 'Sessions revoked' })
  revokeSessions(@Param('id') id: string): Promise<void> {
    return this.sessionService.revokeAll(id);
  }
}
