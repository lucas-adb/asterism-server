import { randomUUID } from 'node:crypto';
import type { Prisma, User } from '@prisma/client';
import type { UsersRepository } from '../users-repository';

export class InMemoryUsersRepository implements UsersRepository {
  protected items: User[] = [];

  async create(data: Prisma.UserCreateInput): Promise<User> {
    const now = new Date();

    const user = {
      id: randomUUID(),
      username: data.username,
      email: data.email,
      password_hash: data.password_hash,
      created_at: now,
      updated_at: now,
    };

    await this.items.push(user);

    return user;
  }

  async findByEmail(email: string): Promise<User | null> {
    const user = await this.items.find((item) => item.email === email);

    if (!user) {
      return null;
    }

    return user;
  }

  async findById(id: string): Promise<User | null> {
    const user = await this.items.find((item) => item.id === id);

    if (!user) {
      return null;
    }

    return user;
  }
}
