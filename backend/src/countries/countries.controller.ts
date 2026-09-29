import type { Request, Response } from 'express';
import { getAllCountries } from './countries.repository.js';

export async function getCountries(_req: Request, res: Response) {
  const countries = await getAllCountries();
  res.json(countries);
}
