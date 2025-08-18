import type { Prisma, User } from '@prisma/client';

export type UsersRepository = {
  create(data: Prisma.UserCreateInput): Promise<User>;
  findByEmail(email: string): Promise<User | null>;
};
