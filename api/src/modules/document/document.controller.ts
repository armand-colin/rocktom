import { Controller, Delete, Get, Param, Post, UploadedFile, UseGuards, UseInterceptors } from "@nestjs/common";
import { CurrentSession } from "../session/current-session.decorator";
import { Session } from "../session/session.entity";
import { SessionGuard } from "../session/session.guard";
import { DocumentService } from "./document.service";
import { FileInterceptor } from "@nestjs/platform-express";
import { AuthorizationService } from "../authorization/authorization.service";

@Controller('document')
export class DocumentController {

    constructor(
        protected readonly documentService: DocumentService,
        protected readonly authorizationService: AuthorizationService
    ) {}
    
    @UseGuards(SessionGuard)
    @Get(':id')
    async getById(
        @Param('id') id: string,
        @CurrentSession() session: Session
    ) {
        await this.authorizationService.document.read({ documentId: id, userId: session.userId }).assert();
        return this.documentService.getById(id);
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

    @Get(':id/download')
    @UseGuards(SessionGuard)
    async download(
        @Param('id') id: string,
        @CurrentSession() session: Session
    ) {
        await this.authorizationService.document.read({ documentId: id, userId: session.userId }).assert();
        return this.documentService.download(id);
    }

    @Delete(':id')
    @UseGuards(SessionGuard)
    async delete(
        @Param('id') id: string,
        @CurrentSession() session: Session
    ) {
        await this.authorizationService.document.delete({ documentId: id, userId: session.userId }).assert();
        return this.documentService.remove(id);
    }

}