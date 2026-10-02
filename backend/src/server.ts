import app from './app.js';

const port = Number(process.env.PORT);
app.listen(port, () => console.log(`Backend läuft auf Port ${port}`));
