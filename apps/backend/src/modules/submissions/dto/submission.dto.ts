import {
  IsString,
  IsOptional,
  IsEnum,
  IsUUID,
  IsDateString,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { SubmissionStatus } from '@inzovate/shared';

export class CreateSubmissionDto {
  @ApiProperty({ example: 'a12e97aa-3642-4f1b-8531-e123456789ab' })
  @IsUUID()
  projectId: string;

  @ApiProperty({ example: 'b22e97aa-3642-4f1b-8531-e123456789ac' })
  @IsUUID()
  journalId: string;

  @ApiPropertyOptional({ example: 'c32e97aa-3642-4f1b-8531-e123456789ad' })
  @IsOptional()
  @IsUUID()
  manuscriptVersionId?: string;

  @ApiPropertyOptional({ example: '2026-10-01T10:00:00.000Z' })
  @IsOptional()
  @IsDateString()
  submissionDate?: string;

  @ApiPropertyOptional({ example: 'Editorial Manager / ScholarOne' })
  @IsOptional()
  @IsString()
  submissionMethod?: string;

  @ApiPropertyOptional({ example: 'inzovate-research-ops@stanford.org' })
  @IsOptional()
  @IsString()
  submissionAccount?: string;

  @ApiPropertyOptional({ example: 'NMI-2026-0891' })
  @IsOptional()
  @IsString()
  submissionRefId?: string;

  @ApiPropertyOptional({ example: 'editor.in.chief@nature.com' })
  @IsOptional()
  @IsString()
  editorialContact?: string;

  @ApiPropertyOptional({ example: '2026-11-15T00:00:00.000Z' })
  @IsOptional()
  @IsDateString()
  expectedResponseDate?: string;
}

export class UpdateSubmissionStatusDto {
  @ApiProperty({ enum: SubmissionStatus, example: SubmissionStatus.UNDER_REVIEW })
  @IsEnum(SubmissionStatus)
  status: SubmissionStatus;

  @ApiPropertyOptional({ example: 'Manuscript assigned to 3 peer reviewers' })
  @IsOptional()
  @IsString()
  note?: string;

  @ApiPropertyOptional({ example: 'NMI-2026-0891' })
  @IsOptional()
  @IsString()
  submissionRefId?: string;
}
