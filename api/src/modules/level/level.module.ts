import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Level } from './level.entity';
import { LevelShare } from './level-share.entity';
import { LevelAccess } from './level-access.entity';
import { LevelService } from './level.service';
import { LevelController } from './level.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Level, LevelShare, LevelAccess])],
  providers: [LevelService],
  exports: [LevelService],
  controllers: [LevelController],
})
export class LevelModule {}
