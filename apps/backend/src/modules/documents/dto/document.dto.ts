import {
  IsString,
  IsOptional,
  IsEnum,
  IsUUID,
} from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export enum DocumentCategory {
  MANUSCRIPT = 'MANUSCRIPT',
  REQUIREMENT = 'REQUIREMENT',
  QC_REPORT = 'QC_REPORT',
  CLIENT_DOC = 'CLIENT_DOC',
  JOURNAL_DECISION = 'JOURNAL_DECISION',
  INVOICE = 'INVOICE',
  OTHER = 'OTHER',
}

export enum DocumentAccessLevel {
  INTERNAL = 'INTERNAL',
  CLIENT = 'CLIENT',
  PUBLIC = 'PUBLIC',
}

export class UploadDocumentDto {
  @ApiPropertyOptional({ enum: DocumentCategory, default: DocumentCategory.MANUSCRIPT })
  @IsOptional()
  @IsEnum(DocumentCategory)
  category?: DocumentCategory;

  @ApiPropertyOptional({ enum: DocumentAccessLevel, default: DocumentAccessLevel.INTERNAL })
  @IsOptional()
  @IsEnum(DocumentAccessLevel)
  accessLevel?: DocumentAccessLevel;

  @ApiPropertyOptional({ example: 'Initial supplementary dataset' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({ example: 'a12e97aa-3642-4f1b-8531-e123456789ab' })
  @IsOptional()
  @IsUUID()
  projectId?: string;

  @ApiPropertyOptional({ example: 'b22e97aa-3642-4f1b-8531-e123456789ac' })
  @IsOptional()
  @IsUUID()
  manuscriptVersionId?: string;
}
