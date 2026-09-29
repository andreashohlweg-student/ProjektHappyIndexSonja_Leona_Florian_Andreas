import express from 'express';
import countriesRouter from './countries/countries.router.js';
import { handleError, notFound } from './middleware/error.middleware.js';

const app = express();
app.use(express.json());
app.use('/countries', countriesRouter);
app.use(notFound);
app.use(handleError);

export default app;
