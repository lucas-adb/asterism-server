export class UserUnauthorized extends Error {
  constructor() {
    super('User unauthorized');
  }
}
