import type { Favorite, FavoriteTag, Prisma } from '@prisma/client';
import type { FavoriteWithTags } from '@/@types/favorite-types';
import type { PaginationInput } from '@/@types/pagination-types';
import type { QueryOptions } from '@/@types/query-types';

export type FavoritesRepository = {
  create(data: Prisma.FavoriteUncheckedCreateInput): Promise<Favorite>;

  findByIdWithTags(
    id: string
  ): Promise<(Favorite & { tags: FavoriteTag[] }) | null>;

  findManyByUserId(
    user_id: string,
    pagination?: PaginationInput,
    filters?: QueryOptions
  ): Promise<FavoriteWithTags[]>;

  countByUserId(user_id: string, filters?: QueryOptions): Promise<number>;
};
