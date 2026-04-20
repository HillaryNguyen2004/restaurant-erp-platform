import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';

import { AuthenticationController } from './controllers/authentication.controller';
import { ProfileController } from './controllers/profile.controller';
import { RoleController } from './controllers/role.controller';

import { UserManagementFacade } from './facade/user-management.facade';

import { Authenticator } from './services/authenticaton.service';
import { ProfileService } from './services/profile.service';
import { RoleService } from './services/role.service';
import { SessionService } from './services/session.service';

import { UserRepositoryImpl } from './repositories/user/user.repository.impl';
import { RoleRepositoryImpl } from './repositories/role/role.repository.impl';
import { SessionRepositoryImpl } from './repositories/session/session.repository.impl';

import { BcryptHasherAdapter } from './adapters/bcrypt-hasher.adapter';
import { JwtTokenProviderAdapter } from './adapters/jwt-token-provider.adapter';
import { KafkaEventPublisherAdapter } from './adapters/kafka-event-publisher.adapter';

import {
  EVENT_PUBLISHER,
  PASSWORD_HASHER,
  ROLE_REPOSITORY,
  SESSION_REPOSITORY,
  TOKEN_PROVIDER,
  USER_REPOSITORY,
} from './constants/injection-tokens';

@Module({
  imports: [
    JwtModule.register({
      secret: process.env.JWT_SECRET ?? 'dev-secret',
    }),
  ],
  controllers: [AuthenticationController, ProfileController, RoleController],
  providers: [
    UserManagementFacade,

    Authenticator,
    ProfileService,
    RoleService,
    SessionService,

    { provide: USER_REPOSITORY, useClass: UserRepositoryImpl },
    { provide: ROLE_REPOSITORY, useClass: RoleRepositoryImpl },
    { provide: SESSION_REPOSITORY, useClass: SessionRepositoryImpl },

    { provide: PASSWORD_HASHER, useClass: BcryptHasherAdapter },
    { provide: TOKEN_PROVIDER, useClass: JwtTokenProviderAdapter },
    { provide: EVENT_PUBLISHER, useClass: KafkaEventPublisherAdapter },
  ],
  exports: [UserManagementFacade],
})
export class UserManagementModule {}
