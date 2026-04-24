import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';

import { AuthenticationControllerImpl } from './controllers/authentication.controller.impl';
import { ProfileControllerImpl } from './controllers/profile.controller.impl';
import { RoleControllerImpl } from './controllers/role.controller.impl';

import { AuthenticationServiceImpl } from './services/authenticaton.service.impl';
import { ProfileServiceImpl } from './services/profile.service.impl';
import { RoleServiceImpl } from './services/role.service.impl';
import { SessionServiceImpl } from './services/session.service.impl';

import { UserRepositoryImpl } from './repositories/user/user.repository.impl';
import { RoleRepositoryImpl } from './repositories/role/role.repository.impl';
import { SessionRepositoryImpl } from './repositories/session/session.repository.impl';

import { BcryptHasherAdapter } from './adapters/bcrypt-hasher.adapter';
import { JwtTokenProviderAdapter } from './adapters/jwt-token-provider.adapter';
import { KafkaEventPublisherAdapter } from './adapters/kafka-event-publisher.adapter';

import {
  AUTHENTICATION_SERVICE,
  PROFILE_SERVICE,
  ROLE_SERVICE,
  SESSION_SERVICE,
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

  controllers: [
    AuthenticationControllerImpl,
    ProfileControllerImpl,
    RoleControllerImpl,
  ],

  providers: [
    AuthenticationServiceImpl,
    ProfileServiceImpl,
    RoleServiceImpl,

    {
      provide: AUTHENTICATION_SERVICE,
      useExisting: AuthenticationServiceImpl,
    },
    {
      provide: PROFILE_SERVICE,
      useExisting: ProfileServiceImpl,
    },
    {
      provide: ROLE_SERVICE,
      useExisting: RoleServiceImpl,
    },
    {
      provide: SESSION_SERVICE,
      useExisting: SessionServiceImpl,
    },

    {
      provide: USER_REPOSITORY,
      useClass: UserRepositoryImpl,
    },
    {
      provide: ROLE_REPOSITORY,
      useClass: RoleRepositoryImpl,
    },
    {
      provide: SESSION_REPOSITORY,
      useClass: SessionRepositoryImpl,
    },

    {
      provide: PASSWORD_HASHER,
      useClass: BcryptHasherAdapter,
    },
    {
      provide: TOKEN_PROVIDER,
      useClass: JwtTokenProviderAdapter,
    },
    {
      provide: EVENT_PUBLISHER,
      useClass: KafkaEventPublisherAdapter,
    },
  ],

  exports: [
    AUTHENTICATION_SERVICE,
    PROFILE_SERVICE,
    ROLE_SERVICE,
    SESSION_SERVICE,
  ],
})
export class UserManagementModule {}
