import type { Request, Response } from 'express';
import { HttpError } from '../middleware/error.middleware.js';
import { getRankingByYear } from './rankings.repository.js';

export async function getRankings(req: Request, res: Response) {
  const yearParam = req.query.year;

  if (typeof yearParam !== 'string' || !/^\d{4}$/.test(yearParam)) {
    throw new HttpError(400, 'Bitte ein vierstelliges Jahr als year angeben, z. B. ?year=2022');
  }

  const rankings = await getRankingByYear(Number(yearParam));
  res.json(rankings);
}
