import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Prisma, Game } from '@prisma/client';

@Injectable()
export class GamesService {
  constructor(private prisma: PrismaService) {}

  async create(data: Prisma.GameCreateInput): Promise<Game> {
    return this.prisma.game.create({
      data,
    });
  }

  async findAll(): Promise<Game[]> {
    return this.prisma.game.findMany();
  }

  async getRanking() {
    // Fetch all games with their ratings
    const games = await this.prisma.game.findMany({
      include: {
        ratings: true,
      },
    });

    // Calculate average rating for each game and sort
    const rankedGames = games.map((game) => {
      const totalRatings = game.ratings.length;
      const averageRating =
        totalRatings > 0
          ? game.ratings.reduce((acc, curr) => acc + curr.stars, 0) / totalRatings
          : 0;

      return {
        id: game.id,
        title: game.title,
        description: game.description,
        averageRating,
        totalRatings,
      };
    });

    // Sort descending by average rating
    rankedGames.sort((a, b) => b.averageRating - a.averageRating);

    return rankedGames;
  }
}
