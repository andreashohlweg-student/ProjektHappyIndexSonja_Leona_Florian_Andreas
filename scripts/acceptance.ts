/** Abnahme der Menschenlösung gegen die bekannten Referenzwerte.
 * Absichtlich unabhängig vom normalen Startertest. Im Starter schlägt sie mit 501 fehl.
 */
import assert from 'node:assert/strict';
import {isDeepStrictEqual} from 'node:util';
import {countries,metadata,expectedRanking,expectedHistory,expectedComparison,expectedTrends} from '../tests/expected-data.js';
const base=process.env.TEST_BASE_URL ?? 'http://localhost:3001';
function equivalent(actual:unknown,expected:unknown,path='data'):void {
  if(typeof actual==='number'&&typeof expected==='number') {
    assert.ok(Math.abs(actual-expected)<1e-9,`${path}: ${actual} != ${expected}`);return;
  }
  if(Array.isArray(expected)) {
    assert.ok(Array.isArray(actual),`${path} muss Array sein`);
    assert.equal(actual.length,expected.length,`${path}.length`);
    expected.forEach((v,i)=>equivalent(actual[i],v,`${path}[${i}]`));return;
  }
  if(expected&&typeof expected==='object') {
    assert.ok(actual&&typeof actual==='object',`${path} muss Objekt sein`);
    for(const [key,value] of Object.entries(expected))equivalent((actual as Record<string,unknown>)[key],value,`${path}.${key}`);
    return;
  }
  assert.ok(isDeepStrictEqual(actual,expected),`${path}: ${JSON.stringify(actual)} != ${JSON.stringify(expected)}`);
}
const cases:[string,unknown][]=[
  ['/years',{years:metadata.years,latest:2025}],
  ['/countries',{countries}],
  ['/rankings?year=2025&limit=15&offset=0&order=desc',expectedRanking({year:2025,limit:15,offset:0,order:'desc',q:''})],
  ['/rankings?year=2018&limit=20&offset=0&order=asc&q=germany',expectedRanking({year:2018,limit:20,offset:0,order:'asc',q:'germany'})],
  ['/rankings?year=2025&limit=20&offset=0&q=%25',expectedRanking({year:2025,limit:20,offset:0,order:'desc',q:'%'})],
  ['/countries/eswatini/history',expectedHistory('eswatini')],
  ['/countries/germany/history',expectedHistory('germany')],
  ['/compare?countries=germany,finland&year=2025',expectedComparison(['germany','finland'],2025)],
  ['/compare?countries=angola,germany&year=2025',expectedComparison(['angola','germany'],2025)],
  ['/insights/trends?from=2018&to=2025',expectedTrends(2018,2025)],
];
let failed=0;
for(const [path,expected] of cases) {
  try {
    const response=await fetch(`${base}/api${path}`);
    const body=await response.json();
    assert.equal(response.status,200,JSON.stringify(body));
    assert.equal(body.meta.source,'postgres','Endpunkt muss aus PostgreSQL antworten');
    // PostgreSQL-Collation darf den Alphabetvergleich akzentuierter Namen anders sortieren.
    if(path==='/countries') {body.data.countries.sort((a:{id:string},b:{id:string})=>a.id.localeCompare(b.id));(expected as {countries:typeof countries}).countries=[...countries].sort((a,b)=>a.id.localeCompare(b.id));}
    equivalent(body.data,expected);console.log(`PASS ${path}`);
  }catch(error){failed++;console.error(`FAIL ${path}: ${error instanceof Error?error.message:error}`);}
}
for(const [path,status] of [['/rankings?year=2013',422],['/countries/atlantis/history',404],['/compare?countries=germany,germany&year=2025',400]] as const) {
  const response=await fetch(`${base}/api${path}`);if(response.status!==status){failed++;console.error(`FAIL ${path}: HTTP ${response.status}`);}else console.log(`PASS ${path} -> ${status}`);
}
if(failed){console.error(`${failed} Abnahmepunkte offen.`);process.exitCode=1;}else console.log('Alle fachlichen Abnahmepunkte bestanden. SQL-Herkunft zusätzlich im Code-Review prüfen.');
