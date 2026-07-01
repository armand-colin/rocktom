import { InjectRepository } from "@nestjs/typeorm";
import { Level } from "./level.entity";
import { Repository } from "typeorm";
import { NotFoundException } from "@nestjs/common";
import { UpdateLevelDto } from "./level.dto";
import { randomUUID } from "node:crypto";

type FindOptions = Partial<{
    shareCode: boolean;
}>

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
        });
    }

    tryGetById(id: string, requestingUserId: string, options?: FindOptions): Promise<Level | null> {
        return this.levelRepository.findOne({
            where: {
                id,
                userId: requestingUserId,
            },
            select: options?.shareCode ? {
                shareCode: true,
            } : undefined,
        });
    }

    async getById(id: string, requestingUserId: string, options?: FindOptions): Promise<Level> {
        const level = await this.tryGetById(id, requestingUserId, options);
        
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
        level.duration = body.duration | 0; // Convert to integer in case of
        level.playbackId = body.playbackId;

        return this.levelRepository.save(level);
    }

    async share(id: string, requestingUserId: string): Promise<{ shareCode: string }> {
        const level = await this.getById(id, requestingUserId, { shareCode: true });
        if (level.shareCode) {
            return { shareCode: level.shareCode };
        }

        const shareCode = randomUUID();
        level.shareCode = shareCode;
        await this.levelRepository.save(level);
        
        return { shareCode };
    }

}