import { app } from './app.js';
import { pool } from './db/pool.js';
const port = Number(process.env.PORT ?? 3001);
const server = app.listen(port,'0.0.0.0',()=>console.log(`Happiness API: http://localhost:${port}/api/health`));
for (const signal of ['SIGTERM','SIGINT'] as const) {
  process.once(signal,()=>server.close(()=>{void pool.end().finally(()=>process.exit(0));}));
}
