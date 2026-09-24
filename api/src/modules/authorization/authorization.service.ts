import { Injectable } from '@nestjs/common';
import { LevelAuthorizedActionFactory } from './actions/level.authorized-action';
import { Repository } from 'typeorm';
import { Level } from '../level/level.entity';
import { InjectRepository } from '@nestjs/typeorm';

@Injectable()
export class AuthorizationService {

    readonly level: LevelAuthorizedActionFactory;

    constructor(
        @InjectRepository(Level)
        private readonly levelRepository: Repository<Level>
    ) {
        this.level = new LevelAuthorizedActionFactory(this.levelRepository);
    }

}
