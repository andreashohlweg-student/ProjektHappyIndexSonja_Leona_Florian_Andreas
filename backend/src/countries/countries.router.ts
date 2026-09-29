import { Router } from 'express';
import { getCountries } from './countries.controller.js';

const countriesRouter = Router();
countriesRouter.get('/', getCountries);

export default countriesRouter;
