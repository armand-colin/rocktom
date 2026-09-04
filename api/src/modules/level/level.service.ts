import { InjectRepository } from "@nestjs/typeorm";
import { Level } from "./level.entity";
import { LevelShare, LevelSharePermission } from "./level-share.entity";
import { LevelAccess } from "./level-access.entity";
import { Repository } from "typeorm";
import {
    BadRequestException,
    ForbiddenException,
    Injectable,
    NotFoundException,
} from "@nestjs/common";
import {
    CreateLevelDto,
    CreateLevelShareDto,
    LevelShareDto,
    LevelSharePreviewDto,
    UpdateLevelDto,
    UpdateLevelShareDto,
} from "./level.dto";
import { randomUUID } from "crypto";

type LevelAccessRole = 'owner' | 'write' | 'read';

@Injectable()
export class LevelService {

    constructor(
        @InjectRepository(Level)
        protected readonly levelRepository: Repository<Level>,
        @InjectRepository(LevelShare)
        protected readonly levelShareRepository: Repository<LevelShare>,
        @InjectRepository(LevelAccess)
        protected readonly levelAccessRepository: Repository<LevelAccess>,
    ) {}

    async create(body: CreateLevelDto & {
        userId: string,
    }): Promise<Level> {
        const level = this.levelRepository.create({
            userId: body.userId,
            name: body.name,
            serialized: '',
            instrumentTypes: body.instrumentTypes,
        })

        return this.levelRepository.save(level);
    }

    getAllFromUser(userId: string): Promise<Level[]> {
        return this.levelRepository
            .createQueryBuilder('level')
            .where('level.userId = :userId', { userId })
            .orWhere((qb) => {
                const subQuery = qb
                    .subQuery()
                    .select('access.levelId')
                    .from(LevelAccess, 'access')
                    .innerJoin(
                        LevelShare,
                        'share',
                        'share.levelId = access.levelId',
                    )
                    .where('access.userId = :userId')
                    .andWhere('share.enabled = true')
                    .getQuery();
                return `level.id IN ${subQuery}`;
            })
            .orderBy('level.createdAt', 'DESC')
            .getMany();
    }

    async tryResolveAccess(
        id: string,
        requestingUserId: string,
    ): Promise<{ level: Level; role: LevelAccessRole } | null> {
        const level = await this.levelRepository.findOne({
            where: { id },
        });

        if (!level) {
            return null;
        }

        if (level.userId === requestingUserId) {
            return { level, role: 'owner' };
        }

        const access = await this.levelAccessRepository.findOne({
            where: {
                levelId: id,
                userId: requestingUserId,
            },
        });

        if (!access) {
            return null;
        }

        const share = await this.levelShareRepository.findOne({
            where: { levelId: id },
        });

        if (!share?.enabled) {
            return null;
        }

        return {
            level,
            role: share.permission === 'write' ? 'write' : 'read',
        };
    }

    async getById(id: string, requestingUserId: string): Promise<Level> {
        const resolved = await this.tryResolveAccess(id, requestingUserId);

        if (!resolved) {
            throw new NotFoundException('level_not_found');
        }

        return resolved.level;
    }

    async delete(id: string, requestingUserId: string): Promise<void> {
        const resolved = await this.tryResolveAccess(id, requestingUserId);

        if (!resolved || resolved.role !== 'owner') {
            throw new NotFoundException('level_not_found');
        }

        await this.levelRepository.delete({ id });
    }

    async update(
        id: string,
        requestingUserId: string,
        body: UpdateLevelDto,
    ): Promise<Level> {
        const resolved = await this.tryResolveAccess(id, requestingUserId);

        if (!resolved) {
            throw new NotFoundException('level_not_found');
        }

        if (resolved.role === 'read') {
            throw new ForbiddenException('level_read_only');
        }

        const level = resolved.level;
        level.name = body.name;
        level.serialized = body.serialized;
        level.duration = body.duration | 0; // Convert to integer in case of
        level.playbackId = body.playbackId;
        level.instrumentTypes = body.instrumentTypes;

        return this.levelRepository.save(level);
    }

    async createShare(
        id: string,
        requestingUserId: string,
        body: CreateLevelShareDto,
    ): Promise<LevelShareDto> {
        await this.getOwnedLevel(id, requestingUserId);

        const existing = await this.levelShareRepository.findOne({
            where: { levelId: id },
        });

        if (existing) {
            return this.toShareDto(existing);
        }

        const share = this.levelShareRepository.create({
            levelId: id,
            token: randomUUID(),
            permission: body.permission ?? 'read',
            enabled: true,
        });

        return this.toShareDto(await this.levelShareRepository.save(share));
    }

    async updateShare(
        id: string,
        requestingUserId: string,
        body: UpdateLevelShareDto,
    ): Promise<LevelShareDto> {
        await this.getOwnedLevel(id, requestingUserId);

        const share = await this.levelShareRepository.findOne({
            where: { levelId: id },
        });

        if (!share) {
            throw new NotFoundException('level_share_not_found');
        }

        if (body.permission === undefined && body.enabled === undefined) {
            throw new BadRequestException('no_share_updates');
        }

        if (body.permission !== undefined) {
            share.permission = body.permission;
        }

        if (body.enabled !== undefined) {
            share.enabled = body.enabled;
        }

        return this.toShareDto(await this.levelShareRepository.save(share));
    }

    async getShare(
        id: string,
        requestingUserId: string,
    ): Promise<LevelShareDto> {
        await this.getOwnedLevel(id, requestingUserId);

        const share = await this.levelShareRepository.findOne({
            where: { levelId: id },
        });

        if (!share) {
            throw new NotFoundException('level_share_not_found');
        }

        return this.toShareDto(share);
    }

    async previewShare(token: string): Promise<LevelSharePreviewDto> {
        const share = await this.tryGetEnabledShareByToken(token);
        const level = await this.levelRepository.findOne({
            where: { id: share.levelId },
        });

        if (!level) {
            throw new NotFoundException('level_share_not_found');
        }

        return {
            name: level.name,
            permission: share.permission,
        };
    }

    async acceptShare(token: string, requestingUserId: string): Promise<Level> {
        const share = await this.tryGetEnabledShareByToken(token);
        const level = await this.levelRepository.findOne({
            where: { id: share.levelId },
        });

        if (!level) {
            throw new NotFoundException('level_share_not_found');
        }

        if (level.userId === requestingUserId) {
            throw new BadRequestException('cannot_accept_own_share');
        }

        const existing = await this.levelAccessRepository.findOne({
            where: {
                levelId: level.id,
                userId: requestingUserId,
            },
        });

        if (!existing) {
            const access = this.levelAccessRepository.create({
                levelId: level.id,
                userId: requestingUserId,
            });
            await this.levelAccessRepository.save(access);
        }

        return level;
    }

    protected async getOwnedLevel(
        id: string,
        requestingUserId: string,
    ): Promise<Level> {
        const level = await this.levelRepository.findOne({
            where: {
                id,
                userId: requestingUserId,
            },
        });

        if (!level) {
            throw new NotFoundException('level_not_found');
        }

        return level;
    }

    protected async tryGetEnabledShareByToken(
        token: string,
    ): Promise<LevelShare> {
        const share = await this.levelShareRepository.findOne({
            where: { token },
        });

        if (!share || !share.enabled) {
            throw new NotFoundException('level_share_not_found');
        }

        return share;
    }

    protected toShareDto(share: LevelShare): LevelShareDto {
        return {
            token: share.token,
            permission: share.permission as LevelSharePermission,
            enabled: share.enabled,
        };
    }

}
