import type { FavoriteTag, Prisma } from '@prisma/client';
import type { FavoriteTagsRepository } from '../favorite-tags-repository';

export class InMemoryFavoriteTagsRepository implements FavoriteTagsRepository {
  protected items: FavoriteTag[] = [];

  async createMany(data: Prisma.FavoriteTagCreateManyInput[]): Promise<void> {
    const now = new Date();

    for (const item of data) {
      const favoriteTag = {
        favorite_id: item.favorite_id,
        tag_id: item.tag_id,
        created_at: now,
        updated_at: now,
      };

      await this.items.push(favoriteTag);
    }
  }

  async findByFavoriteId(favoriteId: string): Promise<FavoriteTag[]> {
    const favoriteTags = await this.items.filter(
      (item) => item.favorite_id === favoriteId
    );

    return favoriteTags;
  }

  deleteByFavoriteId(favoriteId: string): Promise<void> {
    this.items = this.items.filter((item) => item.favorite_id !== favoriteId);
    return Promise.resolve();
  }

  // test helpers:
  getCount() {
    return this.items.length;
  }

  clear() {
    this.items = [];
  }
}
