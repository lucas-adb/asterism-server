import type { FastifyReply, FastifyRequest } from 'fastify';
import { HTTP_STATUS } from '@/utils/status-code';

export async function refresh(request: FastifyRequest, reply: FastifyReply) {
  const refreshToken = request.cookies.refreshToken;

  if (!refreshToken) {
    return reply
      .status(HTTP_STATUS.UNAUTHORIZED)
      .send({ message: 'Invalid Refresh Token' });
  }

  try {
    await request.jwtVerify();
    const newToken = await reply.jwtSign(
      {},
      { sign: { sub: request.user.sub } }
    );
    return reply.send({ token: newToken });
  } catch {
    return reply
      .status(HTTP_STATUS.UNAUTHORIZED)
      .send({ message: 'Invalid Refresh Token' });
  }
}
