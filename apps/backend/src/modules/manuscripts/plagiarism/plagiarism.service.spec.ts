import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { PlagiarismService } from './plagiarism.service';

describe('PlagiarismService & Academic Authenticity QA Tests', () => {
  let service: PlagiarismService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PlagiarismService,
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn().mockReturnValue(null),
          },
        },
      ],
    }).compile();

    service = module.get<PlagiarismService>(PlagiarismService);
  });

  it('scans an original research manuscript and returns realistic similarity metrics below threshold', async () => {
    const result = await service.scanManuscript({
      manuscriptId: 'manuscript-uuid-1',
      title: 'Decentralized Multi-Agent Coordination via Byzantine Fault-Tolerant Consensus',
      abstract: 'We present a novel mathematical framework for multi-agent synchronization under packet loss...',
      wordCount: 7850,
      threshold: 15.0,
    });

    expect(result).toBeDefined();
    expect(result.scanId).toMatch(/^ITH-[A-Z0-9]{8}$/);
    expect(result.similarityScorePercent).toBeGreaterThanOrEqual(2.0);
    expect(result.similarityScorePercent).toBeLessThanOrEqual(12.0);
    expect(result.passedThreshold).toBe(true);
    expect(result.reportUrl).toContain(result.scanId);
    expect(result.matchedSources.length).toBeGreaterThan(0);
  });

  it('correctly flags manuscripts that exceed strict custom similarity thresholds', async () => {
    const result = await service.scanManuscript({
      manuscriptId: 'manuscript-uuid-2',
      title: 'Common Survey on Deep Learning Architectures',
      abstract: 'A standard overview of convolutional neural networks and transformer backbones.',
      threshold: 1.0, // deliberately strict 1.0% threshold
    });

    expect(result.passedThreshold).toBe(false);
  });
});
