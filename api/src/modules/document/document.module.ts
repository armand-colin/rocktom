import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Document } from './document.entity';
import { DocumentService } from './document.service';
import { DocumentController } from './document.controller';
import { AuthorizationModule } from '../authorization/authorization.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Document]),
    AuthorizationModule
  ],
  providers: [DocumentService],
  exports: [DocumentService],
  controllers: [DocumentController],
})
export class DocumentModule { }
