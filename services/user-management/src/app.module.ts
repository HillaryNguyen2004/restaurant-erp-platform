import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ProfileModule } from './modules/profile/profile.module';
import { AuthenticationModule } from './modules/authentication/authentication.module';
import { RolesModule } from './modules/roles/roles.module';

@Module({
  imports: [ProfileModule, AuthenticationModule, RolesModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
