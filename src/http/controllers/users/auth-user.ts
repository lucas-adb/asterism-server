import type { FastifyReply, FastifyRequest } from 'fastify';
import z from 'zod';
import { makeAuthUserUseCase } from '@/factories/make-auth-user-user-case';
import { InvalidCredentialsError } from '@/use-cases/errors/invalid-credentials-error';
import { HTTP_STATUS } from '@/utils/status-code';

export async function auth(request: FastifyRequest, reply: FastifyReply) {
  const bodySchema = z.object({
    email: z.email(),
    password: z.string(),
  });

  const { email, password } = bodySchema.parse(request.body);

  try {
    const useCase = makeAuthUserUseCase();
    const { user } = await useCase.execute({ email, password });

    const token = await reply.jwtSign({}, { sign: { sub: user.id } });

    const refreshToken = await reply.jwtSign(
      {},
      { sign: { sub: user.id, expiresIn: '7d' } }
    );

    reply
      .setCookie('refreshToken', refreshToken, {
        path: '/',
        secure: true,
        sameSite: 'none',
        httpOnly: true,
      })
      .status(HTTP_STATUS.OK)
      .send({
        token,
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
        },
      });
  } catch (error) {
    if (error instanceof InvalidCredentialsError) {
      return reply.status(HTTP_STATUS.BAD_REQUEST).send({
        message: error.message,
      });
    }

    throw error;
  }
}
