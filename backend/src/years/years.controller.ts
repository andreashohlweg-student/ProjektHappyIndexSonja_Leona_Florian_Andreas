import type { Request, Response } from 'express';
import { getAvailableYears } from './years.repository.js';

export async function getYears(_req: Request, res: Response) {
  res.json(await getAvailableYears());
}
