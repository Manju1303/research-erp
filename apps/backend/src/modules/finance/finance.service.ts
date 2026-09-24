import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { CreateInvoiceDto, RecordPaymentDto } from './dto/finance.dto';
import {
  PaginationDto,
  toPrismaOrderAndPagination,
  buildPaginationMeta,
} from '../../common/dto/pagination.dto';
import { PaymentStatus } from '@inzovate/shared';

@Injectable()
export class FinanceService {
  constructor(private readonly prisma: PrismaService) {}

  private async generateInvoiceNumber(): Promise<string> {
    const year = new Date().getFullYear();
    const count = await this.prisma.invoice.count();
    return `INV-${year}-${String(count + 1).padStart(4, '0')}`;
  }

  private async generateReceiptNumber(): Promise<string> {
    const year = new Date().getFullYear();
    const count = await this.prisma.payment.count();
    return `RCP-${year}-${String(count + 1).padStart(4, '0')}`;
  }

  async findAllInvoices(query: PaginationDto & { clientId?: string; status?: string }) {
    const { skip, take, orderBy } = toPrismaOrderAndPagination(query);
    const where: any = {};
    if (query.clientId) where.clientId = query.clientId;
    if (query.status) where.status = query.status;

    const [data, total] = await Promise.all([
      this.prisma.invoice.findMany({
        where,
        skip,
        take,
        orderBy: { issuedAt: 'desc' },
        include: {
          client: { include: { user: { select: { firstName: true, lastName: true, email: true } } } },
          project: { select: { projectCode: true, title: true } },
          payments: true,
        },
      }),
      this.prisma.invoice.count({ where }),
    ]);

    return {
      data,
      meta: buildPaginationMeta(total, query.page ?? 1, query.limit ?? 20),
    };
  }

  async findAllPayments(query: PaginationDto & { clientId?: string; projectId?: string }) {
    const { skip, take, orderBy } = toPrismaOrderAndPagination(query);
    const where: any = {};
    if (query.clientId) where.clientId = query.clientId;
    if (query.projectId) where.projectId = query.projectId;

    const [data, total] = await Promise.all([
      this.prisma.payment.findMany({
        where,
        skip,
        take,
        orderBy: { paidAt: 'desc' },
        include: {
          client: { include: { user: { select: { firstName: true, lastName: true, email: true } } } },
          project: { select: { projectCode: true, title: true } },
          invoice: true,
        },
      }),
      this.prisma.payment.count({ where }),
    ]);

    return {
      data,
      meta: buildPaginationMeta(total, query.page ?? 1, query.limit ?? 20),
    };
  }

  async createInvoice(dto: CreateInvoiceDto) {
    const invoiceNumber = await this.generateInvoiceNumber();

    return this.prisma.invoice.create({
      data: {
        invoiceNumber,
        projectId: dto.projectId,
        clientId: dto.clientId,
        amount: dto.amount,
        currency: dto.currency || 'USD',
        status: PaymentStatus.PENDING,
        dueDate: dto.dueDate ? new Date(dto.dueDate) : null,
        notes: dto.notes,
        items: dto.items,
      },
      include: {
        client: true,
        project: true,
      },
    });
  }

  async recordPayment(dto: RecordPaymentDto) {
    const receiptNumber = await this.generateReceiptNumber();

    return this.prisma.$transaction(async (tx) => {
      const payment = await tx.payment.create({
        data: {
          receiptNumber,
          invoiceId: dto.invoiceId,
          projectId: dto.projectId,
          clientId: dto.clientId,
          amount: dto.amount,
          currency: dto.currency || 'USD',
          paymentType: dto.paymentType,
          status: PaymentStatus.PAID,
          paymentMethod: dto.paymentMethod,
          transactionRef: dto.transactionRef,
        },
      });

      // Update invoice if linked
      if (dto.invoiceId) {
        await tx.invoice.update({
          where: { id: dto.invoiceId },
          data: {
            status: PaymentStatus.PAID,
            paidAt: new Date(),
          },
        });
      }

      return payment;
    });
  }

  async getFinancialOverview() {
    const [totalRevenueAgg, pendingInvoicesAgg, completedInvoicesCount] = await Promise.all([
      this.prisma.payment.aggregate({
        _sum: { amount: true },
        where: { status: PaymentStatus.PAID },
      }),
      this.prisma.invoice.aggregate({
        _sum: { amount: true },
        where: { status: PaymentStatus.PENDING },
      }),
      this.prisma.invoice.count({ where: { status: PaymentStatus.PAID } }),
    ]);

    return {
      totalCollectedRevenue: totalRevenueAgg._sum.amount || 0,
      totalPendingOutstanding: pendingInvoicesAgg._sum.amount || 0,
      paidInvoicesCount: completedInvoicesCount,
    };
  }
}
