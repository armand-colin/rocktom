import { Body, Controller, Delete, Get, Param, Post, Put, UseGuards } from "@nestjs/common";
import {
    CreateLevelDto,
    CreateLevelShareDto,
    UpdateLevelDto,
    UpdateLevelShareDto,
} from "./level.dto";
import { LevelService } from "./level.service";
import { SessionGuard } from "../session/session.guard";
import { CurrentSession } from "../session/current-session.decorator";
import { Session } from "../session/session.entity";
import "multer";
import { AuthorizationService } from "../authorization/authorization.service";

@Controller('level')
export class LevelController {

    constructor(
        protected readonly levelService: LevelService,
        protected readonly authorizationService: AuthorizationService,
    ) {}

    @UseGuards(SessionGuard)
    @Post()
    create(@Body() body: CreateLevelDto, @CurrentSession() session: Session) {
        return this.levelService.create({
            name: body.name,
            instrumentTypes: body.instrumentTypes,
            userId: session.userId,
        });
    }

    @UseGuards(SessionGuard)
    @Get()
    getAll(@CurrentSession() session: Session) {
        return this.levelService.getAllFromUser(session.userId);
    }

    @UseGuards(SessionGuard)
    @Get('share/:token')
    previewShare(@Param('token') token: string) {
        return this.levelService.previewShare(token);
    }

    @UseGuards(SessionGuard)
    @Post('share/:token/accept')
    acceptShare(
        @Param('token') token: string,
        @CurrentSession() session: Session,
    ) {
        return this.levelService.acceptShare(token, session.userId);
    }

    @UseGuards(SessionGuard)
    @Get(':id')
    async getById(@Param('id') id: string, @CurrentSession() session: Session) {
        await this.authorizationService.level.read({ levelId: id, userId: session.userId }).assert();
        return this.levelService.getById(id);
    }

    @UseGuards(SessionGuard)
    @Delete(':id')
    async delete(@Param('id') id: string, @CurrentSession() session: Session) {
        await this.authorizationService.level.delete({ levelId: id, userId: session.userId }).assert();
        return this.levelService.delete(id);
    }

    @UseGuards(SessionGuard)
    @Post(':id/share')
    async createShare(
        @Param('id') id: string,
        @Body() body: CreateLevelShareDto,
        @CurrentSession() session: Session,
    ) {
        await this.authorizationService.level.share({ levelId: id, userId: session.userId }).assert();
        return this.levelService.createShare(id, body);
    }

    @UseGuards(SessionGuard)
    @Get(':id/share')
    async getShare(@Param('id') id: string, @CurrentSession() session: Session) {
        await this.authorizationService.level.share({ levelId: id, userId: session.userId }).assert();
        return this.levelService.getShare(id);
    }

    @UseGuards(SessionGuard)
    @Put(':id/share')
    async updateShare(
        @Param('id') id: string,
        @Body() body: UpdateLevelShareDto,
        @CurrentSession() session: Session,
    ) {
        await this.authorizationService.level.share({ levelId: id, userId: session.userId }).assert();
        return this.levelService.updateShare(id, body);
    }

    @UseGuards(SessionGuard)
    @Put(':id')
    async update(
        @Param('id') id: string,
        @Body() body: UpdateLevelDto,
        @CurrentSession() session: Session,
    ) {
        await this.authorizationService.level.write({ levelId: id, userId: session.userId }).assert();
        return this.levelService.update(id, body);
    }

}
