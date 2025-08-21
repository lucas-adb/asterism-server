import { faker } from '@faker-js/faker';
import type { FavoriteType, Prisma } from '@prisma/client';
// import type { InMemoryFavoritesRepository } from '@/repositories/in-memory/in-memory-favorites-repository';

export function makeFavorite(
  override: Partial<Prisma.FavoriteUncheckedCreateInput> = {}
) {
  const favoriteData = {
    title: faker.lorem.word(),
    description: faker.lorem.words(10),
    url: faker.internet.url(),
    type: 'SITES' as FavoriteType,
    user_id: faker.string.uuid(),
    ...override,
  };

  return favoriteData;
}
