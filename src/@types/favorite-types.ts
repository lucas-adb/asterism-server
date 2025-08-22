import type { Favorite, Tag } from '@prisma/client';

export type FavoriteWithTags = Favorite & { tags: Tag[] };
