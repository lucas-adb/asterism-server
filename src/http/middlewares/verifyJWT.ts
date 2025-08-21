import type { FastifyReply, FastifyRequest } from 'fastify';
import { HTTP_STATUS } from '@/utils/status-code';

export async function verifyJWT(request: FastifyRequest, reply: FastifyReply) {
  try {
    await request.jwtVerify();
  } catch (error) {
    return reply
      .status(HTTP_STATUS.UNAUTHORIZED)
      .send({ message: 'Unauthorized', error });
  }
}
