import type { Favorite, FavoriteTag, Prisma } from '@prisma/client';
import { prisma } from '@/lib/prisma';
import type { FavoritesRepository } from '../favorites-repository';

export class PrismaFavoritesRepository implements FavoritesRepository {
  async create(data: Prisma.FavoriteUncheckedCreateInput): Promise<Favorite> {
    const favorite = await prisma.favorite.create({
      data,
    });

    return favorite;
  }

  async findByIdWithTags(
    id: string
  ): Promise<(Favorite & { tags: FavoriteTag[] }) | null> {
    const favorite = await prisma.favorite.findUnique({
      where: { id },
      include: {
        tags: true,
      },
    });

    if (!favorite) {
      return null;
    }

    return favorite;
  }
}
