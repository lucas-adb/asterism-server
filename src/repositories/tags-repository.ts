import type { Prisma, Tag } from '@prisma/client';

export type TagsRepository = {
  findByName(name: string): Promise<Tag | null>;
  findManyByNames(names: string[]): Promise<Tag[]>;
  create(data: Prisma.TagCreateInput): Promise<Tag>;
  createMany(data: Prisma.TagCreateManyInput[]): Promise<Tag[]>;
};
