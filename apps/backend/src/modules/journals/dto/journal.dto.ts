import {
  IsString,
  IsOptional,
  IsArray,
  IsNumber,
  MinLength,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger';

export class CreateJournalDto {
  @ApiProperty({ example: 'Nature Machine Intelligence' })
  @IsString()
  @MinLength(2)
  name: string;

  @ApiProperty({ example: 'Nature Publishing Group' })
  @IsString()
  publisher: string;

  @ApiPropertyOptional({ example: '2522-5839' })
  @IsOptional()
  @IsString()
  issn?: string;

  @ApiPropertyOptional({ example: '2522-5839' })
  @IsOptional()
  @IsString()
  eissn?: string;

  @ApiPropertyOptional({ example: 'https://www.nature.com/natmachintell/' })
  @IsOptional()
  @IsString()
  website?: string;

  @ApiProperty({ example: 'Artificial Intelligence & Robotics' })
  @IsString()
  subjectArea: string;

  @ApiPropertyOptional({ example: 'United Kingdom' })
  @IsOptional()
  @IsString()
  country?: string;

  @ApiPropertyOptional({ example: 'Monthly' })
  @IsOptional()
  @IsString()
  frequency?: string;

  @ApiPropertyOptional({ example: 4500.0 })
  @IsOptional()
  @IsNumber()
  apc?: number;

  @ApiPropertyOptional({ example: 60 })
  @IsOptional()
  @IsNumber()
  reviewDurationDays?: number;

  @ApiPropertyOptional({ example: 120 })
  @IsOptional()
  @IsNumber()
  publicationDurationDays?: number;

  @ApiPropertyOptional({ example: ['SCOPUS', 'WEB_OF_SCIENCE', 'SCI_SCIE'] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  indexing?: string[];

  @ApiPropertyOptional({ example: 'Single column, double spaced for initial review' })
  @IsOptional()
  @IsString()
  formattingReqs?: string;

  @ApiPropertyOptional({ example: 6000 })
  @IsOptional()
  @IsNumber()
  wordLimit?: number;

  @ApiPropertyOptional({ example: 'Nature Citation Style' })
  @IsOptional()
  @IsString()
  referenceStyle?: string;

  @ApiPropertyOptional({ example: 'natmachintell@nature.com' })
  @IsOptional()
  @IsString()
  contactEmail?: string;
}

export class UpdateJournalDto extends PartialType(CreateJournalDto) {}

export class MatchJournalsDto {
  @ApiProperty({ example: 'Bioinformatics & Machine Learning' })
  @IsString()
  domain: string;

  @ApiPropertyOptional({ example: ['Transformers', 'Genomics', 'Variant Calling'] })
  @IsOptional()
  @IsArray()
  keywords?: string[];

  @ApiPropertyOptional({ example: 'SCOPUS' })
  @IsOptional()
  @IsString()
  targetIndexing?: string;

  @ApiPropertyOptional({ example: 4000 })
  @IsOptional()
  @IsNumber()
  budget?: number;
}
