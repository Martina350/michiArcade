import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Prisma, User } from '@prisma/client';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async create(data: Prisma.UserCreateInput): Promise<User> {
    return this.prisma.user.create({
      data,
    });
  }

  async findByUsername(username: string): Promise<User | null> {
    return this.prisma.user.findUnique({
      where: { username },
    });
  }

  async findById(id: string): Promise<User | null> {
    return this.prisma.user.findUnique({
      where: { id },
    });
  }

  async findOrCreate(username: string, age: number): Promise<User> {
    const user = await this.findByUsername(username);
    if (user) {
      if (user.age !== age) {
        return this.prisma.user.update({
          where: { id: user.id },
          data: { age },
        });
      }
      return user;
    }
    return this.prisma.user.create({
      data: {
        username,
        age,
      },
    });
  }
}
