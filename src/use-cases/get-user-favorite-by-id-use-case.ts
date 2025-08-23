import type { FavoriteWithTags } from '@/@types/favorite-types';
import type { FavoritesRepository } from '@/repositories/favorites-repository';
import type { UsersRepository } from '@/repositories/users-repository';
import { ResourceNotFoundError } from './errors/resource-not-found-error';
import { UserUnauthorized } from './errors/user-unauthorized-error';

type GetUserFavoriteByIdUseCaseRequest = {
  user_id: string;
  favorite_id: string;
};

type GetUserFavoriteByIdUseCaseResponse = {
  favorite: FavoriteWithTags;
};

export class GetUserFavoriteByIdUseCase {
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
    user_id,
    favorite_id,
  }: GetUserFavoriteByIdUseCaseRequest): Promise<GetUserFavoriteByIdUseCaseResponse> {
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

    return { favorite };
  }
}
