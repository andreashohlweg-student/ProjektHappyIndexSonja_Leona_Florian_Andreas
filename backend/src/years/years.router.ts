import { Router } from 'express';
import { getYears } from './years.controller.js';

const yearsRouter = Router();
yearsRouter.get('/', getYears);

export default yearsRouter;
