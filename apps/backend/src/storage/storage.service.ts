import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as fs from 'fs';
import * as path from 'path';
import { v4 as uuidv4 } from 'uuid';
import { IStorageService, UploadedFile, StoredFileResult } from './storage.interface';

@Injectable()
export class StorageService implements IStorageService {
  private readonly logger = new Logger(StorageService.name);
  private readonly baseUploadDir: string;
  private readonly appUrl: string;

  constructor(private readonly configService: ConfigService) {
    this.baseUploadDir = path.resolve(process.cwd(), 'uploads');
    this.appUrl = this.configService.get<string>('APP_URL', 'http://localhost:4000');
    this.ensureUploadDir();
  }

  private ensureUploadDir(): void {
    if (!fs.existsSync(this.baseUploadDir)) {
      fs.mkdirSync(this.baseUploadDir, { recursive: true });
    }
  }

  async saveFile(file: UploadedFile, folder = 'documents'): Promise<StoredFileResult> {
    const targetDir = path.join(this.baseUploadDir, folder);
    if (!fs.existsSync(targetDir)) {
      fs.mkdirSync(targetDir, { recursive: true });
    }

    const ext = path.extname(file.originalname);
    const uniqueName = `${uuidv4()}${ext}`;
    const filePath = path.join(targetDir, uniqueName);
    const relativeStoragePath = path.join(folder, uniqueName).replace(/\\/g, '/');

    await fs.promises.writeFile(filePath, file.buffer);

    return {
      storagePath: relativeStoragePath,
      filename: file.originalname,
      mimeType: file.mimetype,
      sizeBytes: file.size,
      url: `${this.appUrl}/api/v1/documents/download?path=${encodeURIComponent(relativeStoragePath)}`,
    };
  }

  async getFileStream(storagePath: string): Promise<NodeJS.ReadableStream> {
    const safePath = path.normalize(storagePath).replace(/^(\.\.(\/|\\|$))+/, '');
    const absolutePath = path.join(this.baseUploadDir, safePath);

    if (!fs.existsSync(absolutePath)) {
      throw new NotFoundException('Requested file not found in storage');
    }

    return fs.createReadStream(absolutePath);
  }

  async getFileUrl(storagePath: string): Promise<string> {
    return `${this.appUrl}/api/v1/documents/download?path=${encodeURIComponent(storagePath)}`;
  }

  async deleteFile(storagePath: string): Promise<void> {
    try {
      const safePath = path.normalize(storagePath).replace(/^(\.\.(\/|\\|$))+/, '');
      const absolutePath = path.join(this.baseUploadDir, safePath);
      if (fs.existsSync(absolutePath)) {
        await fs.promises.unlink(absolutePath);
      }
    } catch (err) {
      this.logger.warn(`Could not delete file ${storagePath}: ${err.message}`);
    }
  }
}
