// Standalone server entry — used for local dev and the Docker image.
// The Express app and routes live in app.js so the Vercel serverless
// entry (api/index.js) can reuse them without starting a listener.
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
