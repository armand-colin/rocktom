import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Level } from './level.entity';
import { LevelShare } from './level-share.entity';
import { LevelAccess } from './level-access.entity';
import { LevelService } from './level.service';
import { LevelController } from './level.controller';
import { AuthorizationModule } from '../authorization/authorization.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Level, LevelShare, LevelAccess]),
    AuthorizationModule
  ],
  providers: [LevelService],
  exports: [LevelService],
  controllers: [LevelController],
})
export class LevelModule {}
