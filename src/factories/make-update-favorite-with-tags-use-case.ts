import { PrismaFavoriteTagsRepository } from '@/repositories/prisma/prisma-favorite-tags-repository';
import { PrismaFavoritesRepository } from '@/repositories/prisma/prisma-favorites-repository';
import { PrismaTagsRepository } from '@/repositories/prisma/prisma-tags-repository';
import { PrismaUsersRepository } from '@/repositories/prisma/prisma-users-repository';
import { ManageTagsUseCase } from '@/use-cases/manage-tags';
import { UpdateFavoriteWithTagsUseCase } from '@/use-cases/update-favorite-with-tags-use-case';

export function makeUpdateFavoriteWithTagsUseCase() {
  const favoritesRepository = new PrismaFavoritesRepository();
  const usersRepository = new PrismaUsersRepository();
  const favoriteTagsRepository = new PrismaFavoriteTagsRepository();
  const tagsRepository = new PrismaTagsRepository();

  const manageTagsUseCase = new ManageTagsUseCase(tagsRepository);

  const useCase = new UpdateFavoriteWithTagsUseCase(
    favoritesRepository,
    usersRepository,
    favoriteTagsRepository,
    manageTagsUseCase
  );

  return useCase;
}
