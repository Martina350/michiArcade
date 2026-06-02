import { Test, TestingModule } from '@nestjs/testing';
import { RatingsController } from './ratings.controller';
import { RatingsService } from './ratings.service';

describe('RatingsController', () => {
  let controller: RatingsController;

  const mockRatingsService = {
    submitRating: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [RatingsController],
      providers: [
        {
          provide: RatingsService,
          useValue: mockRatingsService,
        },
      ],
    }).compile();

    controller = module.get<RatingsController>(RatingsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
