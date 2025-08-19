import type { Tag } from '@prisma/client';
import type { TagsRepository } from '@/repositories/tags-repository';

type ManageTagsUseCaseRequest = {
  tagNames: string[];
};

type ManageTagsUseCaseResponse = {
  tags: Tag[];
};

export class ManageTagsUseCase {
  private readonly tagsRepository: TagsRepository;

  constructor(tagsRepository: TagsRepository) {
    this.tagsRepository = tagsRepository;
  }

  async execute({
    tagNames,
  }: ManageTagsUseCaseRequest): Promise<ManageTagsUseCaseResponse> {
    const normalizedTagNames = this.normalizeTagNames(tagNames);

    const existingTags =
      await this.tagsRepository.findManyByNames(normalizedTagNames);

    const existingTagNames = existingTags.map((tag) => tag.name);

    const tagsToCreate = normalizedTagNames.filter(
      (name) => !existingTagNames.includes(name)
    );

    const newTags =
      tagsToCreate.length > 0 ? await this.createNewTags(tagsToCreate) : [];

    const allTags = [...existingTags, ...newTags];

    return { tags: allTags };
  }

  private normalizeTagNames(tagNames: string[]): string[] {
    return tagNames
      .map((name) => name.trim().toLowerCase())
      .filter((name) => name.length > 0)
      .filter((name, index, arr) => arr.indexOf(name) === index);
  }

  private async createNewTags(tagNames: string[]): Promise<Tag[]> {
    const tagsData = tagNames.map((name) => ({ name }));
    return await this.tagsRepository.createMany(tagsData);
  }
}
