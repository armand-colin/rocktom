import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Level } from './level.entity';
import { LevelService } from './level.service';
import { LevelController } from './level.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Level])],
  providers: [LevelService],
  exports: [LevelService],
  controllers: [LevelController],
})
export class LevelModule {}
