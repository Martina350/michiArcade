import { Controller, Get, Post, Body } from '@nestjs/common';
import { GamesService } from './games.service';
import { Prisma } from '@prisma/client';

@Controller('games')
export class GamesController {
  constructor(private readonly gamesService: GamesService) {}

  @Post()
  async create(@Body() data: Prisma.GameCreateInput) {
    return this.gamesService.create(data);
  }

  @Get()
  async findAll() {
    return this.gamesService.findAll();
  }

  @Get('ranking')
  async getRanking() {
    return this.gamesService.getRanking();
  }
}
