import { beforeEach, describe, expect, it } from 'vitest';
import { InMemoryTagsRepository } from '@/repositories/in-memory/in-memory-tags-repository';
import { ManageTagsUseCase } from '../manage-tags';

let repository: InMemoryTagsRepository;
let sut: ManageTagsUseCase;

describe('Manage Tags', () => {
  beforeEach(() => {
    repository = new InMemoryTagsRepository();
    sut = new ManageTagsUseCase(repository);
  });

  it('should create all tags when none exist', async () => {
    const tagNames = ['music', 'jazz', 'history'];

    expect(repository.getItemsCount()).toBe(0);

    const result = await sut.execute({ tagNames });

    expect(result.tags).toHaveLength(tagNames.length);
    expect(repository.getItemsCount()).toBe(tagNames.length);

    expect(result.tags[0]).toEqual({
      id: expect.any(String),
      name: 'music',
      created_at: expect.any(Date),
      updated_at: expect.any(Date),
    });
  });

  it('should create tags without duplicates', async () => {
    const tagNames = ['music', 'jazz', 'history', 'jazz'];
    const tagNamesFiltered = [...new Set(tagNames)];
    const result = await sut.execute({ tagNames });

    expect(result.tags).toHaveLength(tagNamesFiltered.length);
    expect(repository.getItemsCount()).toBe(tagNamesFiltered.length);
  });

  it('should create new tags without removing existing ones', async () => {
    await repository.createMany([
      {
        name: 'miles',
      },
      {
        name: 'john',
      },
    ]);

    const tagNames = ['music', 'jazz', 'history'];

    const result = await sut.execute({ tagNames });

    expect(result.tags).toHaveLength(tagNames.length);
    expect(repository.getItemsCount()).toBe(tagNames.length + 2);
  });

  it('should normalize tag names', async () => {
    const tagNames = ['Miles Davis', ' jazz  ', ' ', 'Ba DUM Tss'];

    expect(repository.getItemsCount()).toBe(0);

    const result = await sut.execute({ tagNames });

    expect(result.tags).toHaveLength(tagNames.length - 1);
    expect(repository.getItemsCount()).toBe(tagNames.length - 1);

    const resultNames = result.tags.map((tag) => tag.name);
    expect(resultNames).toEqual(['miles davis', 'jazz', 'ba dum tss']);
  });

  it('should return empty array when input is empty', async () => {
    const result = await sut.execute({ tagNames: [] });

    expect(result.tags).toHaveLength(0);
    expect(repository.getItemsCount()).toBe(0);
  });
});
