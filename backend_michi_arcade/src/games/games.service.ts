import { Injectable, OnModuleInit } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Prisma, Game } from '@prisma/client';

const INITIAL_GAMES = [
  {
    id: 'coin-dash-junior',
    title: 'Coin Dash',
    description: 'Corre y recoge monedas Michi',
    ageRange: 'kids',
    embedUrl: '/demo-game.html',
    biome: 'meadow',
    mapPositionX: 100,
    mapPositionY: 300,
    unlockOrder: 0,
  },
  {
    id: 'piggy-jump-junior',
    title: 'Piggy Jump',
    description: 'Salta entre plataformas doradas',
    ageRange: 'kids',
    embedUrl: '/demo-game.html',
    biome: 'meadow',
    mapPositionX: 280,
    mapPositionY: 220,
    unlockOrder: 1,
  },
  {
    id: 'savings-run-junior',
    title: 'Savings Run',
    description: 'Ahorra antes de que acabe el tiempo',
    ageRange: 'kids',
    embedUrl: '/demo-game.html',
    biome: 'meadow',
    mapPositionX: 460,
    mapPositionY: 280,
    unlockOrder: 2,
  },
  {
    id: 'budget-quest-master',
    title: 'Budget Quest',
    description: 'Arma tu presupuesto semanal',
    ageRange: 'junior',
    embedUrl: '/demo-game.html',
    biome: 'canyon',
    mapPositionX: 120,
    mapPositionY: 310,
    unlockOrder: 0,
  },
  {
    id: 'trade-tycoon-master',
    title: 'Trade Tycoon',
    description: 'Compra y vende en el mercado',
    ageRange: 'junior',
    embedUrl: '/demo-game.html',
    biome: 'canyon',
    mapPositionX: 300,
    mapPositionY: 230,
    unlockOrder: 1,
  },
  {
    id: 'vault-defender-master',
    title: 'Vault Defender',
    description: 'Protege la bóveda del colegio',
    ageRange: 'junior',
    embedUrl: '/demo-game.html',
    biome: 'canyon',
    mapPositionX: 480,
    mapPositionY: 290,
    unlockOrder: 2,
  },
  {
    id: 'market-legends-legend',
    title: 'Market Legends',
    description: 'Domina la bolsa Michi',
    ageRange: 'teens',
    embedUrl: '/demo-game.html',
    biome: 'sky',
    mapPositionX: 110,
    mapPositionY: 280,
    unlockOrder: 0,
  },
  {
    id: 'crypto-cat-legend',
    title: 'Crypto Cat',
    description: 'Estrategia financiera avanzada',
    ageRange: 'teens',
    embedUrl: '/demo-game.html',
    biome: 'sky',
    mapPositionX: 290,
    mapPositionY: 210,
    unlockOrder: 1,
  },
  {
    id: 'empire-builder-legend',
    title: 'Empire Builder',
    description: 'Construye tu imperio arcade',
    ageRange: 'teens',
    embedUrl: '/demo-game.html',
    biome: 'sky',
    mapPositionX: 470,
    mapPositionY: 270,
    unlockOrder: 2,
  },
];

@Injectable()
export class GamesService implements OnModuleInit {
  constructor(private prisma: PrismaService) {}

  async onModuleInit() {
    const count = await this.prisma.game.count();
    if (count === 0) {
      console.log('Seeding initial games database...');
      await this.prisma.game.createMany({
        data: INITIAL_GAMES,
      });
    }
  }

  async create(data: Prisma.GameCreateInput): Promise<Game> {
    return this.prisma.game.create({
      data,
    });
  }

  async findAll(): Promise<any[]> {
    return this.prisma.game.findMany({
      include: {
        ratings: {
          include: {
            user: true,
          },
        },
      },
    });
  }

  async update(id: string, data: Prisma.GameUpdateInput): Promise<Game> {
    return this.prisma.game.update({
      where: { id },
      data,
    });
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

      // Extract ratings to avoid returning the massive array if not needed,
      // but retain all other game fields.
      const { ratings, ...gameDetails } = game;
      return {
        ...gameDetails,
        averageRating,
        totalRatings,
      };
    });

    // Sort descending by average rating
    rankedGames.sort((a, b) => b.averageRating - a.averageRating);

    return rankedGames;
  }
}
