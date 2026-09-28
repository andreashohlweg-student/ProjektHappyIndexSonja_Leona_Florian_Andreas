import pg from 'pg';
// NUMERIC-Aggregate kommen sonst als String an; der API-Vertrag verlangt Zahlen.
pg.types.setTypeParser(1700, Number);
export const pool = new pg.Pool({
  connectionString: process.env.DATABASE_URL ?? 'postgresql://happiness:happiness_local@localhost:5432/happiness',
  connectionTimeoutMillis: 3000, max: 5,
});
pool.on('error', error => console.error('PostgreSQL pool:', error.message));
