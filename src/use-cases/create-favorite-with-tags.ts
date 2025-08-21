import type { Favorite, FavoriteType, Tag } from '@prisma/client';
import type { FavoriteTagsRepository } from '@/repositories/favorite-tags-repository';
import type { FavoritesRepository } from '../repositories/favorites-repository';
import type { UsersRepository } from '../repositories/users-repository';
import { ResourceNotFoundError } from './errors/resource-not-found-error';
import type { ManageTagsUseCase } from './manage-tags';

type CreateFavoriteWithTagsUseCaseRequest = {
  title: string;
  description: string;
  url: string;
  type: FavoriteType;
  user_id: string;
  tags: string[];
};

type CreateFavoriteWithTagsUseCaseResponse = {
  favorite: Favorite;
  tags: Tag[];
};

export class CreateFavoriteWithTagsUseCase {
  private readonly favoritesRepository: FavoritesRepository;
  private readonly usersRepository: UsersRepository;
  private readonly favoriteTagsRepository: FavoriteTagsRepository;
  private readonly manageTagsUseCase: ManageTagsUseCase;

  constructor(
    favoritesRepository: FavoritesRepository,
    usersRepository: UsersRepository,
    favoriteTagsRepository: FavoriteTagsRepository,
    manageTagsUseCase: ManageTagsUseCase
  ) {
    this.favoritesRepository = favoritesRepository;
    this.usersRepository = usersRepository;
    this.favoriteTagsRepository = favoriteTagsRepository;
    this.manageTagsUseCase = manageTagsUseCase;
  }

  async execute({
    title,
    description,
    url,
    type,
    user_id,
    tags,
  }: CreateFavoriteWithTagsUseCaseRequest): Promise<CreateFavoriteWithTagsUseCaseResponse> {
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

    let managedTags = [] as Tag[];

    if (tags?.length > 0) {
      const { tags: resultTags } = await this.manageTagsUseCase.execute({
        tagNames: tags,
      });

      managedTags = resultTags;

      const favoriteTagsData = managedTags.map((tag) => ({
        favorite_id: favorite.id,
        tag_id: tag.id,
      }));

      await this.favoriteTagsRepository.createMany(favoriteTagsData);
    }

    return { favorite, tags: managedTags };
  }
}
