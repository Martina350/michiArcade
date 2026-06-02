import { Controller, Post, Body } from '@nestjs/common';
import { RatingsService } from './ratings.service';

@Controller('ratings')
export class RatingsController {
  constructor(private readonly ratingsService: RatingsService) {}

  @Post()
  async submitRating(
    @Body()
    body: {
      userId?: string;
      username?: string;
      age?: number;
      gameId: string;
      stars: number;
    },
  ) {
    return this.ratingsService.submitRating(body);
  }
}
