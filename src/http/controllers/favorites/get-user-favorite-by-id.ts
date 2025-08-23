import type { FastifyReply, FastifyRequest } from 'fastify';
import z from 'zod';
import { makeGetUseFavoriteByIdUseCase } from '@/factories/make-get-user-favorite-by-id-use-case';
import { HTTP_STATUS } from '@/utils/status-code';

export async function getUserFavoriteById(
  request: FastifyRequest,
  reply: FastifyReply
) {
  const paramsSchema = z.object({
    favorite_id: z.uuid(),
  });

  const { favorite_id } = paramsSchema.parse(request.params);

  const useCase = makeGetUseFavoriteByIdUseCase();

  const result = await useCase.execute({
    user_id: request.user.sub,
    favorite_id,
  });

  reply.status(HTTP_STATUS.OK).send(result);
}
