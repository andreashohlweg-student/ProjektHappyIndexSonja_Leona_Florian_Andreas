import { readFileSync } from 'node:fs';
import YAML from 'yaml';

export const openApiSource = readFileSync(new URL('./openapi.yaml', import.meta.url), 'utf8');
export const openApiDocument = YAML.parse(openApiSource) as Record<string, unknown>;
