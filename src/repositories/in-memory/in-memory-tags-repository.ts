import { randomUUID } from 'node:crypto';
import type { Prisma, Tag } from '@prisma/client';
import type { TagsRepository } from '../tags-repository';

export class InMemoryTagsRepository implements TagsRepository {
  protected items: Tag[] = [];

  async findByName(name: string): Promise<Tag | null> {
    const tag = await this.items.find((item) => item.name === name);

    if (!tag) {
      return null;
    }

    return tag;
  }

  async findManyByNames(names: string[]): Promise<Tag[]> {
    const tags = await this.items.filter((item) => names.includes(item.name));

    return tags;
  }

  async create(data: Prisma.TagCreateInput): Promise<Tag> {
    const now = new Date();

    const tag = {
      id: randomUUID(),
      name: data.name,
      created_at: now,
      updated_at: now,
    };

    await this.items.push(tag);

    return tag;
  }

  async createMany(data: Prisma.TagCreateManyInput[]): Promise<Tag[]> {
    const promises = data.map((item) => this.create(item));
    return await Promise.all(promises);
  }

  // Test helpers:
  getItemsCount(): number {
    return this.items.length;
  }

  getItems(): Tag[] {
    return this.items;
  }
}
