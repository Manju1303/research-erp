import {
  IsString,
  IsOptional,
  IsArray,
  IsEnum,
  IsDateString,
  IsNumber,
  IsUUID,
  MinLength,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import { ProjectStatus } from '@inzovate/shared';

export enum ProjectPriority {
  LOW = 'LOW',
  NORMAL = 'NORMAL',
  HIGH = 'HIGH',
  URGENT = 'URGENT',
}

export class CreateProjectDto {
  @ApiProperty({ example: 'Deep Learning Approaches for Genomic Variant Detection' })
  @IsString()
  @MinLength(3)
  title: string;

  @ApiPropertyOptional({ example: 'Comprehensive research paper comparing Transformer vs CNN...' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({ example: 'Bioinformatics & Machine Learning' })
  @IsOptional()
  @IsString()
  domain?: string;

  @ApiPropertyOptional({ example: ['Genomics', 'Deep Learning', 'Transformers'] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  keywords?: string[];

  @ApiPropertyOptional({ enum: ProjectPriority, default: ProjectPriority.NORMAL })
  @IsOptional()
  @IsEnum(ProjectPriority)
  priority?: ProjectPriority;

  @ApiPropertyOptional({ example: '2026-12-31T23:59:59.000Z' })
  @IsOptional()
  @IsDateString()
  deadline?: string;

  @ApiPropertyOptional({ example: 'Scopus Q1 / Web of Science' })
  @IsOptional()
  @IsString()
  targetJournalType?: string;

  @ApiPropertyOptional({ example: 3500.0 })
  @IsOptional()
  @IsNumber()
  budget?: number;

  @ApiPropertyOptional({ example: 'USD', default: 'USD' })
  @IsOptional()
  @IsString()
  currency?: string;

  @ApiPropertyOptional({ example: 'Internal staff notes for onboarding' })
  @IsOptional()
  @IsString()
  internalNotes?: string;

  @ApiProperty({ example: 'c42e97aa-3642-4f1b-8531-e123456789ab' })
  @IsUUID()
  clientId: string;

  @ApiPropertyOptional({ example: 'd52e97aa-3642-4f1b-8531-e123456789ac' })
  @IsOptional()
  @IsUUID()
  managerId?: string;
}

export class UpdateProjectDto extends PartialType(CreateProjectDto) {}

export class TransitionProjectStatusDto {
  @ApiProperty({ enum: ProjectStatus, example: ProjectStatus.REQUIREMENT_ANALYSIS })
  @IsEnum(ProjectStatus)
  status: ProjectStatus;

  @ApiPropertyOptional({ example: 'Completed initial requirement gathering with author' })
  @IsOptional()
  @IsString()
  note?: string;
}

export class AssignStaffDto {
  @ApiProperty({ example: 'e62e97aa-3642-4f1b-8531-e123456789ad' })
  @IsUUID()
  userId: string;

  @ApiProperty({ example: 'research_staff' })
  @IsString()
  role: string;
}
