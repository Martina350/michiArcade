import { Injectable, BadRequestException } from '@nestjs/common';
import { UsersService } from '../users/users.service';

@Injectable()
export class AuthService {
  constructor(private usersService: UsersService) {}

  async login(username: string, age: number) {
    if (!username || username.trim() === '') {
      throw new BadRequestException('Username is required');
    }
    if (age === undefined || age === null || isNaN(age)) {
      throw new BadRequestException('Age is required and must be a number');
    }

    const user = await this.usersService.findOrCreate(username, Number(age));
    return {
      id: user.id,
      username: user.username,
      age: user.age,
    };
  }
}
