import { Router } from 'express';
import * as c from './happiness.controller.js';
export const routes=Router();
routes.get('/years',c.years);
routes.get('/countries',c.countries);
routes.get('/rankings',c.rankings);
routes.get('/countries/:countryId/history',c.history);
routes.get('/compare',c.comparison);
routes.get('/insights/trends',c.trends);
