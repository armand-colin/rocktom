import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Equal, IsNull, Or, Repository } from 'typeorm';
import { Document } from './document.entity';
import { AppConfigService } from '../../config/config.service';
import path from 'path';
import { UUID } from 'typeorm/driver/mongodb/bson.typings.js';
import { writeFile } from 'fs/promises';
import { uuid } from '../../utils/uuid';

@Injectable()
export class DocumentService {

  private readonly directory: string;

  constructor(
    @InjectRepository(Document)
    private readonly documentRepository: Repository<Document>,
    private readonly config: AppConfigService,
  ) {
    this.directory = config.storage.path;
  }

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
        user: { id: requestingUserId }
      },
    });
  }

  async getById(id: string, requestingUserId: string): Promise<Document> {
    const document = await this.tryGetById(id, requestingUserId);
    if (!document) {
      throw new NotFoundException('document_not_found');
    }
    return document;
  }

  async getAll(requestingUserId: string): Promise<Document[]> {
    return this.documentRepository.find({
      where: {
        user: { id: requestingUserId }
      }
    });
  }

  async upload(file: Express.Multer.File, requestingUserId: string): Promise<Document> {
    const documentId = uuid();
    const filePath = path.join(this.directory, documentId);

    // Auto create file if not exists
    await writeFile(filePath, file.buffer, { flag: 'w' });

    const document = this.documentRepository.create({
      id: documentId,
      filename: file.originalname,
      size: file.size,
      user: { id: requestingUserId },
      extension: path.extname(file.originalname),
    });

    return await this.documentRepository.save(document);
  }

}
