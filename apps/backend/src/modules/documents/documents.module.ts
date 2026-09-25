import { Module } from '@nestjs/common';
import { DocumentsController } from './documents.controller';
import { DocumentsService } from './documents.service';
import { MalwareScannerService } from './security/malware-scanner.service';

@Module({
  controllers: [DocumentsController],
  providers: [DocumentsService, MalwareScannerService],
  exports: [DocumentsService, MalwareScannerService],
})
export class DocumentsModule {}
