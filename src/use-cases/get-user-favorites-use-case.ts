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

type ValidatedParams = {
  page: number;
  limit: number;
  sortOrder: SortOrder;
};

type PaginationMetadata = {
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
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

  private validateAndApplyDefaults(
    page?: number,
    limit?: number,
    sortOrder?: SortOrder
  ): ValidatedParams {
    const validatedPage = Math.max(page ?? DEFAULT_PAGE, 1);
    const validatedLimit = Math.min(
      Math.max(limit ?? DEFAULT_LIMIT, 1),
      MAX_LIMIT
    );
    const validatedSortOrder: SortOrder = sortOrder ?? 'desc';

    return {
      page: validatedPage,
      limit: validatedLimit,
      sortOrder: validatedSortOrder,
    };
  }

  private buildFilters(
    type?: string,
    tags?: string[],
    query?: string,
    sortOrder?: SortOrder
  ): QueryOptions {
    return {
      type: type as FavoriteType | undefined,
      tags: tags?.length ? tags : undefined,
      query: query?.trim() || undefined,
      sortOrder,
    };
  }

  private calculatePaginationMetadata(
    total: number,
    page: number,
    limit: number
  ): PaginationMetadata {
    const totalPages = Math.ceil(total / limit);
    const hasNextPage = page < totalPages;
    const hasPrevPage = page > 1;

    return {
      totalPages,
      hasNextPage,
      hasPrevPage,
    };
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

    // Apply defaults and validate parameters
    const validatedParams = this.validateAndApplyDefaults(
      page,
      limit,
      sortOrder
    );

    // Build filters for query
    const filters = this.buildFilters(
      type,
      tags,
      query,
      validatedParams.sortOrder
    );

    // Get total count with filters applied
    const total = await this.favoritesRepository.countByUserId(
      user_id,
      filters
    );

    // Calculate pagination metadata
    const paginationMetadata = this.calculatePaginationMetadata(
      total,
      validatedParams.page,
      validatedParams.limit
    );

    // Fetch favorites if there are any
    const favorites =
      total > 0
        ? await this.favoritesRepository.findManyByUserId(
            user_id,
            {
              page: validatedParams.page,
              limit: validatedParams.limit,
            },
            filters
          )
        : [];

    return {
      favorites,
      pagination: {
        page: validatedParams.page,
        limit: validatedParams.limit,
        total,
        totalPages: paginationMetadata.totalPages,
        hasNextPage: paginationMetadata.hasNextPage,
        hasPrevPage: paginationMetadata.hasPrevPage,
      },
    };
  }
}
