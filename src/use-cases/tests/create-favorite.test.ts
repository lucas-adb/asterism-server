import { FavoriteType } from '@prisma/client';
import { beforeEach, describe, expect, it } from 'vitest';
import { InMemoryFavoritesRepository } from '../../repositories/in-memory/in-memory-favorites-repository';
import { InMemoryUsersRepository } from '../../repositories/in-memory/in-memory-users-repository';
import { CreateFavoriteUseCase } from '../create-favorite';
import { ResourceNotFoundError } from '../errors/resource-not-found-error';

let usersRepository: InMemoryUsersRepository;
let repository: InMemoryFavoritesRepository;
let sut: CreateFavoriteUseCase;

describe('Create Favorite', () => {
  beforeEach(() => {
    usersRepository = new InMemoryUsersRepository();
    repository = new InMemoryFavoritesRepository();
    sut = new CreateFavoriteUseCase(repository, usersRepository);
  });

  it('creates favorite', async () => {
    const userData = {
      username: 'Testing Joe',
      email: 'test@mail.com',
      password_hash: '123456',
    };

    const user = await usersRepository.create(userData);

    const favoriteData = {
      title: 'Test Title',
      description: 'Test Description',
      url: 'https://aeon.co/',
      type: FavoriteType.SITES,
      user_id: user.id,
    };

    const { favorite } = await sut.execute(favoriteData);

    expect(favorite.id).toEqual(expect.any(String));
  });

  it('cant create favorite without user', async () => {
    const favoriteData = {
      title: 'Test Title',
      description: 'Test Description',
      url: 'https://aeon.co/',
      type: FavoriteType.SITES,
      user_id: 'fake-user-id',
    };

    await expect(async () => {
      await sut.execute(favoriteData);
    }).rejects.toBeInstanceOf(ResourceNotFoundError);
  });
});
