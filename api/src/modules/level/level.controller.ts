import { Body, Controller, Delete, Get, Param, Post, Put, UploadedFile, UseGuards, UseInterceptors } from "@nestjs/common";
import { CreateLevelDto, UpdateLevelDto } from "./level.dto";
import { LevelService } from "./level.service";
import { SessionGuard } from "../session/session.guard";
import { CurrentSession } from "../session/current-session.decorator";
import { Session } from "../session/session.entity";
import { FileInterceptor } from "@nestjs/platform-express";
import { Express } from "express";
import "multer";

@Controller('level')
export class LevelController {

    constructor(protected readonly levelService: LevelService) {}

    @UseGuards(SessionGuard)
    @Post()
    create(@Body() body: CreateLevelDto, @CurrentSession() session: Session) {
        return this.levelService.create({
            name: body.name,
            userId: session.userId,
        });
    }

    @UseGuards(SessionGuard)
    @Get()
    getAll(@CurrentSession() session: Session) {
        return this.levelService.getAllFromUser(session.userId);
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

    @Post(':id/playback')
    setPlayback(
        @Param('id') id: string, 
        @Body() body: { playbackId: string | null }, 
        @CurrentSession() session: Session
    ) {
        return this.levelService.setPlayback(id, session.userId, body);
    }

    @UseGuards(SessionGuard)
    @Put(':id')
    update(
        @Param('id') id: string, 
        @Body() body: UpdateLevelDto, 
        @CurrentSession() session: Session
    ) {
        return this.levelService.update(id, session.userId, body);
    }

}