import { beforeEach, describe, expect, it } from 'vitest';
import { MAX_LIMIT } from '../../@types/pagination-types';
import { InMemoryFavoritesRepository } from '../../repositories/in-memory/in-memory-favorites-repository';
import { InMemoryUsersRepository } from '../../repositories/in-memory/in-memory-users-repository';
import { ResourceNotFoundError } from '../errors/resource-not-found-error';
import { GetUserFavoritesUseCase } from '../get-user-favorites-use-case';

let favoritesRepository: InMemoryFavoritesRepository;
let usersRepository: InMemoryUsersRepository;
let sut: GetUserFavoritesUseCase;

const TOTAL_FAVORITES_FOR_PAGINATION_TEST = 5;

describe('Get User Favorites Use Case', () => {
  beforeEach(() => {
    favoritesRepository = new InMemoryFavoritesRepository();
    usersRepository = new InMemoryUsersRepository();
    sut = new GetUserFavoritesUseCase(favoritesRepository, usersRepository);
  });

  it('should list user favorites successfully', async () => {
    // Arrange: Create user
    const user = await usersRepository.create({
      username: 'John Doe',
      email: 'john@example.com',
      password_hash: 'hashed-password',
    });

    // Arrange: Create favorites with explicit timing
    const favorite1 = await favoritesRepository.create({
      title: 'React Tutorial',
      description: 'Learn React basics',
      url: 'https://react.example.com',
      type: 'TUTORIALS',
      user_id: user.id,
    });

    // Ensure different timestamps
    await new Promise((resolve) => setTimeout(resolve, 10));

    const favorite2 = await favoritesRepository.create({
      title: 'Vue Guide',
      description: 'Vue.js documentation',
      url: 'https://vue.example.com',
      type: 'ARTICLES',
      user_id: user.id,
    });

    // Act
    const result = await sut.execute({
      user_id: user.id,
    });

    // Assert
    expect(result.favorites).toHaveLength(2);
    expect(result.favorites[0].id).toBe(favorite2.id); // Mais novo primeiro (desc)
    expect(result.favorites[1].id).toBe(favorite1.id);
    expect(result.pagination).toEqual({
      page: 1,
      limit: 10,
      total: 2,
      totalPages: 1,
      hasNextPage: false,
      hasPrevPage: false,
    });
  });

  it('should apply pagination correctly', async () => {
    // Arrange: Create user
    const user = await usersRepository.create({
      username: 'John Doe',
      email: 'john@example.com',
      password_hash: 'hashed-password',
    });

    // Arrange: Create 5 favorites with explicit timing
    const favoriteIds: string[] = [];
    for (let i = 1; i <= TOTAL_FAVORITES_FOR_PAGINATION_TEST; i++) {
      const favorite = await favoritesRepository.create({
        title: `Favorite ${i}`,
        description: `Description ${i}`,
        url: `https://example${i}.com`,
        type: 'ARTICLES',
        user_id: user.id,
      });
      favoriteIds.push(favorite.id);

      // Ensure different timestamps
      if (i < TOTAL_FAVORITES_FOR_PAGINATION_TEST) {
        await new Promise((resolve) => setTimeout(resolve, 10));
      }
    }

    // Act: Get page 2 with limit 2
    const result = await sut.execute({
      user_id: user.id,
      page: 2,
      limit: 2,
    });

    // Assert: Order should be desc (newest first)
    // Page 1: Favorite 5, Favorite 4
    // Page 2: Favorite 3, Favorite 2
    expect(result.favorites).toHaveLength(2);
    expect(result.favorites[0].title).toBe('Favorite 3');
    expect(result.favorites[1].title).toBe('Favorite 2');
    expect(result.pagination).toEqual({
      page: 2,
      limit: 2,
      total: 5,
      totalPages: 3,
      hasNextPage: true,
      hasPrevPage: true,
    });
  });

  it('should filter by type correctly', async () => {
    // Arrange: Create user
    const user = await usersRepository.create({
      username: 'John Doe',
      email: 'john@example.com',
      password_hash: 'hashed-password',
    });

    // Arrange: Create favorites of different types
    await favoritesRepository.create({
      title: 'React Tutorial',
      description: 'Learn React',
      url: 'https://react.example.com',
      type: 'TUTORIALS',
      user_id: user.id,
    });

    await favoritesRepository.create({
      title: 'Vue Article',
      description: 'Vue.js article',
      url: 'https://vue.example.com',
      type: 'ARTICLES',
      user_id: user.id,
    });

    await favoritesRepository.create({
      title: 'Angular Tutorial',
      description: 'Learn Angular',
      url: 'https://angular.example.com',
      type: 'TUTORIALS',
      user_id: user.id,
    });

    // Act: Filter by TUTORIALS
    const result = await sut.execute({
      user_id: user.id,
      type: 'TUTORIALS',
    });

    // Assert
    expect(result.favorites).toHaveLength(2);
    expect(result.favorites.every((fav) => fav.type === 'TUTORIALS')).toBe(
      true
    );
    expect(result.pagination.total).toBe(2);
  });

  it('should filter by tags using AND logic', async () => {
    // Arrange: Create user
    const user = await usersRepository.create({
      username: 'John Doe',
      email: 'john@example.com',
      password_hash: 'hashed-password',
    });

    // Arrange: Create favorites
    const favorite1 = await favoritesRepository.create({
      title: 'React Tutorial',
      description: 'Learn React with TypeScript',
      url: 'https://react.example.com',
      type: 'TUTORIALS',
      user_id: user.id,
    });

    const favorite2 = await favoritesRepository.create({
      title: 'Vue Guide',
      description: 'Vue.js with JavaScript',
      url: 'https://vue.example.com',
      type: 'ARTICLES',
      user_id: user.id,
    });

    const favorite3 = await favoritesRepository.create({
      title: 'TypeScript Basics',
      description: 'Learn TypeScript fundamentals',
      url: 'https://typescript.example.com',
      type: 'TUTORIALS',
      user_id: user.id,
    });

    // Arrange: Add tags
    favoritesRepository.addTagToFavorite(favorite1.id, 'react');
    favoritesRepository.addTagToFavorite(favorite1.id, 'typescript');

    favoritesRepository.addTagToFavorite(favorite2.id, 'vue');
    favoritesRepository.addTagToFavorite(favorite2.id, 'javascript');

    favoritesRepository.addTagToFavorite(favorite3.id, 'typescript');

    // Act: Filter by tags (AND - deve ter ambas)
    const result = await sut.execute({
      user_id: user.id,
      tags: ['react', 'typescript'],
    });

    // Assert: Apenas favorite1 tem ambas as tags
    expect(result.favorites).toHaveLength(1);
    expect(result.favorites[0].id).toBe(favorite1.id);
    expect(result.pagination.total).toBe(1);
  });

  it('should filter by query in title and description', async () => {
    // Arrange: Create user
    const user = await usersRepository.create({
      username: 'John Doe',
      email: 'john@example.com',
      password_hash: 'hashed-password',
    });

    // Arrange: Create favorites
    await favoritesRepository.create({
      title: 'React Tutorial',
      description: 'Learn React basics',
      url: 'https://react.example.com',
      type: 'TUTORIALS',
      user_id: user.id,
    });

    await favoritesRepository.create({
      title: 'Vue Guide',
      description: 'Complete guide for React developers',
      url: 'https://vue.example.com',
      type: 'ARTICLES',
      user_id: user.id,
    });

    await favoritesRepository.create({
      title: 'Angular Basics',
      description: 'Learn Angular fundamentals',
      url: 'https://angular.example.com',
      type: 'TUTORIALS',
      user_id: user.id,
    });

    // Act: Search for "react" (should match title and description)
    const result = await sut.execute({
      user_id: user.id,
      query: 'react',
    });

    // Assert: Should find both favorites (case-insensitive)
    expect(result.favorites).toHaveLength(2);
    expect(result.pagination.total).toBe(2);
  });

  it('should combine multiple filters', async () => {
    // Arrange: Create user
    const user = await usersRepository.create({
      username: 'John Doe',
      email: 'john@example.com',
      password_hash: 'hashed-password',
    });

    // Arrange: Create favorites
    const favorite1 = await favoritesRepository.create({
      title: 'React Tutorial',
      description: 'Learn React basics',
      url: 'https://react.example.com',
      type: 'TUTORIALS',
      user_id: user.id,
    });

    const favorite2 = await favoritesRepository.create({
      title: 'React Article',
      description: 'Advanced React concepts',
      url: 'https://react-advanced.example.com',
      type: 'ARTICLES',
      user_id: user.id,
    });

    const favorite3 = await favoritesRepository.create({
      title: 'Vue Tutorial',
      description: 'Learn Vue basics',
      url: 'https://vue.example.com',
      type: 'TUTORIALS',
      user_id: user.id,
    });

    // Arrange: Add tags
    favoritesRepository.addTagToFavorite(favorite1.id, 'react');
    favoritesRepository.addTagToFavorite(favorite1.id, 'beginner');

    favoritesRepository.addTagToFavorite(favorite2.id, 'react');
    favoritesRepository.addTagToFavorite(favorite2.id, 'advanced');

    favoritesRepository.addTagToFavorite(favorite3.id, 'vue');
    favoritesRepository.addTagToFavorite(favorite3.id, 'beginner');

    // Act: Multiple filters
    const result = await sut.execute({
      user_id: user.id,
      type: 'TUTORIALS',
      tags: ['react', 'beginner'],
      query: 'basics',
    });

    // Assert: Only favorite1 matches all criteria
    expect(result.favorites).toHaveLength(1);
    expect(result.favorites[0].id).toBe(favorite1.id);
    expect(result.pagination.total).toBe(1);
  });

  it('should return empty pagination when no results', async () => {
    // Arrange: Create user with no favorites
    const user = await usersRepository.create({
      username: 'John Doe',
      email: 'john@example.com',
      password_hash: 'hashed-password',
    });

    // Act
    const result = await sut.execute({
      user_id: user.id,
    });

    // Assert
    expect(result.favorites).toHaveLength(0);
    expect(result.pagination).toEqual({
      page: 1,
      limit: 10,
      total: 0,
      totalPages: 0,
      hasNextPage: false,
      hasPrevPage: false,
    });
  });

  it('should apply default values correctly', async () => {
    // Arrange: Create user
    const user = await usersRepository.create({
      username: 'John Doe',
      email: 'john@example.com',
      password_hash: 'hashed-password',
    });

    await favoritesRepository.create({
      title: 'Test Favorite',
      description: 'Test Description',
      url: 'https://test.example.com',
      type: 'ARTICLES',
      user_id: user.id,
    });

    // Act: No page/limit provided
    const result = await sut.execute({
      user_id: user.id,
    });

    // Assert: Should use defaults
    expect(result.pagination.page).toBe(1);
    expect(result.pagination.limit).toBe(10);
  });

  it('should validate pagination limits', async () => {
    // Arrange: Create user
    const user = await usersRepository.create({
      username: 'John Doe',
      email: 'john@example.com',
      password_hash: 'hashed-password',
    });

    await favoritesRepository.create({
      title: 'Test Favorite',
      description: 'Test Description',
      url: 'https://test.example.com',
      type: 'ARTICLES',
      user_id: user.id,
    });

    // Act: Invalid values
    const result = await sut.execute({
      user_id: user.id,
      page: 0, // Should be corrected to 1
      limit: 150, // Should be corrected to MAX_LIMIT (100)
    });

    // Assert: Should apply limits
    expect(result.pagination.page).toBe(1);
    expect(result.pagination.limit).toBe(MAX_LIMIT);
  });

  it('should sort by created_at desc by default', async () => {
    // Arrange: Create user
    const user = await usersRepository.create({
      username: 'John Doe',
      email: 'john@example.com',
      password_hash: 'hashed-password',
    });

    // Arrange: Create favorites with explicit timing
    const favorite1 = await favoritesRepository.create({
      title: 'First Favorite',
      description: 'First',
      url: 'https://first.example.com',
      type: 'ARTICLES',
      user_id: user.id,
    });

    // Ensure different timestamps
    await new Promise((resolve) => setTimeout(resolve, 10));

    const favorite2 = await favoritesRepository.create({
      title: 'Second Favorite',
      description: 'Second',
      url: 'https://second.example.com',
      type: 'ARTICLES',
      user_id: user.id,
    });

    // Act
    const result = await sut.execute({
      user_id: user.id,
    });

    // Assert: Newest first (desc)
    expect(result.favorites[0].id).toBe(favorite2.id);
    expect(result.favorites[1].id).toBe(favorite1.id);
  });

  it('should sort by created_at asc when specified', async () => {
    // Arrange: Create user
    const user = await usersRepository.create({
      username: 'John Doe',
      email: 'john@example.com',
      password_hash: 'hashed-password',
    });

    // Arrange: Create favorites with different timestamps
    const favorite1 = await favoritesRepository.create({
      title: 'First Favorite',
      description: 'First',
      url: 'https://first.example.com',
      type: 'ARTICLES',
      user_id: user.id,
    });

    await new Promise((resolve) => setTimeout(resolve, 10));

    const favorite2 = await favoritesRepository.create({
      title: 'Second Favorite',
      description: 'Second',
      url: 'https://second.example.com',
      type: 'ARTICLES',
      user_id: user.id,
    });

    // Act
    const result = await sut.execute({
      user_id: user.id,
      sortOrder: 'asc',
    });

    // Assert: Oldest first (asc)
    expect(result.favorites[0].id).toBe(favorite1.id);
    expect(result.favorites[1].id).toBe(favorite2.id);
  });

  it('should throw error when user does not exist', async () => {
    // Act & Assert
    await expect(
      sut.execute({
        user_id: 'non-existent-user-id',
      })
    ).rejects.toBeInstanceOf(ResourceNotFoundError);
  });

  it('should return empty list when page exceeds total pages', async () => {
    // Arrange: Create user
    const user = await usersRepository.create({
      username: 'John Doe',
      email: 'john@example.com',
      password_hash: 'hashed-password',
    });

    await favoritesRepository.create({
      title: 'Only Favorite',
      description: 'Only one',
      url: 'https://only.example.com',
      type: 'ARTICLES',
      user_id: user.id,
    });

    // Act: Request page 5 when there's only 1 page
    const result = await sut.execute({
      user_id: user.id,
      page: 5,
      limit: 10,
    });

    // Assert
    expect(result.favorites).toHaveLength(0);
    expect(result.pagination).toEqual({
      page: 5,
      limit: 10,
      total: 1,
      totalPages: 1,
      hasNextPage: false,
      hasPrevPage: true,
    });
  });

  it('should handle empty tags filter gracefully', async () => {
    // Arrange: Create user
    const user = await usersRepository.create({
      username: 'John Doe',
      email: 'john@example.com',
      password_hash: 'hashed-password',
    });

    const favorite = await favoritesRepository.create({
      title: 'Test Favorite',
      description: 'Test Description',
      url: 'https://test.example.com',
      type: 'ARTICLES',
      user_id: user.id,
    });

    // Act: Empty tags array should be ignored
    const result = await sut.execute({
      user_id: user.id,
      tags: [],
    });

    // Assert: Should return all favorites (tags filter ignored)
    expect(result.favorites).toHaveLength(1);
    expect(result.favorites[0].id).toBe(favorite.id);
  });

  it('should handle empty query filter gracefully', async () => {
    // Arrange: Create user
    const user = await usersRepository.create({
      username: 'John Doe',
      email: 'john@example.com',
      password_hash: 'hashed-password',
    });

    const favorite = await favoritesRepository.create({
      title: 'Test Favorite',
      description: 'Test Description',
      url: 'https://test.example.com',
      type: 'ARTICLES',
      user_id: user.id,
    });

    // Act: Empty/whitespace query should be ignored
    const result = await sut.execute({
      user_id: user.id,
      query: '   ',
    });

    // Assert: Should return all favorites (query filter ignored)
    expect(result.favorites).toHaveLength(1);
    expect(result.favorites[0].id).toBe(favorite.id);
  });
});
