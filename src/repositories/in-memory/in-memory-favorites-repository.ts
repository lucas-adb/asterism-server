import { randomUUID } from 'node:crypto';
import type { Favorite, Prisma } from '@prisma/client';
import type { FavoriteWithTags } from '@/@types/favorite-types';
import type { PaginationInput } from '@/@types/pagination-types';
import type { QueryOptions } from '@/@types/query-types';
import type { FavoritesRepository } from '../favorites-repository';

export class InMemoryFavoritesRepository implements FavoritesRepository {
  protected items: Favorite[] = [];

  protected favoriteTags: Array<{
    favorite_id: string;
    tag: { id: string; name: string; created_at: Date; updated_at: Date };
  }> = [];

  delete(id: string): Promise<void> {
    this.items = this.items.filter((item) => item.id !== id);
    this.favoriteTags = this.favoriteTags.filter(
      (item) => item.favorite_id !== id
    );

    return Promise.resolve();
  }

  create(data: Prisma.FavoriteUncheckedCreateInput): Promise<Favorite> {
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

    this.items.push(favorite);

    return Promise.resolve(favorite);
  }

  findByIdWithTags(id: string): Promise<FavoriteWithTags | null> {
    const favorite = this.items.find((item) => item.id === id);

    if (!favorite) {
      return Promise.resolve(null);
    }

    const tags = this.getFavoriteTags(favorite.id);
    const result = {
      ...favorite,
      tags,
    };

    return Promise.resolve(result);
  }

  findManyByUserId(
    user_id: string,
    pagination?: PaginationInput,
    filters?: QueryOptions
  ): Promise<FavoriteWithTags[]> {
    let userFavorites = this.items.filter((item) => item.user_id === user_id);

    if (filters?.type) {
      userFavorites = userFavorites.filter((fav) => fav.type === filters.type);
    }

    if (filters?.query) {
      const queryLower = filters.query.toLowerCase();
      userFavorites = userFavorites.filter(
        (fav) =>
          fav.title.toLowerCase().includes(queryLower) ||
          fav.description.toLowerCase().includes(queryLower)
      );
    }

    if (filters?.tags && filters.tags.length > 0) {
      const requiredTags = filters.tags;
      userFavorites = userFavorites.filter((fav) => {
        const favoriteTags = this.getFavoriteTags(fav.id);
        const favoriteTagNames = favoriteTags.map((tag) => tag.name);

        return requiredTags.every((tagName) =>
          favoriteTagNames.includes(tagName)
        );
      });
    }

    const sortOrder = filters?.sortOrder || 'desc';
    userFavorites.sort((a, b) => {
      const dateA = a.created_at.getTime();
      const dateB = b.created_at.getTime();
      return sortOrder === 'desc' ? dateB - dateA : dateA - dateB;
    });

    if (pagination?.page && pagination?.limit) {
      const skip = (pagination.page - 1) * pagination.limit;
      const take = pagination.limit;
      userFavorites = userFavorites.slice(skip, skip + take);
    }

    const result = userFavorites.map((favorite) => ({
      ...favorite,
      tags: this.getFavoriteTags(favorite.id),
    }));

    return Promise.resolve(result);
  }

  async countByUserId(
    user_id: string,
    filters?: QueryOptions
  ): Promise<number> {
    const result = await this.findManyByUserId(user_id, undefined, filters);
    return result.length;
  }

  // HELPERS

  getFavoriteTags(favoriteId: string) {
    return this.favoriteTags
      .filter((ft) => ft.favorite_id === favoriteId)
      .map((ft) => ft.tag);
  }

  addTagToFavorite(favoriteId: string, tagName: string) {
    const tag = {
      id: randomUUID(),
      name: tagName,
      created_at: new Date(),
      updated_at: new Date(),
    };

    this.favoriteTags.push({
      favorite_id: favoriteId,
      tag,
    });

    return tag;
  }

  clear() {
    this.items = [];
    this.favoriteTags = [];
  }

  getItemsCount() {
    return this.items.length;
  }
}
