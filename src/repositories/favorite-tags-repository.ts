import type { FavoriteTag, Prisma } from '@prisma/client';

export type FavoriteTagsRepository = {
  createMany(data: Prisma.FavoriteTagCreateManyInput[]): Promise<void>;
  findByFavoriteId(favoriteId: string): Promise<FavoriteTag[]>;
};
