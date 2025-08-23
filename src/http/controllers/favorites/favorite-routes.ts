import type { FastifyInstance } from 'fastify';
import { verifyJWT } from '@/http/middlewares/verifyJWT';
import { create } from './create-favorite';
import { getUserFavoriteById } from './get-user-favorite-by-id';
import { getUserFavorites } from './get-user-favorites';
import { remove } from './remove-favorite';
import { update } from './update-favorite';

export function favoriteRoutes(app: FastifyInstance) {
  app.addHook('onRequest', verifyJWT);

  app.post('/favorite', create);
  app.delete('/favorite/:favorite_id', remove);
  app.get('/favorite/:favorite_id', getUserFavoriteById);
  app.put('/favorite/:favorite_id', update);
  app.get('/favorites', getUserFavorites);
}
