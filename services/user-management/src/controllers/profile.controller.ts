import { Body, Controller, Get, Param, Patch, Post } from '@nestjs/common';
import {
  ApiBody,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { UserManagementFacade } from '../facade/user-management.facade';
import { CreateUserDto } from '../dtos/create-user.dto';
import { UpdateProfileDto } from '../dtos/update-profile.dto';

@ApiTags('users')
@Controller('users')
export class ProfileController {
  constructor(private readonly facade: UserManagementFacade) {}

  @Post()
  @ApiOperation({ summary: 'Create a new user' })
  @ApiBody({ type: CreateUserDto })
  @ApiResponse({ status: 201, description: 'User created' })
  create(@Body() dto: CreateUserDto) {
    return this.facade.createUser(dto);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get user by ID' })
  @ApiParam({ name: 'id', type: String })
  @ApiResponse({ status: 200, description: 'User found' })
  @ApiResponse({ status: 404, description: 'User not found' })
  getById(@Param('id') id: string) {
    return this.facade.getUserById(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update user profile' })
  @ApiParam({ name: 'id', type: String })
  @ApiBody({ type: UpdateProfileDto })
  @ApiResponse({ status: 200, description: 'Profile updated' })
  update(@Param('id') id: string, @Body() dto: UpdateProfileDto) {
    return this.facade.updateProfile(id, dto);
  }

  @Patch(':id/deactivate')
  @ApiOperation({ summary: 'Deactivate a user' })
  @ApiParam({ name: 'id', type: String })
  @ApiResponse({ status: 200, description: 'User deactivated' })
  deactivate(@Param('id') id: string) {
    return this.facade.deactivateUser(id);
  }

  @Patch(':id/sessions/revoke')
  @ApiOperation({ summary: 'Revoke all active sessions for a user' })
  @ApiParam({ name: 'id', type: String })
  @ApiResponse({ status: 200, description: 'Sessions revoked' })
  revokeSessions(@Param('id') id: string) {
    return this.facade.revokeAllSessions(id);
  }
}
