import { FavoriteType } from '@prisma/client';
import { beforeEach, describe, expect, it } from 'vitest';
import { InMemoryFavoritesRepository } from '../../repositories/in-memory/in-memory-favorites-repository';
import { InMemoryUsersRepository } from '../../repositories/in-memory/in-memory-users-repository';
import { DeleteFavoriteUseCase } from '../delete-favorite-use-case';

let usersRepository: InMemoryUsersRepository;
let repository: InMemoryFavoritesRepository;
let sut: DeleteFavoriteUseCase;

describe('Delete Favorite', () => {
  beforeEach(() => {
    usersRepository = new InMemoryUsersRepository();
    repository = new InMemoryFavoritesRepository();
    sut = new DeleteFavoriteUseCase(repository, usersRepository);
  });

  it('deletes favorite and associated tags', async () => {
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

    const favorite = await repository.create(favoriteData);
    await repository.addTagToFavorite(favorite.id, 'tag1');

    expect(repository.getItemsCount()).toBe(1);
    expect(repository.getFavoriteTags(favorite.id)).toHaveLength(1);

    await sut.execute({ favorite_id: favorite.id, user_id: user.id });

    expect(repository.getItemsCount()).toBe(0);
    expect(repository.getFavoriteTags(favorite.id)).toHaveLength(0);
  });
});
