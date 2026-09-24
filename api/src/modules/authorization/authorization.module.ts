import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Level } from '../level/level.entity';
import { AuthorizationService } from './authorization.service';

@Module({
    imports: [TypeOrmModule.forFeature([Level])],
    providers: [AuthorizationService],
    exports: [AuthorizationService],
})
export class AuthorizationModule {}
