import {
  Controller,
  Get,
  Post,
  Body,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { FinanceService } from './finance.service';
import { CreateInvoiceDto, RecordPaymentDto } from './dto/finance.dto';
import { PaginationDto } from '../../common/dto/pagination.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';

@ApiTags('Finance')
@ApiBearerAuth('access-token')
@UseGuards(JwtAuthGuard)
@Controller('finance')
export class FinanceController {
  constructor(private readonly financeService: FinanceService) {}

  @Get('invoices')
  @ApiOperation({ summary: 'List project billing invoices' })
  @ApiQuery({ name: 'clientId', required: false })
  @ApiQuery({ name: 'status', required: false })
  findAllInvoices(
    @Query() query: PaginationDto & { clientId?: string; status?: string },
  ) {
    return this.financeService.findAllInvoices(query);
  }

  @Get('payments')
  @ApiOperation({ summary: 'List recorded client payments and receipts' })
  @ApiQuery({ name: 'clientId', required: false })
  @ApiQuery({ name: 'projectId', required: false })
  findAllPayments(
    @Query() query: PaginationDto & { clientId?: string; projectId?: string },
  ) {
    return this.financeService.findAllPayments(query);
  }

  @Get('overview')
  @ApiOperation({ summary: 'Get total revenue and outstanding collections overview' })
  getOverview() {
    return this.financeService.getFinancialOverview();
  }

  @Post('invoices')
  @ApiOperation({ summary: 'Issue an invoice for project milestones or journal APC' })
  createInvoice(@Body() dto: CreateInvoiceDto) {
    return this.financeService.createInvoice(dto);
  }

  @Post('payments')
  @ApiOperation({ summary: 'Record payment receipt and reconcile against invoice' })
  recordPayment(@Body() dto: RecordPaymentDto) {
    return this.financeService.recordPayment(dto);
  }
}
