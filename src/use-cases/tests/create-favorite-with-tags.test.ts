import type { FavoriteType } from '@prisma/client';
import { beforeEach, describe, expect, it } from 'vitest';
import { InMemoryFavoriteTagsRepository } from '@/repositories/in-memory/in-memory-favorite-tags-repository';
import { InMemoryTagsRepository } from '@/repositories/in-memory/in-memory-tags-repository';
import { InMemoryFavoritesRepository } from '../../repositories/in-memory/in-memory-favorites-repository';
import { InMemoryUsersRepository } from '../../repositories/in-memory/in-memory-users-repository';
import { CreateFavoriteWithTagsUseCase } from '../create-favorite-with-tags';
import { ManageTagsUseCase } from '../manage-tags';

let favoritesRepository: InMemoryFavoritesRepository;
let usersRepository: InMemoryUsersRepository;
let tagsRepository: InMemoryTagsRepository;
let favoriteTagsRepository: InMemoryFavoriteTagsRepository;
let manageTagsUseCase: ManageTagsUseCase;
let sut: CreateFavoriteWithTagsUseCase;

describe('Create Favorite With Tags', () => {
  beforeEach(() => {
    favoritesRepository = new InMemoryFavoritesRepository();
    usersRepository = new InMemoryUsersRepository();
    tagsRepository = new InMemoryTagsRepository();
    favoriteTagsRepository = new InMemoryFavoriteTagsRepository();

    manageTagsUseCase = new ManageTagsUseCase(tagsRepository);

    sut = new CreateFavoriteWithTagsUseCase(
      favoritesRepository,
      usersRepository,
      favoriteTagsRepository,
      manageTagsUseCase
    );
  });

  it('should create a favorite with new tags', async () => {
    const user = await usersRepository.create({
      username: 'testuser',
      email: 'test@example.com',
      password_hash: 'hashedpassword',
    });

    const favoriteData = {
      title: 'React Documentation',
      description: 'Official React docs',
      url: 'https://react.dev',
      type: 'SITES' as FavoriteType,
      user_id: user.id,
      tags: ['react', 'javascript', 'frontend'],
    };

    expect(tagsRepository.getItemsCount()).toBe(0);
    expect(favoriteTagsRepository.getCount()).toBe(0);

    const result = await sut.execute(favoriteData);

    expect(result.favorite).toEqual({
      id: expect.any(String),
      title: 'React Documentation',
      description: 'Official React docs',
      url: 'https://react.dev',
      type: 'SITES',
      user_id: user.id,
      created_at: expect.any(Date),
      updated_at: expect.any(Date),
    });
  });
});
