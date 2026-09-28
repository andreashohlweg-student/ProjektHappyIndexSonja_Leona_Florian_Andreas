import { test } from 'node:test';
import assert from 'node:assert/strict';
import { fileURLToPath } from 'node:url';
import SwaggerParser from '@apidevtools/swagger-parser';
import request from 'supertest';
import { app } from '../apps/api/src/app.js';

test('Swagger-Dokument beschreibt alle Frontend-Endpunkte und wird ausgeliefert', async () => {
  const path = fileURLToPath(new URL('../apps/api/src/http/openapi.yaml', import.meta.url));
  const spec = await SwaggerParser.validate(path);
  assert.equal(spec.openapi, '3.0.3');
  assert.deepEqual(Object.keys(spec.paths).sort(), [
    '/compare', '/countries', '/countries/{countryId}/history', '/health',
    '/insights/trends', '/meta', '/rankings', '/years',
  ].sort());
  for (const operation of Object.values(spec.paths)) {
    assert.ok(operation?.get?.responses?.['200'], 'Jeder Endpunkt braucht eine dokumentierte 200-Antwort.');
  }

  const json = await request(app).get('/api/openapi.json').expect(200);
  assert.deepEqual(Object.keys(json.body.paths).sort(), Object.keys(spec.paths).sort());
  await request(app).get('/api/openapi.yaml').expect(200).expect('Content-Type', /yaml/);
  const ui = await request(app).get('/api/docs/').expect(200);
  assert.match(ui.text, /swagger-ui/);
});
