import request from 'supertest';
import { afterAll, beforeAll, describe, expect, test } from 'vitest';
import { app } from '@/app';
import { HTTP_STATUS } from '@/utils/status-code';
import { getAuthToken } from './helpers/auth-helper';

describe('Create Favorite e2e', () => {
  beforeAll(async () => {
    await app.ready();
  });

  afterAll(async () => {
    await app.close();
  });

  test('should update favorite with new data and tags', async () => {
    const token = await getAuthToken();

    const favoriteData = {
      title: 'React Documentation',
      description: 'Official React documentation',
      url: 'https://react.dev',
      type: 'SITES',
      tags: ['react', 'javascript', 'frontend'],
    };

    const CreateResponse = await request(app.server)
      .post('/favorite')
      .set('Authorization', `Bearer ${token}`)
      .send(favoriteData);

    const newFavoriteData = {
      title: 'Vue Guide',
      description: 'Learning Vue',
      url: 'https://vue.example.com',
      type: 'TUTORIALS',
      tags: ['vue', 'typescript'],
    };

    const updateResponse = await request(app.server)
      .put(`/favorite/${CreateResponse.body.favorite.id}`)
      .set('Authorization', `Bearer ${token}`)
      .send(newFavoriteData);

    expect(updateResponse.statusCode).toBe(HTTP_STATUS.OK);

    expect(updateResponse.body).toEqual({
      favorite: expect.objectContaining({
        id: expect.any(String),
        title: 'Vue Guide',
      }),
      tags: expect.arrayContaining([
        expect.objectContaining({ name: 'vue' }),
        expect.objectContaining({ name: 'typescript' }),
      ]),
    });
  });
});
