import { Injectable } from '@nestjs/common';
import { LevelAuthorizedActionFactory } from './actions/level.authorized-action';
import { Repository } from 'typeorm';
import { Level } from '../level/level.entity';
import { DocumentAuthorizedActionFactory } from './actions/document.authorized-action';
import { Document } from '../document/document.entity';
import { InjectRepository } from '@nestjs/typeorm';

@Injectable()
export class AuthorizationService {

    readonly level: LevelAuthorizedActionFactory;
    readonly document: DocumentAuthorizedActionFactory;

    constructor(
        @InjectRepository(Document)
        private readonly documentRepository: Repository<Document>
        @InjectRepository(Level)
        private readonly levelRepository: Repository<Level>
    ) {
        this.level = new LevelAuthorizedActionFactory(this.levelRepository);
        this.document = new DocumentAuthorizedActionFactory(this.documentRepository);
    }

}
