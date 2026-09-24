import {
  IsString,
  IsOptional,
  IsUUID,
  IsDateString,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger';

export class CreatePublicationDto {
  @ApiProperty({ example: 'a12e97aa-3642-4f1b-8531-e123456789ab' })
  @IsUUID()
  submissionId: string;

  @ApiProperty({ example: 'b22e97aa-3642-4f1b-8531-e123456789ac' })
  @IsUUID()
  projectId: string;

  @ApiProperty({ example: 'Deep Learning Approaches in Somatic Genomic Variant Detection' })
  @IsString()
  title: string;

  @ApiPropertyOptional({ example: '10.1038/s42256-026-00451-2' })
  @IsOptional()
  @IsString()
  doi?: string;

  @ApiPropertyOptional({ example: 'https://doi.org/10.1038/s42256-026-00451-2' })
  @IsOptional()
  @IsString()
  articleUrl?: string;

  @ApiPropertyOptional({ example: 'Vol. 8' })
  @IsOptional()
  @IsString()
  volume?: string;

  @ApiPropertyOptional({ example: 'Issue 4' })
  @IsOptional()
  @IsString()
  issue?: string;

  @ApiPropertyOptional({ example: 'pp. 412–429' })
  @IsOptional()
  @IsString()
  pageNumbers?: string;

  @ApiPropertyOptional({ example: '2026-11-20T00:00:00.000Z' })
  @IsOptional()
  @IsDateString()
  publicationDate?: string;

  @ApiPropertyOptional({ example: 'https://inzovate.storage/papers/INZ-2026-001_Final_Published.pdf' })
  @IsOptional()
  @IsString()
  finalPdfUrl?: string;

  @ApiPropertyOptional({ example: 'https://inzovate.storage/certs/INZ-2026-001_Cert.pdf' })
  @IsOptional()
  @IsString()
  certificateUrl?: string;
}

export class UpdatePublicationDto extends PartialType(CreatePublicationDto) {}
