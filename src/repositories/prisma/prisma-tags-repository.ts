import type { Prisma, Tag } from '@prisma/client';
import { prisma } from '@/lib/prisma';
import type { TagsRepository } from '../tags-repository';

export class PrismaTagsRepository implements TagsRepository {
  async findByName(name: string): Promise<Tag | null> {
    const tag = await prisma.tag.findFirst({ where: { name } });

    return tag;
  }

  async findManyByNames(names: string[]): Promise<Tag[]> {
    const tags = await prisma.tag.findMany({
      where: {
        name: { in: names },
      },
    });

    return tags;
  }

  async create(data: Prisma.TagCreateInput): Promise<Tag> {
    const tag = await prisma.tag.create({ data });

    return tag;
  }

  async createMany(data: Prisma.TagCreateManyInput[]): Promise<Tag[]> {
    const tags = await prisma.tag.createManyAndReturn({ data });

    return tags;
  }
}
