import { readFileSync } from 'node:fs';
import type { DatasetMetadata } from '@happiness/contracts';

export const metadata: DatasetMetadata = JSON.parse(
  readFileSync(new URL('../../../../data/clean/metadata.json', import.meta.url), 'utf8')
);
