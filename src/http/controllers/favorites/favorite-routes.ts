import type { FastifyInstance } from 'fastify';
import { verifyJWT } from '@/http/middlewares/verifyJWT';
import { create } from './create-favorite';

export function favoriteRoutes(app: FastifyInstance) {
  app.addHook('onRequest', verifyJWT);
  app.post('/favorite', create);
}
