import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { UsersService } from '../users/users.service';

@Injectable()
export class RatingsService {
  constructor(
    private prisma: PrismaService,
    private usersService: UsersService,
  ) {}

  async submitRating(params: {
    userId?: string;
    username?: string;
    age?: number;
    gameId: string;
    stars: number;
  }) {
    const { userId, username, age, gameId, stars } = params;

    if (stars < 1 || stars > 5) {
      throw new BadRequestException('Stars must be between 1 and 5');
    }

    let targetUserId = userId;

    if (!targetUserId) {
      if (!username || age === undefined || age === null) {
        throw new BadRequestException('Either userId or both username and age must be provided');
      }
      const user = await this.usersService.findOrCreate(username, Number(age));
      targetUserId = user.id;
    } else {
      // Validate that the provided userId exists
      const userExists = await this.prisma.user.findUnique({
        where: { id: targetUserId },
      });
      if (!userExists) {
        throw new BadRequestException('User not found');
      }
    }

    // Validate that the game exists
    const gameExists = await this.prisma.game.findUnique({
      where: { id: gameId },
    });
    if (!gameExists) {
      throw new BadRequestException('Game not found');
    }

    // Upsert rating so if user already rated, it updates it.
    const existingRating = await this.prisma.rating.findUnique({
      where: {
        userId_gameId: {
          userId: targetUserId,
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
        userId: targetUserId,
        gameId,
      },
    });
  }
}
