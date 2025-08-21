import type { Prisma, Tag } from '@prisma/client';
import type { TagsRepository } from '../tags-repository';

export class PrismaTagsRepository implements TagsRepository {
  findByName(name: string): Promise<Tag | null> {
    throw new Error('Method not implemented.');
  }
  findManyByNames(names: string[]): Promise<Tag[]> {
    throw new Error('Method not implemented.');
  }
  create(data: Prisma.TagCreateInput): Promise<Tag> {
    throw new Error('Method not implemented.');
  }
  createMany(data: Prisma.TagCreateManyInput[]): Promise<Tag[]> {
    throw new Error('Method not implemented.');
  }
}
