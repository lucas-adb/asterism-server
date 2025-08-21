import { PrismaFavoriteTagsRepository } from '@/repositories/prisma/prisma-favorite-tags-repository';
import { PrismaFavoritesRepository } from '@/repositories/prisma/prisma-favorites-repository';
import { PrismaTagsRepository } from '@/repositories/prisma/prisma-tags-repository';
import { PrismaUsersRepository } from '@/repositories/prisma/prisma-users-repository';
import { CreateFavoriteWithTagsUseCase } from '@/use-cases/create-favorite-with-tags';
import { ManageTagsUseCase } from '@/use-cases/manage-tags';

export function makeCreateFavoriteWithTagsUseCase() {
  const favoritesRepository = new PrismaFavoritesRepository();
  const usersRepository = new PrismaUsersRepository();
  const favoriteTagsRepository = new PrismaFavoriteTagsRepository();
  const tagsRepository = new PrismaTagsRepository();

  const manageTagsUseCase = new ManageTagsUseCase(tagsRepository);

  const useCase = new CreateFavoriteWithTagsUseCase(
    favoritesRepository,
    usersRepository,
    favoriteTagsRepository,
    manageTagsUseCase
  );

  return useCase;
}
