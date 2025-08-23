import type { FastifyInstance } from 'fastify';
import { verifyJWT } from '@/http/middlewares/verifyJWT';
import { create } from './create-favorite';
import { getUserFavorites } from './get-user-favorites';

export function favoriteRoutes(app: FastifyInstance) {
  app.addHook('onRequest', verifyJWT);

  app.post('/favorite', create);
  app.get('/favorites', getUserFavorites);
}
