import {
  IsString,
  IsOptional,
  IsArray,
  IsEnum,
  IsUUID,
  IsNumber,
  IsObject,
  MinLength,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { ManuscriptStatus } from '@inzovate/shared';

export class CreateManuscriptDto {
  @ApiProperty({ example: 'a12e97aa-3642-4f1b-8531-e123456789ab' })
  @IsUUID()
  projectId: string;

  @ApiProperty({ example: 'Advancements in CRISPR-Cas9 Precision Editing' })
  @IsString()
  @MinLength(3)
  title: string;

  @ApiPropertyOptional({ example: 'This paper investigates enhanced off-target mitigation...' })
  @IsOptional()
  @IsString()
  abstract?: string;

  @ApiPropertyOptional({ example: ['CRISPR', 'Gene Editing', 'Off-target analysis'] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  keywords?: string[];

  @ApiPropertyOptional({ example: '# Introduction\n\nCRISPR-Cas9 has revolutionized molecular biology...' })
  @IsOptional()
  @IsString()
  content?: string;

  @ApiPropertyOptional({ example: 'Initial draft manuscript' })
  @IsOptional()
  @IsString()
  changeNotes?: string;
}

export class CreateManuscriptVersionDto {
  @ApiProperty({ example: 'Advancements in CRISPR-Cas9 Precision Editing - Revised Draft' })
  @IsString()
  @MinLength(3)
  title: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  abstract?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  content?: string;

  @ApiPropertyOptional({ example: 4500 })
  @IsOptional()
  @IsNumber()
  wordCount?: number;

  @ApiProperty({ example: 'Incorporated reviewer remarks on methodology section and updated references' })
  @IsString()
  changeNotes: string;
}

export class UpdateManuscriptVersionDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  title?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  abstract?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  content?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  wordCount?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  changeNotes?: string;
}

export class UpdateQcChecklistDto {
  @ApiProperty({
    example: {
      titleVerification: true,
      abstractVerification: true,
      objectiveVerification: true,
      methodologyVerification: true,
      dataVerification: true,
      referenceVerification: true,
      formattingVerification: true,
      plagiarismVerification: true,
      similarityScorePercent: 4.5,
      guidelineCompliance: true,
      authorInfoVerification: true,
    },
  })
  @IsObject()
  qcChecklist: Record<string, any>;

  @ApiProperty({ enum: [ManuscriptStatus.QC_PASSED, ManuscriptStatus.QC_FAILED] })
  @IsEnum(ManuscriptStatus)
  status: ManuscriptStatus;

  @ApiPropertyOptional({ example: 'Plagiarism score verified at 4.5% via iThenticate. All references properly formatted in IEEE style.' })
  @IsOptional()
  @IsString()
  qcNotes?: string;
}

export class TransitionManuscriptStatusDto {
  @ApiProperty({ enum: ManuscriptStatus })
  @IsEnum(ManuscriptStatus)
  status: ManuscriptStatus;

  @ApiPropertyOptional({ example: 'Approved by author for journal submission.' })
  @IsOptional()
  @IsString()
  notes?: string;
}
