import type { FavoriteType } from '@prisma/client';
import { beforeEach, describe, expect, it } from 'vitest';
import { InMemoryFavoriteTagsRepository } from '@/repositories/in-memory/in-memory-favorite-tags-repository';
import { InMemoryTagsRepository } from '@/repositories/in-memory/in-memory-tags-repository';
import { InMemoryFavoritesRepository } from '../../repositories/in-memory/in-memory-favorites-repository';
import { InMemoryUsersRepository } from '../../repositories/in-memory/in-memory-users-repository';
import { CreateFavoriteWithTagsUseCase } from '../create-favorite-with-tags';
import { ResourceNotFoundError } from '../errors/resource-not-found-error';
import { ManageTagsUseCase } from '../manage-tags';
import { makeFavorite } from './factories/make-favorite';
import { makeTagName } from './factories/make-tag';
import { makeUser } from './factories/make-user';

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
    const tagsArrayLength = 3;
    const user = await makeUser(usersRepository);

    const favoriteData = makeFavorite({
      title: 'React Documentation',
      description: 'Official React docs',
      url: 'https://react.dev',
      type: 'SITES' as FavoriteType,
      user_id: user.id,
    });

    const favoriteWithTagsData = {
      ...favoriteData,
      tags: Array.from({ length: tagsArrayLength }, () => makeTagName()),
    };

    expect(tagsRepository.getItemsCount()).toBe(0);
    expect(favoriteTagsRepository.getCount()).toBe(0);

    const result = await sut.execute(favoriteWithTagsData);

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

    expect(result.tags).toHaveLength(tagsArrayLength);
    expect(tagsRepository.getItemsCount()).toBe(tagsArrayLength);
    expect(favoriteTagsRepository.getCount()).toBe(tagsArrayLength);
  });

  it('should create favorite without tags when tags array is empty', async () => {
    const user = await makeUser(usersRepository);

    const favoriteData = makeFavorite({
      user_id: user.id,
    });

    const favoriteWithTagsData = {
      ...favoriteData,
      tags: [],
    };

    expect(tagsRepository.getItemsCount()).toBe(0);
    expect(favoriteTagsRepository.getCount()).toBe(0);

    const result = await sut.execute(favoriteWithTagsData);

    expect(result.favorite).toEqual(
      expect.objectContaining({ id: expect.any(String) })
    );

    expect(result.tags).toHaveLength(0);
    expect(tagsRepository.getItemsCount()).toBe(0);
    expect(favoriteTagsRepository.getCount()).toBe(0);
  });

  it('should throw ResourceNotFoundError when user does not exist', async () => {
    await makeUser(usersRepository);

    const favoriteData = makeFavorite({
      user_id: 'faker-user',
    });

    const favoriteWithTagsData = {
      ...favoriteData,
      tags: [],
    };

    await expect(async () => {
      return await sut.execute(favoriteWithTagsData);
    }).rejects.toBeInstanceOf(ResourceNotFoundError);
  });

  it('should create favorite with mix of existing and new tags', async () => {
    const user = await makeUser(usersRepository);
    await tagsRepository.create({ name: 'react' });
    await tagsRepository.create({ name: 'javascript' });
    const tagsArray = ['react', 'javascript', 'frontend', 'typescript'];

    expect(tagsRepository.getItemsCount()).toBe(2);

    const favoriteWithTagsData = {
      ...makeFavorite({ user_id: user.id }),
      tags: tagsArray,
    };

    const result = await sut.execute(favoriteWithTagsData);

    expect(result.favorite).toEqual(
      expect.objectContaining({ id: expect.any(String) })
    );

    expect(result.tags).toHaveLength(tagsArray.length);
    expect(tagsRepository.getItemsCount()).toBe(tagsArray.length);
    expect(favoriteTagsRepository.getCount()).toBe(tagsArray.length);
  });

  it('should create favorite with existing tags only', async () => {
    const user = await makeUser(usersRepository);
    await tagsRepository.create({ name: 'react' });
    await tagsRepository.create({ name: 'javascript' });
    const tagsArray = ['react', 'javascript'];

    expect(tagsRepository.getItemsCount()).toBe(2);

    const favoriteWithTagsData = {
      ...makeFavorite({ user_id: user.id }),
      tags: tagsArray,
    };

    const result = await sut.execute(favoriteWithTagsData);

    expect(result.favorite).toEqual(
      expect.objectContaining({ id: expect.any(String) })
    );

    expect(result.tags).toHaveLength(tagsArray.length);
    expect(tagsRepository.getItemsCount()).toBe(tagsArray.length);
    expect(favoriteTagsRepository.getCount()).toBe(tagsArray.length);
  });
});
