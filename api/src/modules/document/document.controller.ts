import { Controller, Get, Param, Post, UploadedFile, UseGuards, UseInterceptors } from "@nestjs/common";
import { CurrentSession } from "../session/current-session.decorator";
import { Session } from "../session/session.entity";
import { SessionGuard } from "../session/session.guard";
import { DocumentService } from "./document.service";
import { FileInterceptor } from "@nestjs/platform-express";

@Controller('document')
export class DocumentController {

    constructor(protected readonly documentService: DocumentService) {}
    
    @UseGuards(SessionGuard)
    @Get(':id')
    getById(
        @Param('id') id: string,
        @CurrentSession() session: Session
    ) {
        return this.documentService.getById(id, session.userId);
    }

    @UseGuards(SessionGuard)
    @Get()
    getAll(@CurrentSession() session: Session) {
        return this.documentService.getAll(session.userId);
    }

    @Post('upload')
    @UseInterceptors(FileInterceptor('file'))
    @UseGuards(SessionGuard)
    upload(
        @CurrentSession() session: Session,
        @UploadedFile() file: Express.Multer.File
    ) {
        return this.documentService.upload(file, session.userId);
    }

}