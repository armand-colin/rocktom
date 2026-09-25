import { Injectable } from '@nestjs/common';
import { LevelAuthorizedActionFactory } from './actions/level.authorized-action';
import { Repository } from 'typeorm';
import { Level } from '../level/level.entity';
import { DocumentAuthorizedActionFactory } from './actions/document.authorized-action';
import { Document } from '../document/document.entity';

@Injectable()
export class AuthorizationService {

    readonly level: LevelAuthorizedActionFactory;
    readonly document: DocumentAuthorizedActionFactory;

    constructor(
        private readonly levelRepository: Repository<Level>,
        private readonly documentRepository: Repository<Document>
    ) {
        this.level = new LevelAuthorizedActionFactory(this.levelRepository);
        this.document = new DocumentAuthorizedActionFactory(this.documentRepository);
    }

}
