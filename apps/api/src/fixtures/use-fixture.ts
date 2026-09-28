import type { RepositoryResult } from '@happiness/contracts';
import { HttpError } from '../errors.js';
export function useFixture<T>(task: string, getData: () => T): RepositoryResult<T> {
  if (process.env.ENABLE_EXERCISE_FIXTURES === 'false') {
    throw new HttpError(501, 'NOT_IMPLEMENTED', `${task} ist noch nicht implementiert. Siehe ROADMAP.md.`);
  }
  return {data:getData(), source:'reference-data'};
}
