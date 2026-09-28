import {readdir,readFile} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import pg from 'pg';
const client=new pg.Client({connectionString:process.env.DATABASE_URL ?? 'postgresql://happiness:happiness_local@localhost:5432/happiness'});
try {
  await client.connect();
  // Ein Runner zur Zeit; bereits angewandte Migrationen bleiben unverändert.
  await client.query('SELECT pg_advisory_lock(72813001)');
  const root=new URL('../db/migrations/',import.meta.url);
  const files=(await readdir(root)).filter(f=>/^\d+.*\.sql$/.test(f)).sort();
  for(const name of files) {
    const sql=await readFile(new URL(name,root),'utf8');
    const checksum=createHash('sha256').update(sql).digest('hex');
    const old=await client.query('SELECT checksum FROM schema_migrations WHERE name=$1',[name]);
    if(old.rowCount) {
      if(old.rows[0].checksum !== checksum) throw new Error(`${name} wurde nach der Anwendung geändert. Neue Migration anlegen.`);
      continue;
    }
    await client.query('BEGIN');
    try {
      await client.query(sql);
      await client.query('INSERT INTO schema_migrations(name,checksum) VALUES($1,$2)',[name,checksum]);
      await client.query('COMMIT');
      console.log(`Migration angewandt: ${name}`);
    } catch(error) { await client.query('ROLLBACK');throw error; }
  }
  console.log('Migrationen aktuell.');
} catch(error) { console.error(error);process.exitCode=1; }
finally { await client.end(); }
