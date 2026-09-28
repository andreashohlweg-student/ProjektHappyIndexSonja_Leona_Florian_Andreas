import {test} from 'node:test';
import assert from 'node:assert/strict';
import request from 'supertest';
import {app} from '../apps/api/src/app.js';
import {useFixture} from '../apps/api/src/fixtures/use-fixture.js';
import {HttpError} from '../apps/api/src/errors.js';

test('API-Vertrag: Katalog, Ranking, Suche, Pagination und Sortierung',async()=>{
  const catalog=await request(app).get('/api/countries').expect(200);
  assert.equal(catalog.body.data.countries.length,167);
  const years=await request(app).get('/api/years').expect(200);
  assert.equal(years.body.data.latest,2025);assert.ok(!years.body.data.years.includes(2013));
  const rank=await request(app).get('/api/rankings?year=2025&limit=2').expect(200);
  assert.ok(['reference-data','postgres'].includes(rank.body.meta.source));assert.equal(rank.body.data.rows.length,2);
  assert.equal(rank.body.data.rows[0].countryId,'finland');assert.equal(rank.body.data.rows[0].score,7.764);
  assert.equal(rank.body.data.total,147);
  const search=await request(app).get('/api/rankings?year=2025&q=germany').expect(200);
  assert.equal(search.body.data.total,1);assert.equal(search.body.data.summary.count,147);
  const second=await request(app).get('/api/rankings?year=2025&limit=1&offset=1').expect(200);
  assert.equal(second.body.data.rows[0].countryId,'iceland');
  const reverse=await request(app).get('/api/rankings?year=2025&order=asc&limit=1').expect(200);
  assert.equal(reverse.body.data.rows[0].countryId,'afghanistan');
  const empty=await request(app).get('/api/rankings?year=2025&q=xyz-no-country').expect(200);
  assert.equal(empty.body.data.rows.length,0);assert.equal(empty.body.data.total,0);
});
test('API-Vertrag: Verlauf, fehlendes Länderjahr und vergleichbare Länder',async()=>{
  const history=await request(app).get('/api/countries/germany/history').expect(200);
  assert.equal(history.body.data.country.id,'germany');
  assert.ok(!history.body.data.observations.some((r:{year:number})=>r.year===2013));
  const cmp=await request(app).get('/api/compare?countries=germany,finland&year=2025').expect(200);
  assert.deepEqual(cmp.body.data.countries.map((c:{id:string})=>c.id),['germany','finland']);
  assert.equal(cmp.body.data.scoreDifference,cmp.body.data.observations[0].score-cmp.body.data.observations[1].score);
  const missing=await request(app).get('/api/compare?countries=angola,germany&year=2025').expect(200);
  assert.equal(missing.body.data.observations[0],null);assert.equal(missing.body.data.scoreDifference,null);
  const trends=await request(app).get('/api/insights/trends?from=2018&to=2025').expect(200);
  assert.ok(trends.body.data.rows.length>100);
  assert.ok(trends.body.data.rows.every((r:{fromScore:number;toScore:number;change:number})=>Math.abs(r.change-(r.toScore-r.fromScore))<1e-10));
});
test('Ungültige Eingaben und unbekannte Ressourcen liefern dokumentierte Fehler',async()=>{
  for(const url of ['/api/rankings?year=2025&year=2024','/api/rankings?year=abc','/api/rankings?year=2025&limit=-1','/api/rankings?year=2025&order=DROP','/api/compare?countries=germany,germany&year=2025','/api/insights/trends?from=2025&to=2018']) {
    const r=await request(app).get(url).expect(400);assert.ok(r.body.error.code);
  }
  await request(app).get('/api/rankings?year=2013').expect(422);
  await request(app).get('/api/countries/atlantis/history').expect(404);
  await request(app).get('/api/missing').expect(404);
  const injection=await request(app).get('/api/rankings').query({year:2025,q:"' OR 1=1 --"}).expect(200);
  assert.equal(injection.body.data.total,0);
});
test('Prüfmodus blockiert den Referenzadapter mit 501',()=>{
  process.env.ENABLE_EXERCISE_FIXTURES='false';
  try {
    assert.throws(()=>useFixture('Testaufgabe',()=>({value:1})),(e:unknown)=>e instanceof HttpError&&e.status===501);
  }finally{delete process.env.ENABLE_EXERCISE_FIXTURES;}
});
