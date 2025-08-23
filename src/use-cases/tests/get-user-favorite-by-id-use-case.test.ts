import { beforeEach, describe, expect, it } from 'vitest';
import { InMemoryFavoritesRepository } from '../../repositories/in-memory/in-memory-favorites-repository';
import { InMemoryUsersRepository } from '../../repositories/in-memory/in-memory-users-repository';
import { ResourceNotFoundError } from '../errors/resource-not-found-error';
import { UserUnauthorized } from '../errors/user-unauthorized-error';
import { GetUserFavoriteByIdUseCase } from '../get-user-favorite-by-id-use-case';

let favoritesRepository: InMemoryFavoritesRepository;
let usersRepository: InMemoryUsersRepository;
let sut: GetUserFavoriteByIdUseCase;

describe('Get User Favorite By Id Use Case', () => {
  beforeEach(() => {
    favoritesRepository = new InMemoryFavoritesRepository();
    usersRepository = new InMemoryUsersRepository();
    sut = new GetUserFavoriteByIdUseCase(favoritesRepository, usersRepository);
  });

  it('should find favorite', async () => {
    const user = await usersRepository.create({
      username: 'John Doe',
      email: 'john@example.com',
      password_hash: 'hashed-password',
    });

    const favorite1 = await favoritesRepository.create({
      title: 'React Tutorial',
      description: 'Learn React basics',
      url: 'https://react.example.com',
      type: 'TUTORIALS',
      user_id: user.id,
    });

    const result = await sut.execute({
      user_id: user.id,
      favorite_id: favorite1.id,
    });

    expect(result.favorite.id).toBe(favorite1.id);
  });

  it('should throw error if tries to find non-existent favorite', async () => {
    const user = await usersRepository.create({
      username: 'John Doe',
      email: 'john@example.com',
      password_hash: 'hashed-password',
    });

    await expect(async () => {
      await sut.execute({
        user_id: user.id,
        favorite_id: 'non-existent-fav-id',
      });
    }).rejects.toBeInstanceOf(ResourceNotFoundError);
  });

  it('should throw UserUnauthorized if favorite belongs to another user', async () => {
    const user = await usersRepository.create({
      username: 'John Doe',
      email: 'john@example.com',
      password_hash: 'hashed-password',
    });

    const favorite1 = await favoritesRepository.create({
      title: 'React Tutorial',
      description: 'Learn React basics',
      url: 'https://react.example.com',
      type: 'TUTORIALS',
      user_id: user.id,
    });

    const user2 = await usersRepository.create({
      username: 'Second User',
      email: 'john@example.com',
      password_hash: 'hashed-password',
    });

    await expect(async () => {
      await sut.execute({
        user_id: user2.id,
        favorite_id: favorite1.id,
      });
    }).rejects.toBeInstanceOf(UserUnauthorized);
  });
});
