import {
  IsString,
  IsOptional,
  IsEnum,
  IsUUID,
  IsArray,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { CommunicationType } from '@inzovate/shared';

export class CreateCommunicationDto {
  @ApiProperty({ enum: CommunicationType, example: CommunicationType.CLIENT_COMMENT })
  @IsEnum(CommunicationType)
  type: CommunicationType;

  @ApiPropertyOptional({ example: 'a12e97aa-3642-4f1b-8531-e123456789ab' })
  @IsOptional()
  @IsUUID()
  projectId?: string;

  @ApiPropertyOptional({ example: 'b22e97aa-3642-4f1b-8531-e123456789ac' })
  @IsOptional()
  @IsUUID()
  clientId?: string;

  @ApiPropertyOptional({ example: 'Discussion on methodology refinement for ClinVar evaluation' })
  @IsOptional()
  @IsString()
  subject?: string;

  @ApiProperty({ example: 'We have updated the transformer attention diagrams to reflect reviewer remark #2.' })
  @IsString()
  body: string;

  @ApiPropertyOptional({ example: ['https://inzovate.storage/docs/attachment_1.pdf'] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  attachments?: string[];
}
