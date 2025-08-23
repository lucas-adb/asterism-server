import { FavoriteType } from '@prisma/client';
import type { FastifyReply, FastifyRequest } from 'fastify';
import z from 'zod';
import { makeUpdateFavoriteWithTagsUseCase } from '@/factories/make-update-favorite-with-tags-use-case';
import { HTTP_STATUS } from '@/utils/status-code';

export async function update(request: FastifyRequest, reply: FastifyReply) {
  const minLength = 2;

  const bodySchema = z.object({
    title: z.string().min(minLength),
    description: z.string().min(minLength),
    url: z.url().min(minLength),
    type: z.enum(FavoriteType),
    tags: z.array(z.string()),
  });

  const { title, description, url, type, tags } = bodySchema.parse(
    request.body
  );

  const paramsSchema = z.object({
    favorite_id: z.uuid(),
  });

  const { favorite_id } = paramsSchema.parse(request.params);

  const useCase = makeUpdateFavoriteWithTagsUseCase();

  const favorite = await useCase.execute({
    favorite_id,
    title,
    description,
    url,
    type,
    tags,
    user_id: request.user.sub,
  });

  reply.status(HTTP_STATUS.OK).send(favorite);
}
