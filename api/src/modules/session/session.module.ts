import { Global, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Session } from './session.entity';
import { SessionController } from './session.controller';
import { SessionService } from './session.service';
import { JwtService } from './jwt.service';
import { UserModule } from '../user/user.module';
import { SessionGuard } from './session.guard';

@Global()
@Module({
  imports: [TypeOrmModule.forFeature([Session]), UserModule],
  controllers: [SessionController],
  providers: [SessionService, JwtService, SessionGuard],
  exports: [SessionService, JwtService, SessionGuard],
})
export class SessionModule {}
