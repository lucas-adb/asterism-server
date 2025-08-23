import type { Favorite, FavoriteType, Tag } from '@prisma/client';
import type { FavoriteTagsRepository } from '@/repositories/favorite-tags-repository';
import type { FavoritesRepository } from '../repositories/favorites-repository';
import type { UsersRepository } from '../repositories/users-repository';
import { ResourceNotFoundError } from './errors/resource-not-found-error';
import { UserUnauthorized } from './errors/user-unauthorized-error';
import type { ManageTagsUseCase } from './manage-tags';

type UpdateFavoriteWithTagsUseCaseRequest = {
  favorite_id: string;
  title: string;
  description: string;
  url: string;
  type: FavoriteType;
  user_id: string;
  tags: string[];
};

type UpdateFavoriteWithTagsUseCaseResponse = {
  favorite: Favorite;
  tags: Tag[];
};

export class UpdateFavoriteWithTagsUseCase {
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
    favorite_id,
    title,
    description,
    url,
    type,
    user_id,
    tags,
  }: UpdateFavoriteWithTagsUseCaseRequest): Promise<UpdateFavoriteWithTagsUseCaseResponse> {
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

    const updatedFavorite = await this.favoritesRepository.update(favorite_id, {
      title,
      description,
      url,
      type,
      user_id,
    });

    const currentTags = this.removeDuplicates(
      favorite.tags.map((tag) => this.normalizeTag(tag.name))
    );

    const newTags = tags.map(this.normalizeTag).filter((tag) => tag.length > 0);

    const tagsChanged = this.hasTagsChanged(currentTags, newTags);

    let managedTags = [] as Tag[];

    if (tagsChanged) {
      await this.favoriteTagsRepository.deleteByFavoriteId(favorite_id);

      if (newTags?.length > 0) {
        const { tags: resultTags } = await this.manageTagsUseCase.execute({
          tagNames: newTags,
        });

        managedTags = resultTags;

        const favoriteTagsData = managedTags.map((tag) => ({
          favorite_id: updatedFavorite.id,
          tag_id: tag.id,
        }));

        await this.favoriteTagsRepository.createMany(favoriteTagsData);
      }
    }

    const finalTags = tagsChanged ? managedTags : favorite.tags;
    return { favorite: updatedFavorite, tags: finalTags };
  }

  private normalizeTag(name: string) {
    return name.trim().toLowerCase();
  }

  private removeDuplicates(tags: string[]) {
    return [...new Set(tags)];
  }

  private hasTagsChanged(currentTags: string[], newTags: string[]): boolean {
    const currentTagsSorted = [...currentTags].sort();
    const newTagsSorted = [...newTags].sort();

    const tagsChanged =
      currentTagsSorted.length !== newTagsSorted.length ||
      !currentTagsSorted.every((tag, index) => tag === newTagsSorted[index]);

    return tagsChanged;
  }
}
