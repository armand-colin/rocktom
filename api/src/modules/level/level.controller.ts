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

@Controller('level')
export class LevelController {

    constructor(protected readonly levelService: LevelService) {}

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
    getById(@Param('id') id: string, @CurrentSession() session: Session) {
        return this.levelService.getById(id, session.userId);
    }

    @UseGuards(SessionGuard)
    @Delete(':id')
    delete(@Param('id') id: string, @CurrentSession() session: Session) {
        return this.levelService.delete(id, session.userId);
    }

    @UseGuards(SessionGuard)
    @Post(':id/share')
    createShare(
        @Param('id') id: string,
        @Body() body: CreateLevelShareDto,
        @CurrentSession() session: Session,
    ) {
        return this.levelService.createShare(id, session.userId, body);
    }

    @UseGuards(SessionGuard)
    @Get(':id/share')
    getShare(@Param('id') id: string, @CurrentSession() session: Session) {
        return this.levelService.getShare(id, session.userId);
    }

    @UseGuards(SessionGuard)
    @Put(':id/share')
    updateShare(
        @Param('id') id: string,
        @Body() body: UpdateLevelShareDto,
        @CurrentSession() session: Session,
    ) {
        return this.levelService.updateShare(id, session.userId, body);
    }

    @UseGuards(SessionGuard)
    @Put(':id')
    update(
        @Param('id') id: string,
        @Body() body: UpdateLevelDto,
        @CurrentSession() session: Session,
    ) {
        return this.levelService.update(id, session.userId, body);
    }

}
