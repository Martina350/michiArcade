import { Controller, Get, Post, Patch, Body, Param } from '@nestjs/common';
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

  @Patch(':id')
  async update(@Param('id') id: string, @Body() data: Prisma.GameUpdateInput) {
    return this.gamesService.update(id, data);
  }

  @Get('ranking')
  async getRanking() {
    return this.gamesService.getRanking();
  }
}
