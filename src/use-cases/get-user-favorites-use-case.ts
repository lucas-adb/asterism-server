import type { FavoriteType } from '@prisma/client';
import type { FavoriteWithTags } from '@/@types/favorite-types';
import {
  DEFAULT_LIMIT,
  DEFAULT_PAGE,
  MAX_LIMIT,
  type PaginationOutput,
} from '@/@types/pagination-types';
import type { QueryOptions } from '@/@types/query-types';
import type { FavoritesRepository } from '@/repositories/favorites-repository';
import type { UsersRepository } from '@/repositories/users-repository';
import { ResourceNotFoundError } from './errors/resource-not-found-error';

export type SortOrder = 'asc' | 'desc';

type GetUserFavoritesUseCaseRequest = {
  user_id: string;
  page?: number;
  limit?: number;
  type?: FavoriteType;
  tags?: string[];
  query?: string;
  sortOrder?: SortOrder;
};

type GetUserFavoritesUseCaseResponse = {
  favorites: FavoriteWithTags[];
  pagination: PaginationOutput;
};

export class GetUserFavoritesUseCase {
  private readonly favoritesRepository: FavoritesRepository;
  private readonly usersRepository: UsersRepository;

  constructor(
    favoritesRepository: FavoritesRepository,
    usersRepository: UsersRepository
  ) {
    this.favoritesRepository = favoritesRepository;
    this.usersRepository = usersRepository;
  }

  async execute({
    user_id,
    page,
    limit,
    type,
    tags,
    query,
    sortOrder,
  }: GetUserFavoritesUseCaseRequest): Promise<GetUserFavoritesUseCaseResponse> {
    const user = await this.usersRepository.findById(user_id);

    if (!user) {
      throw new ResourceNotFoundError();
    }

    // defaults:
    const validatedPage = Math.max(page || DEFAULT_PAGE, 1);

    const validatedLimit = Math.min(
      Math.max(limit || DEFAULT_LIMIT, 1),
      MAX_LIMIT
    );

    const validatedSortOrder: SortOrder = sortOrder || 'desc';

    const filters: QueryOptions = {
      type: type || undefined,
      tags: tags && tags.length > 0 ? tags : undefined,
      query: query?.trim() ? query.trim() : undefined,
      sortOrder: validatedSortOrder,
    };

    const total = await this.favoritesRepository.countByUserId(
      user_id,
      filters
    );

    const totalPages = Math.ceil(total / validatedLimit);
    const hasNextPage = validatedPage < totalPages;
    const hasPrevPage = validatedPage > 1;

    const favorites =
      total > 0
        ? await this.favoritesRepository.findManyByUserId(
            user_id,
            {
              page: validatedPage,
              limit: validatedLimit,
            },
            filters
          )
        : [];

    return {
      favorites,
      pagination: {
        page: validatedPage,
        limit: validatedLimit,
        total,
        totalPages,
        hasNextPage,
        hasPrevPage,
      },
    };
  }
}
