import { Module } from '@nestjs/common';
import { ManuscriptsController } from './manuscripts.controller';
import { ManuscriptsService } from './manuscripts.service';
import { PlagiarismService } from './plagiarism/plagiarism.service';

@Module({
  controllers: [ManuscriptsController],
  providers: [ManuscriptsService, PlagiarismService],
  exports: [ManuscriptsService, PlagiarismService],
})
export class ManuscriptsModule {}
