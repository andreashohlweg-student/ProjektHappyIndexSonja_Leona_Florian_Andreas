import express from 'express';
import rankingsRouter from './rankings/rankings.router.js';
import { handleError, notFound } from './middleware/error.middleware.js';

const app = express();
app.use(express.json());
app.use('/rankings', rankingsRouter);
app.use(notFound);
app.use(handleError);

export default app;
