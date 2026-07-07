// Standalone server entry — used for local dev and the Docker image.
// The Express app and routes live in app.js so the Vercel serverless
// entry (api/index.js) can reuse them without starting a listener.

// Minimal .env loader (local dev only). Vercel injects env vars directly, so no
// dependency is needed there. Looks for a .env at the project root; never fails
// if it's absent. Only sets keys that aren't already in the environment.
(function loadDotEnv() {
  const fs = require('fs');
  const path = require('path');
  for (const p of [path.join(__dirname, '..', '.env'), path.join(__dirname, '.env')]) {
    try {
      const text = fs.readFileSync(p, 'utf8');
      for (const line of text.split('\n')) {
        const m = line.match(/^\s*([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*)\s*$/);
        if (!m) continue;
        const key = m[1];
        let val = m[2].trim();
        if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
          val = val.slice(1, -1);
        }
        if (val && process.env[key] === undefined) process.env[key] = val;
      }
    } catch { /* no .env here — fine */ }
  }
})();

const { app, ready, PORT } = require('./app');

ready
  .then(() => {
    app.listen(PORT, () => {
      console.log(`\n  Meera Insights Backend`);
      console.log(`  Running on http://localhost:${PORT}\n`);
    });
  })
  .catch(err => {
    console.error('Failed to start server:', err);
    process.exit(1);
  });
