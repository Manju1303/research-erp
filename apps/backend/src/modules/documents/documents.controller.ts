import {
  Controller,
  Get,
  Post,
  Delete,
  Param,
  Body,
  UseInterceptors,
  UploadedFile,
  Res,
  UseGuards,
  ParseFilePipe,
  MaxFileSizeValidator,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiConsumes, ApiBody } from '@nestjs/swagger';
import { Response } from 'express';
import { DocumentsService } from './documents.service';
import { UploadDocumentDto } from './dto/document.dto';
import { RequirePermissions } from '../../common/decorators/permissions.decorator';
import { PermissionsGuard } from '../../common/guards/permissions.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@ApiTags('Documents')
@ApiBearerAuth('access-token')
@UseGuards(PermissionsGuard)
@Controller('documents')
export class DocumentsController {
  constructor(private readonly documentsService: DocumentsService) {}

  @Get('project/:projectId')
  @RequirePermissions('documents:read', 'documents:read:own')
  @ApiOperation({ summary: 'List all documents accessible to user in a project' })
  findByProject(
    @Param('projectId') projectId: string,
    @CurrentUser('id') userId: string,
    @CurrentUser('role') role: { name: string },
  ) {
    return this.documentsService.findByProject(projectId, userId, role.name);
  }

  @Get(':id')
  @RequirePermissions('documents:read', 'documents:read:own')
  @ApiOperation({ summary: 'Get document metadata' })
  findOne(
    @Param('id') id: string,
    @CurrentUser('id') userId: string,
    @CurrentUser('role') role: { name: string },
  ) {
    return this.documentsService.findOne(id, userId, role.name);
  }

  @Get(':id/download')
  @RequirePermissions('documents:read', 'documents:read:own')
  @ApiOperation({ summary: 'Stream / download document file' })
  async download(
    @Param('id') id: string,
    @CurrentUser('id') userId: string,
    @CurrentUser('role') role: { name: string },
    @Res() res: Response,
  ) {
    const { stream, filename, mimeType } = await this.documentsService.getDownloadStream(
      id,
      userId,
      role.name,
    );

    res.set({
      'Content-Type': mimeType,
      'Content-Disposition': `attachment; filename="${encodeURIComponent(filename)}"`,
    });

    stream.pipe(res);
  }

  @Post('upload')
  @RequirePermissions('documents:upload')
  @ApiOperation({ summary: 'Upload document (multipart/form-data)' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: { type: 'string', format: 'binary' },
        category: { type: 'string' },
        accessLevel: { type: 'string' },
        description: { type: 'string' },
        projectId: { type: 'string' },
        manuscriptVersionId: { type: 'string' },
      },
    },
  })
  @UseInterceptors(FileInterceptor('file'))
  upload(
    @UploadedFile(
      new ParseFilePipe({
        validators: [new MaxFileSizeValidator({ maxSize: 50 * 1024 * 1024 })], // 50MB
      }),
    )
    file: Express.Multer.File,
    @Body() dto: UploadDocumentDto,
    @CurrentUser('id') userId: string,
  ) {
    return this.documentsService.upload(file, dto, userId);
  }

  @Delete(':id')
  @RequirePermissions('documents:delete')
  @ApiOperation({ summary: 'Soft delete a document' })
  remove(@Param('id') id: string) {
    return this.documentsService.softDelete(id);
  }
}
