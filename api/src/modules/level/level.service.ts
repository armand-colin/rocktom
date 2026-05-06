import { InjectRepository } from "@nestjs/typeorm";
import { Level } from "./level.entity";
import { Repository } from "typeorm";
import { NotFoundException } from "@nestjs/common";
import { UpdateLevelDto } from "./level.dto";

export class LevelService {

    constructor(
        @InjectRepository(Level)
        protected readonly levelRepository: Repository<Level>,
    ) {}

    async create(body: {
        userId: string,
        name: string,
    }): Promise<Level> {
        const level = this.levelRepository.create({
            userId: body.userId,
            name: body.name,
            playbackId: null,
            serialized: '',
        })

        return this.levelRepository.save(level);
    }

    getAllFromUser(userId: string): Promise<Level[]> {
        return this.levelRepository.find({
            where: {
                userId,
            },
            order: {
                createdAt: 'DESC',
            },
            relations: {
                playback: true,
            },
        });
    }

    tryGetById(id: string, requestingUserId: string): Promise<Level | null> {
        return this.levelRepository.findOne({
            where: {
                id,
                userId: requestingUserId,
            },
            relations: {
                playback: true,
            },
        });
    }

    async getById(id: string, requestingUserId: string): Promise<Level> {
        const level = await this.tryGetById(id, requestingUserId);
        
        if (!level) {
            throw new NotFoundException('level_not_found');
        }

        return level;
    }

    async delete(id: string, requestingUserId: string): Promise<void> {
        await this.levelRepository.delete({
            id,
            userId: requestingUserId,
        });
    }

    async update(id: string, requestingUserId: string, body: UpdateLevelDto): Promise<Level> {
        const level = await this.getById(id, requestingUserId);

        level.name = body.name;
        level.serialized = body.serialized;

        return this.levelRepository.save(level);
    }

}