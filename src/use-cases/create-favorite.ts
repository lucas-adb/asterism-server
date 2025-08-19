import type { Favorite, FavoriteType } from '@prisma/client';
import type { FavoritesRepository } from '../repositories/favorites-repository';
import type { UsersRepository } from '../repositories/users-repository';
import { ResourceNotFoundError } from './errors/resource-not-found-error';

type CreateFavoriteUseCaseRequest = {
  title: string;
  description: string;
  url: string;
  type: FavoriteType;
  user_id: string;
};

type CreateFavoriteUseCaseResponse = {
  favorite: Favorite;
};

export class CreateFavoriteUseCase {
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
    title,
    description,
    url,
    type,
    user_id,
  }: CreateFavoriteUseCaseRequest): Promise<CreateFavoriteUseCaseResponse> {
    const user = await this.usersRepository.findById(user_id);

    if (!user) {
      throw new ResourceNotFoundError();
    }

    const favorite = await this.favoritesRepository.create({
      title,
      description,
      url,
      type,
      user_id,
    });

    return { favorite };
  }
}
