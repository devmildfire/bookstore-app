import { Pagination } from '@/types/api';
import { Item } from '@/types/common';

export type Generator<T extends Item> = (id: number) => T;

export type EndGenerateFn = (currentId: number) => boolean;

const standardIsEnd: EndGenerateFn = () => false;

export interface GenerateItemsOptions<T extends Item> {
  readonly pagination: Required<Pagination>;
  readonly generator: Generator<T>;
  readonly isEnd?: EndGenerateFn;
}

export const generateItems = <T extends Item>(
  options: GenerateItemsOptions<T>,
): T[] => {
  const {
    generator,
    pagination: { count, page },
    isEnd = standardIsEnd,
  } = options;
  const items: T[] = [];

  for (let id = count * (page - 1) + 1; id <= count * page; id += 1) {
    if (isEnd(id)) {
      break;
    }

    items.push(generator(id));
  }
  return items;
};
