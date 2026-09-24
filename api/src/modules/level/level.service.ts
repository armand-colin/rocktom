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

@Injectable()
export class LevelService {

    constructor(
        @InjectRepository(Level)
        protected readonly levelRepository: Repository<Level>,
        @InjectRepository(LevelShare)
        protected readonly levelShareRepository: Repository<LevelShare>,
        @InjectRepository(LevelAccess)
        protected readonly levelAccessRepository: Repository<LevelAccess>,
    ) { }

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
        return this.levelRepository.find({
            where: [
                {
                    userId: userId
                },
                {
                    access: {
                        userId: userId,
                    },
                    share: {
                        enabled: true
                    }
                }
            ],
            order: {
                createdAt: 'DESC',
            },
            relations: ['share', 'user'],
            select: {
                user: {
                    name: true,
                },
                share: {
                    token: true,
                    enabled: true,
                    permission: true,
                }
            }
        })
    }

    async getById(id: string): Promise<Level> {
        const level = await await this.levelRepository.findOne({
            where: {
                id: id,
            },
        });

        if (!level) {
            throw new NotFoundException('level_not_found');
        }

        return level;
    }

    async delete(id: string): Promise<void> {
        await this.levelRepository.delete({ id });
    }

    async update(
        id: string,
        body: UpdateLevelDto,
    ): Promise<Level> {
        const level = await this.getById(id)

        level.name = body.name;
        level.serialized = body.serialized;
        level.duration = body.duration | 0; // Convert to integer in case of
        level.playbackId = body.playbackId;
        level.instrumentTypes = body.instrumentTypes;

        return this.levelRepository.save(level);
    }

    async createShare(
        id: string,
        body: CreateLevelShareDto,
    ): Promise<LevelShareDto> {
        const existing = await this.levelShareRepository.findOne({
            where: {
                levelId: id,
            }
        })

        if (existing) {
            return this.toShareDto(existing);
        }

        const share = await this.levelShareRepository.create({
            levelId: id,
            token: randomUUID(),
            permission: body.permission ?? 'read',
            enabled: true,
        });

        return this.toShareDto(share);
    }

    async updateShare(
        id: string,
        body: UpdateLevelShareDto,
    ): Promise<LevelShareDto> {
        const share = await this._getShare(id);

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

    private async _getShare(id: string): Promise<LevelShare> {
        const share = await this.levelShareRepository.findOne({
            where: {
                levelId: id,
            }
        })

        if (!share) {
            throw new NotFoundException('level_share_not_found');
        }

        return share;
    }

    async getShare(
        id: string,
    ): Promise<LevelShareDto> {
        const share = await this._getShare(id);

        return this.toShareDto(share);
    }

    async previewShare(token: string): Promise<LevelSharePreviewDto> {
        const level = await this.levelRepository.findOne({
            where: {
                share: {
                    token: token,
                    enabled: true,
                }
            },
            relations: ["user", "share"],
            select: {
                id: true,
                name: true,
                instrumentTypes: true,
                duration: true,
                user: {
                    name: true,
                },
                share: {
                    permission: true,
                }
            }
        });

        if (!level) {
            throw new NotFoundException('level_share_not_found');
        }

        return level as LevelSharePreviewDto;
    }

    async acceptShare(token: string, requestingUserId: string): Promise<Level> {
        const level = await this.levelRepository.findOne({
            where: {
                share: {
                    token: token,
                    enabled: true,
                }
            },
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
