import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {PGlite} from '@electric-sql/pglite';
import {countries,metadata,observations} from '../apps/api/src/fixtures/reference-data.js';
import {mapObservation,type ObservationRow} from '../apps/api/src/db/map-observation.js';

test('Datenherkunft und Erhaltung: Hash, Lücke, Alias, fehlende und negative Werte',()=>{
  const original=readFileSync(new URL('../data/raw/WHR26_Data_Figure_2.1.xlsx',import.meta.url));
  assert.equal(createHash('sha256').update(original).digest('hex'),metadata.sourceSha256);
  assert.equal(observations.length,2116);assert.equal(countries.length,167);
  assert.deepEqual(metadata.missingYears,[2013]);
  assert.equal(observations.filter(r=>r.sourceCountryName==='Swaziland').length,5);
  assert.ok(observations.filter(r=>r.sourceCountryName==='Swaziland').every(r=>r.countryId==='eswatini'));
  assert.ok(observations.some(r=>r.factors.residual!==null&&r.factors.residual<0));
  assert.equal(observations.filter(r=>r.factors.gdp===null).length,1097);
});

test('PostgreSQL-Engine: beide Init-Dateien, Migration und alle Datensätze stimmen überein',async()=>{
  // PGlite verwendet PostgreSQL in WASM. Es prüft SQL, ersetzt keinen Docker-Starttest.
  const db=new PGlite();
  try {
    for(const path of ['001_schema.sql','002_seed.sql'])await db.exec(readFileSync(new URL(`../db/init/${path}`,import.meta.url),'utf8'));
    await db.exec(readFileSync(new URL('../db/migrations/001_learning_index.sql',import.meta.url),'utf8'));
    const imported=await db.query<ObservationRow>('SELECT o.*, c.name AS country_name FROM observations o JOIN countries c ON c.id=o.country_id ORDER BY o.source_year,o.source_rank,o.country_id');
    assert.deepEqual(imported.rows.map(mapObservation),observations);
    assert.deepEqual((await db.query('SELECT ready FROM bootstrap_status')).rows,[{ready:true}]);
    await assert.rejects(db.query("INSERT INTO countries VALUES ('germany','Duplicate')"));
    await assert.rejects(db.query("UPDATE observations SET score=99 WHERE country_id='germany' AND source_year=2025"));
    await assert.rejects(db.query("UPDATE observations SET ci_lower=9 WHERE country_id='germany' AND source_year=2025"));
    assert.equal((await db.query('SELECT count(*) AS count FROM observations')).rows[0].count,2116);
  } finally {await db.close();}
});
