import { Controller, Get, Param, Post, UseGuards } from "@nestjs/common";
import { CurrentSession } from "../session/current-session.decorator";
import { Session } from "../session/session.entity";
import { SessionGuard } from "../session/session.guard";
import { DocumentService } from "./document.service";

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

}