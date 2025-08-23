import request from 'supertest';
import { afterAll, beforeAll, describe, expect, test } from 'vitest';
import { app } from '@/app';
import { HTTP_STATUS } from '@/utils/status-code';
import { getAuthToken } from './helpers/auth-helper';

describe('Remove Favorite e2e', () => {
  beforeAll(async () => {
    await app.ready();
  });

  afterAll(async () => {
    await app.close();
  });

  test('should remove favorite', async () => {
    const token = await getAuthToken();

    const favoriteData = {
      title: 'React Documentation',
      description: 'Official React documentation',
      url: 'https://react.dev',
      type: 'SITES',
      tags: ['react', 'javascript', 'frontend'],
    };

    const createResponse = await request(app.server)
      .post('/favorite')
      .set('Authorization', `Bearer ${token}`)
      .send(favoriteData);

    const deleteResponse = await request(app.server)
      .delete(`/favorite/${createResponse.body.favorite.id}`)
      .set('Authorization', `Bearer ${token}`);

    expect(deleteResponse.statusCode).toBe(HTTP_STATUS.NO_CONTENT);
    expect(deleteResponse.body).toEqual({});
  });
});
