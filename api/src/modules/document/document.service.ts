import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Equal, IsNull, Or, Repository } from 'typeorm';
import { Document } from './document.entity';

@Injectable()
export class DocumentService {
  constructor(
    @InjectRepository(Document)
    private readonly documentRepository: Repository<Document>,
  ) { }

  async create(body: {
    userId: string | null;
    filename: string;
    extension: string;
    size: number;
    duration: number | null;
  }): Promise<Document> {
    const document = this.documentRepository.create({
      userId: body.userId ?? null,
      filename: body.filename,
      extension: body.extension,
      size: body.size,
      duration: body.duration ?? null,
    });

    return this.documentRepository.save(document);
  }

  tryGetById(id: string, requestingUserId: string): Promise<Document | null> {
    return this.documentRepository.findOne({
      where: {
        id,
        userId: Or(IsNull(), Equal(requestingUserId))
      }
    });
  }

  async getById(id: string, requestingUserId: string): Promise<Document> {
    const document = await this.tryGetById(id, requestingUserId);
    if (!document) {
      throw new NotFoundException('document_not_found');
    }
    return document;
  }

}
