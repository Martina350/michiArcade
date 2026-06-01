import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class RatingsService {
  constructor(private prisma: PrismaService) {}

  async submitRating(userId: string, gameId: string, stars: number) {
    if (stars < 1 || stars > 5) {
      throw new BadRequestException('Stars must be between 1 and 5');
    }

    // Upsert rating so if user already rated, it updates it.
    // Or you can create it if they rate multiple times, but here we enforce one rating per user per game using the unique constraint.
    const existingRating = await this.prisma.rating.findUnique({
      where: {
        userId_gameId: {
          userId,
          gameId,
        },
      },
    });

    if (existingRating) {
      return this.prisma.rating.update({
        where: { id: existingRating.id },
        data: { stars },
      });
    }

    return this.prisma.rating.create({
      data: {
        stars,
        userId,
        gameId,
      },
    });
  }
}
