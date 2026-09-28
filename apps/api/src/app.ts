import express from 'express';
import type { ErrorRequestHandler } from 'express';
import { routes } from './http/routes.js';
import { HttpError } from './errors.js';
import { pool } from './db/pool.js';
import { metadata } from './fixtures/reference-data.js';
export const app=express();
app.disable('x-powered-by');
app.use((_req,res,next)=>{res.setHeader('Cache-Control','no-store');next();});
app.get('/api/health',async (_req,res)=>{
  try {
    const result=await pool.query('SELECT ready FROM bootstrap_status WHERE id = 1');
    if (!result.rows[0]?.ready) throw new Error('Import incomplete');
    res.json({status:'ok',database:'ready',exerciseFixtures:process.env.ENABLE_EXERCISE_FIXTURES !== 'false'});
  } catch {
    res.status(503).json({status:'degraded',database:'unavailable'});
  }
});
app.get('/api/meta',(_req,res)=>res.json({data:metadata,meta:{source:'reference-data',sourceReportYear:2026,yearKind:'source-year'}}));
app.use('/api',routes);
app.use((_req,_res,next)=>next(new HttpError(404,'NOT_FOUND','Dieser Endpunkt existiert nicht.')));
const errorHandler: ErrorRequestHandler=(error,_req,res,_next)=>{
  if(error instanceof HttpError) {res.status(error.status).json({error:{code:error.code,message:error.message}});return;}
  console.error(error);
  res.status(500).json({error:{code:'INTERNAL_ERROR',message:'Die Anfrage konnte nicht verarbeitet werden.'}});
};
app.use(errorHandler);
