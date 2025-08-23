import request from 'supertest';
import { afterAll, beforeAll, describe, expect, test } from 'vitest';
import { app } from '@/app';
import { HTTP_STATUS } from '@/utils/status-code';
import { getAuthToken } from './helpers/auth-helper';

describe('Get User Favorite By Id e2e', () => {
  beforeAll(async () => {
    await app.ready();
  });

  afterAll(async () => {
    await app.close();
  });

  test('should find existing favorite', async () => {
    const token = await getAuthToken();

    const favoriteData1 = {
      title: 'React Tutorial',
      description: 'Learn React basics',
      url: 'https://react.example.com',
      type: 'TUTORIALS',
      tags: ['react', 'javascript'],
    };

    const favoriteCreated = await request(app.server)
      .post('/favorite')
      .set('Authorization', `Bearer ${token}`)
      .send(favoriteData1);

    const response = await request(app.server)
      .get(`/favorite/${favoriteCreated.body.favorite.id}`)
      .set('Authorization', `Bearer ${token}`);

    expect(response.statusCode).toBe(HTTP_STATUS.OK);

    expect(response.body).toEqual({
      favorite: expect.objectContaining({
        id: expect.any(String),
        title: favoriteData1.title,
        description: favoriteData1.description,
        url: favoriteData1.url,
        type: favoriteData1.type,
        tags: expect.arrayContaining([
          expect.objectContaining({ name: 'react' }),
          expect.objectContaining({ name: 'javascript' }),
        ]),
      }),
    });
  });
});
