import { FavoriteType } from '@prisma/client';
import type { FastifyReply, FastifyRequest } from 'fastify';
import z from 'zod';
import { MAX_LIMIT } from '@/@types/pagination-types';
import { makeGetUserFavoritesUseCase } from '@/factories/make-get-user-favorites-use-case';
import type { SortOrder } from '@/use-cases/get-user-favorites-use-case';
import { HTTP_STATUS } from '@/utils/status-code';

export async function getUserFavorites(
  request: FastifyRequest,
  reply: FastifyReply
) {
  const querySchema = z.object({
    page: z.coerce.number().int().min(1).optional(),
    limit: z.coerce.number().int().min(1).max(MAX_LIMIT).optional(),
    type: z.enum(FavoriteType).optional(),
    tags: z
      .string()
      .optional()
      .transform((tagsString) =>
        tagsString
          ? tagsString
              .split(',')
              .map((tag) => tag.trim())
              .filter(Boolean)
          : undefined
      ),
    search: z.string().optional(),
    sortOrder: z.enum(['asc', 'desc'] as const).optional(),
  });

  const { page, limit, type, tags, search, sortOrder } = querySchema.parse(
    request.query
  );

  const useCase = makeGetUserFavoritesUseCase();

  const result = await useCase.execute({
    user_id: request.user.sub,
    page,
    limit,
    type,
    tags,
    query: search,
    sortOrder: sortOrder as SortOrder,
  });

  reply.status(HTTP_STATUS.OK).send(result);
}
