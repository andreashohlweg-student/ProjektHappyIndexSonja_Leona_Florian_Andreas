import {test} from 'node:test';
import assert from 'node:assert/strict';
import request from 'supertest';
import {app} from '../apps/api/src/app.js';

const openEndpoints = [
  '/api/years', '/api/countries', '/api/rankings?year=2025',
  '/api/countries/germany/history', '/api/compare?countries=germany,finland&year=2025',
  '/api/insights/trends?from=2018&to=2025',
];

test('Offene Fachendpunkte liefern 501 statt Beispieldaten',async()=>{
  for (const url of openEndpoints) {
    const response = await request(app).get(url).expect(501);
    assert.equal(response.body.error.code,'NOT_IMPLEMENTED');
    assert.equal(response.body.data,undefined);
  }
});

test('Echte Metadaten bleiben verfügbar',async()=>{
  const response = await request(app).get('/api/meta').expect(200);
  assert.equal(response.body.data.rowCount,2116);
  assert.equal(response.body.meta.source,'source-file');
});

test('Ungültige Parameter und unbekannte Routen liefern klare Fehler',async()=>{
  for(const url of ['/api/rankings?year=2025&year=2024','/api/rankings?year=abc','/api/rankings?year=2025&limit=-1','/api/rankings?year=2025&order=DROP','/api/compare?countries=germany,germany&year=2025','/api/insights/trends?from=2025&to=2018']) {
    const response=await request(app).get(url).expect(400);
    assert.ok(response.body.error.code);
  }
  await request(app).get('/api/rankings?year=2013').expect(422);
  await request(app).get('/api/missing').expect(404);
});
