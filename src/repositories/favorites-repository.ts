import type { Favorite, FavoriteTag, Prisma } from '@prisma/client';

export type FavoritesRepository = {
  create(data: Prisma.FavoriteUncheckedCreateInput): Promise<Favorite>;
  findByIdWithTags(
    id: string
  ): Promise<(Favorite & { tags: FavoriteTag[] }) | null>;
};
