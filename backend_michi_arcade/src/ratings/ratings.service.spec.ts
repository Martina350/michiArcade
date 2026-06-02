import { Test, TestingModule } from '@nestjs/testing';
import { RatingsService } from './ratings.service';
import { PrismaService } from '../prisma/prisma.service';
import { UsersService } from '../users/users.service';

describe('RatingsService', () => {
  let service: RatingsService;

  const mockPrismaService = {};
  const mockUsersService = {};

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RatingsService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
        {
          provide: UsersService,
          useValue: mockUsersService,
        },
      ],
    }).compile();

    service = module.get<RatingsService>(RatingsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
