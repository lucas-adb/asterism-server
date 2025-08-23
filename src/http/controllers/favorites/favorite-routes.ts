import type { FastifyInstance } from 'fastify';
import { verifyJWT } from '@/http/middlewares/verifyJWT';
import { create } from './create-favorite';
import { getUserFavorites } from './get-user-favorites';
import { remove } from './remove-favorite';

export function favoriteRoutes(app: FastifyInstance) {
  app.addHook('onRequest', verifyJWT);

  app.post('/favorite', create);
  app.delete('/favorite/:favorite_id', remove);
  app.get('/favorites', getUserFavorites);
}
