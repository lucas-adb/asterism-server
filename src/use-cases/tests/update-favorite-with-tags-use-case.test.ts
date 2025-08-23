import type { FavoriteType } from '@prisma/client';
import { beforeEach, describe, expect, it } from 'vitest';
import { InMemoryFavoriteTagsRepository } from '@/repositories/in-memory/in-memory-favorite-tags-repository';
import { InMemoryTagsRepository } from '@/repositories/in-memory/in-memory-tags-repository';
import { InMemoryFavoritesRepository } from '../../repositories/in-memory/in-memory-favorites-repository';
import { InMemoryUsersRepository } from '../../repositories/in-memory/in-memory-users-repository';
import { CreateFavoriteWithTagsUseCase } from '../create-favorite-with-tags';
import { ResourceNotFoundError } from '../errors/resource-not-found-error';
import { ManageTagsUseCase } from '../manage-tags';
import { UpdateFavoriteWithTagsUseCase } from '../update-favorite-with-tags-use-case';
import { makeUser } from './factories/make-user';

let favoritesRepository: InMemoryFavoritesRepository;
let usersRepository: InMemoryUsersRepository;
let tagsRepository: InMemoryTagsRepository;
let favoriteTagsRepository: InMemoryFavoriteTagsRepository;
let manageTagsUseCase: ManageTagsUseCase;
let createFavoriteWithTagsUseCase: CreateFavoriteWithTagsUseCase;
let sut: UpdateFavoriteWithTagsUseCase;

describe('Update Favorite With Tags', () => {
  beforeEach(() => {
    favoritesRepository = new InMemoryFavoritesRepository();
    usersRepository = new InMemoryUsersRepository();
    tagsRepository = new InMemoryTagsRepository();

    favoriteTagsRepository = new InMemoryFavoriteTagsRepository();

    manageTagsUseCase = new ManageTagsUseCase(tagsRepository);

    createFavoriteWithTagsUseCase = new CreateFavoriteWithTagsUseCase(
      favoritesRepository,
      usersRepository,
      favoriteTagsRepository,
      manageTagsUseCase
    );

    sut = new UpdateFavoriteWithTagsUseCase(
      favoritesRepository,
      usersRepository,
      favoriteTagsRepository,
      manageTagsUseCase
    );
  });

  it('should update favorite and change tags', async () => {
    const user = await makeUser(usersRepository);

    const initialFavorite = await createFavoriteWithTagsUseCase.execute({
      title: 'React Guide',
      description: 'Learning React',
      url: 'https://react.example.com',
      type: 'TUTORIALS' as FavoriteType,
      user_id: user.id,
      tags: ['react', 'javascript'],
    });

    const initialTagsCount = tagsRepository.getItemsCount();
    const initialFavoriteTagsCount = favoriteTagsRepository.getCount();

    const result = await sut.execute({
      favorite_id: initialFavorite.favorite.id,
      title: 'Vue Guide',
      description: 'Learning Vue',
      url: 'https://vue.example.com',
      type: 'TUTORIALS' as FavoriteType,
      user_id: user.id,
      tags: ['vue', 'typescript'],
    });

    expect(result.favorite.title).toBe('Vue Guide');
    expect(result.favorite.description).toBe('Learning Vue');
    expect(result.tags).toHaveLength(2);
    expect(result.tags.map((tag) => tag.name)).toEqual(['vue', 'typescript']);

    expect(tagsRepository.getItemsCount()).toBe(initialTagsCount + 2);
    expect(favoriteTagsRepository.getCount()).toBe(initialFavoriteTagsCount);
  });

  it('should throw ResourceNotFoundError when favorite does not exist', async () => {
    const user = await makeUser(usersRepository);

    await expect(() =>
      sut.execute({
        favorite_id: 'non-existent-id',
        title: 'New Title',
        description: 'New Description',
        url: 'https://new-url.com',
        type: 'SITES' as FavoriteType,
        user_id: user.id,
        tags: ['react'],
      })
    ).rejects.toBeInstanceOf(ResourceNotFoundError);
  });
});
