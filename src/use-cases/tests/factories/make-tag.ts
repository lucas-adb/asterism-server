import { faker } from '@faker-js/faker';

export function makeTagName(override = '') {
  return override || faker.lorem.word();
}
