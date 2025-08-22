import type { FavoriteType } from '@prisma/client';
import type { SortOrder } from '@/use-cases/get-user-favorites-use-case';

export type QueryOptions = {
  type?: FavoriteType;
  tags?: string[];
  query?: string;
  sortOrder?: SortOrder;
};
