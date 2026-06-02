import { Module } from '@nestjs/common';
import { RatingsService } from './ratings.service';
import { RatingsController } from './ratings.controller';

import { PrismaModule } from '../prisma/prisma.module';
import { UsersModule } from '../users/users.module';

@Module({
  imports: [PrismaModule, UsersModule],
  controllers: [RatingsController],
  providers: [RatingsService],
  exports: [RatingsService],
})
export class RatingsModule {}
