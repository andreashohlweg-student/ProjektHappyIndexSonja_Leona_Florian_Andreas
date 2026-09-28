import type { Request, Response } from 'express';
import type { RepositoryResult } from '@happiness/contracts';
import * as service from '../services/happiness.service.js';
import * as v from './validation.js';
import { HttpError } from '../errors.js';
function send<T>(res:Response, result:RepositoryResult<T>) {
  res.json({data:result.data,meta:{source:result.source,sourceReportYear:2026,yearKind:'source-year'}});
}
export const years = async (_req:Request,res:Response) => send(res,await service.getYears());
export const countries = async (_req:Request,res:Response) => send(res,await service.getCountries());
export const rankings = async (req:Request,res:Response) => {
  const order = v.text(req.query.order,'order','desc');
  if (order !== 'asc' && order !== 'desc') throw new HttpError(400,'INVALID_QUERY','order muss asc oder desc sein.');
  const q = v.text(req.query.q,'q','').trim();
  if (q.length > 100) throw new HttpError(400,'INVALID_QUERY','Die Suche darf höchstens 100 Zeichen enthalten.');
  send(res,await service.getRankings({year:v.year(req.query.year),q,order,
    limit:v.integer(req.query.limit,'limit',1,100,20),offset:v.integer(req.query.offset,'offset',0,10000,0)}));
};
export const history = async (req:Request,res:Response) => send(res,await service.getHistory(v.countryId(req.params.countryId)));
export const comparison = async (req:Request,res:Response) => {
  const ids = v.text(req.query.countries,'countries').split(',');
  if (ids.length !== 2 || ids[0] === ids[1]) throw new HttpError(400,'INVALID_QUERY','Genau zwei unterschiedliche Länder-IDs sind erforderlich.');
  send(res,await service.getComparison([v.countryId(ids[0]),v.countryId(ids[1])],v.year(req.query.year)));
};
export const trends = async (req:Request,res:Response) => {
  const from=v.year(req.query.from,'from'),to=v.year(req.query.to,'to');
  if (from >= to) throw new HttpError(400,'INVALID_RANGE','Das Startjahr muss vor dem Endjahr liegen.');
  send(res,await service.getTrends(from,to));
};
