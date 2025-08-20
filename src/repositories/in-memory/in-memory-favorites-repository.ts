import { randomUUID } from 'node:crypto';
import type { Favorite, FavoriteTag, Prisma } from '@prisma/client';
import type { FavoritesRepository } from '../favorites-repository';

export class InMemoryFavoritesRepository implements FavoritesRepository {
  protected items: Favorite[] = [];

  async create(data: Prisma.FavoriteUncheckedCreateInput): Promise<Favorite> {
    const now = new Date();

    const favorite = {
      id: randomUUID(),
      title: data.title,
      description: data.description,
      url: data.url,
      type: data.type,
      user_id: data.user_id,
      created_at: now,
      updated_at: now,
    };

    await this.items.push(favorite);

    return favorite;
  }
}
