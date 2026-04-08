import { Body, Controller, Get, Param, Patch, Post } from '@nestjs/common';
import { UserManagementFacade } from '../facade/user-management.facade';
import { CreateUserDto } from '../dtos/create-user.dto';
import { UpdateProfileDto } from '../dtos/update-profile.dto';

@Controller('users')
export class ProfileController {
  constructor(private readonly facade: UserManagementFacade) {}

  @Post()
  create(@Body() dto: CreateUserDto) {
    return this.facade.createUser(dto);
  }

  @Get(':id')
  getById(@Param('id') id: string) {
    return this.facade.getUserById(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateProfileDto) {
    return this.facade.updateProfile(id, dto);
  }

  @Patch(':id/deactivate')
  deactivate(@Param('id') id: string) {
    return this.facade.deactivateUser(id);
  }

  @Patch(':id/sessions/revoke')
  revokeSessions(@Param('id') id: string) {
    return this.facade.revokeAllSessions(id);
  }
}
