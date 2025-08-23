import type { Favorite, Prisma } from '@prisma/client';
import type { FavoriteWithTags } from '@/@types/favorite-types';
import type { PaginationInput } from '@/@types/pagination-types';
import type { QueryOptions } from '@/@types/query-types';
import { prisma } from '@/lib/prisma';
import type { FavoritesRepository } from '../favorites-repository';

export class PrismaFavoritesRepository implements FavoritesRepository {
  async delete(id: string): Promise<void> {
    await prisma.favorite.delete({
      where: { id },
    });
  }

  async create(data: Prisma.FavoriteUncheckedCreateInput): Promise<Favorite> {
    const favorite = await prisma.favorite.create({
      data,
    });

    return favorite;
  }

  async update(
    id: string,
    data: Prisma.FavoriteUncheckedCreateInput
  ): Promise<Favorite> {
    const favorite = await prisma.favorite.update({
      where: { id },
      data: {
        title: data.title,
        description: data.description,
        url: data.url,
        type: data.type,
      },
    });

    return favorite;
  }

  async findByIdWithTags(id: string): Promise<FavoriteWithTags | null> {
    const favorite = await prisma.favorite.findUnique({
      where: { id },
      include: {
        tags: {
          include: {
            tag: true,
          },
        },
      },
    });

    if (!favorite) {
      return null;
    }

    // Transform to expected format
    return {
      ...favorite,
      tags: favorite.tags.map((ft) => ft.tag),
    };
  }

  async findManyByUserId(
    user_id: string,
    pagination?: PaginationInput,
    filters?: QueryOptions
  ): Promise<FavoriteWithTags[]> {
    // Build the where clause
    const where: Prisma.FavoriteWhereInput = {
      user_id,
      // Filter by type if specified
      ...(filters?.type && { type: filters.type }),
      // Filter by search query if specified
      ...(filters?.query && {
        OR: [
          { title: { contains: filters.query, mode: 'insensitive' } },
          { description: { contains: filters.query, mode: 'insensitive' } },
        ],
      }),
      // Filter by tags (AND - must have ALL tags) if specified
      ...(filters?.tags &&
        filters.tags.length > 0 && {
          AND: filters.tags.map((tagName) => ({
            tags: {
              some: {
                tag: {
                  name: tagName,
                },
              },
            },
          })),
        }),
    };

    // Build order by clause
    const orderBy: Prisma.FavoriteOrderByWithRelationInput = {
      created_at: filters?.sortOrder || 'desc',
    };

    // Build pagination
    const skip =
      pagination?.page && pagination?.limit
        ? (pagination.page - 1) * pagination.limit
        : undefined;
    const take = pagination?.limit;

    const favorites = await prisma.favorite.findMany({
      where,
      include: {
        tags: {
          include: {
            tag: true,
          },
        },
      },
      orderBy,
      skip,
      take,
    });

    // Transform to match FavoriteWithTags type
    return favorites.map((favorite) => ({
      ...favorite,
      tags: favorite.tags.map((favoriteTag) => favoriteTag.tag),
    }));
  }

  async countByUserId(
    user_id: string,
    filters?: QueryOptions
  ): Promise<number> {
    // Build the same where clause as findManyByUserId (without pagination)
    const where: Prisma.FavoriteWhereInput = {
      user_id,
      ...(filters?.type && { type: filters.type }),
      ...(filters?.query && {
        OR: [
          { title: { contains: filters.query, mode: 'insensitive' } },
          { description: { contains: filters.query, mode: 'insensitive' } },
        ],
      }),
      ...(filters?.tags &&
        filters.tags.length > 0 && {
          AND: filters.tags.map((tagName) => ({
            tags: {
              some: {
                tag: {
                  name: tagName,
                },
              },
            },
          })),
        }),
    };

    return await prisma.favorite.count({
      where,
    });
  }
}
