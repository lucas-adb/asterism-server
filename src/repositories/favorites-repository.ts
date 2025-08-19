import type { Favorite, Prisma } from '@prisma/client';

export type FavoritesRepository = {
  create(data: Prisma.FavoriteUncheckedCreateInput): Promise<Favorite>;
};
