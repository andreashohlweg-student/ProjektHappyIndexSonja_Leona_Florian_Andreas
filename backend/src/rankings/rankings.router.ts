import { Router } from 'express';
import { getRankings } from './rankings.controller.js';

const rankingsRouter = Router();
rankingsRouter.get('/', getRankings);

export default rankingsRouter;
