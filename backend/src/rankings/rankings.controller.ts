import type { Request, Response } from 'express';
import { getRankingByYear } from './rankings.repository.js';

export async function getRankings(req: Request, res: Response) {
  const year = Number(req.query.year);

  if (!Number.isInteger(year) || !req.query.year) {
    res.status(400).json({ error: 'Bitte ein Jahr als year angeben, z. B. ?year=2022' });
    return;
  }

  const rankings = await getRankingByYear(year);
  res.json(rankings);
}
