import type { FavoriteTag, Prisma } from '@prisma/client';
import { prisma } from '@/lib/prisma';
import type { FavoriteTagsRepository } from '../favorite-tags-repository';

export class PrismaFavoriteTagsRepository implements FavoriteTagsRepository {
  async createMany(data: Prisma.FavoriteTagCreateManyInput[]): Promise<void> {
    await prisma.favoriteTag.createMany({
      data,
    });
  }

  async findByFavoriteId(favoriteId: string): Promise<FavoriteTag[]> {
    const favoriteTags = await prisma.favoriteTag.findMany({
      where: {
        favorite_id: favoriteId,
      },
    });

    return favoriteTags;
  }

  async deleteByFavoriteId(favoriteId: string): Promise<void> {
    await prisma.favoriteTag.deleteMany({ where: { favorite_id: favoriteId } });
  }
}
