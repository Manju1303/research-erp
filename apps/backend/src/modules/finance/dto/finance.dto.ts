import {
  IsString,
  IsOptional,
  IsNumber,
  IsUUID,
  IsDateString,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateInvoiceDto {
  @ApiProperty({ example: 'a12e97aa-3642-4f1b-8531-e123456789ab' })
  @IsUUID()
  projectId: string;

  @ApiProperty({ example: 'b22e97aa-3642-4f1b-8531-e123456789ac' })
  @IsUUID()
  clientId: string;

  @ApiProperty({ example: 3500.0 })
  @IsNumber()
  amount: number;

  @ApiPropertyOptional({ example: 'USD', default: 'USD' })
  @IsOptional()
  @IsString()
  currency?: string;

  @ApiPropertyOptional({ example: '2026-11-30T00:00:00.000Z' })
  @IsOptional()
  @IsDateString()
  dueDate?: string;

  @ApiPropertyOptional({ example: 'Initial 50% milestone invoice for manuscript development' })
  @IsOptional()
  @IsString()
  notes?: string;

  @ApiPropertyOptional()
  @IsOptional()
  items?: any;
}

export class RecordPaymentDto {
  @ApiPropertyOptional({ example: 'inv-uuid-here' })
  @IsOptional()
  @IsUUID()
  invoiceId?: string;

  @ApiProperty({ example: 'a12e97aa-3642-4f1b-8531-e123456789ab' })
  @IsUUID()
  projectId: string;

  @ApiProperty({ example: 'b22e97aa-3642-4f1b-8531-e123456789ac' })
  @IsUUID()
  clientId: string;

  @ApiProperty({ example: 1750.0 })
  @IsNumber()
  amount: number;

  @ApiPropertyOptional({ example: 'USD', default: 'USD' })
  @IsOptional()
  @IsString()
  currency?: string;

  @ApiProperty({ example: 'ADVANCE' })
  @IsString()
  paymentType: string; // ADVANCE | MILESTONE | JOURNAL_APC | FINAL_SETTLEMENT

  @ApiPropertyOptional({ example: 'STRIPE_CREDIT_CARD' })
  @IsOptional()
  @IsString()
  paymentMethod?: string;

  @ApiPropertyOptional({ example: 'ch_3Lkd21908dlas' })
  @IsOptional()
  @IsString()
  transactionRef?: string;
}
