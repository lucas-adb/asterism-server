import { faker } from '@faker-js/faker';
import type { Prisma } from '@prisma/client';
import type { InMemoryUsersRepository } from '@/repositories/in-memory/in-memory-users-repository';

export async function makeUser(
  repository: InMemoryUsersRepository,
  override: Partial<Prisma.UserCreateInput> = {}
) {
  const userData = {
    username: faker.internet.username(),
    email: faker.internet.email(),
    password_hash: faker.internet.password(),
    ...override,
  };

  const user = await repository.create(userData);

  return user;
}
