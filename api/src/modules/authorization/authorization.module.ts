import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Level } from '../level/level.entity';
import { AuthorizationService } from './authorization.service';
import { Document } from '../document/document.entity';

@Module({
    imports: [TypeOrmModule.forFeature([Level, Document])],
    providers: [AuthorizationService],
    exports: [AuthorizationService],
})
export class AuthorizationModule {}
