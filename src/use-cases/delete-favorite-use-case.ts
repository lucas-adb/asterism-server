import type { FavoritesRepository } from '../repositories/favorites-repository';
import type { UsersRepository } from '../repositories/users-repository';
import { ResourceNotFoundError } from './errors/resource-not-found-error';
import { UserUnauthorized } from './errors/user-unauthorized-error';

type DeleteFavoriteUseCaseRequest = {
  favorite_id: string;
  user_id: string;
};

export class DeleteFavoriteUseCase {
  private readonly favoritesRepository: FavoritesRepository;
  private readonly usersRepository: UsersRepository;

  constructor(
    favoritesRepository: FavoritesRepository,
    usersRepository: UsersRepository
  ) {
    this.favoritesRepository = favoritesRepository;
    this.usersRepository = usersRepository;
  }

  async execute({
    favorite_id,
    user_id,
  }: DeleteFavoriteUseCaseRequest): Promise<void> {
    const user = await this.usersRepository.findById(user_id);

    if (!user) {
      throw new ResourceNotFoundError();
    }

    const favorite =
      await this.favoritesRepository.findByIdWithTags(favorite_id);

    if (!favorite) {
      throw new ResourceNotFoundError();
    }

    if (favorite.user_id !== user_id) {
      throw new UserUnauthorized();
    }

    await this.favoritesRepository.delete(favorite_id);
  }
}
