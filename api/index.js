// Vercel serverless entry — wraps the Express app from backend/app.js.
// SQLite lives in /tmp on Vercel: writable, survives warm invocations,
// resets on cold starts (acceptable — analysis responses are self-contained).
if (!process.env.DATA_DIR) process.env.DATA_DIR = '/tmp';

const { app, ready } = require('../backend/app');

module.exports = async (req, res) => {
  await ready;
  return app(req, res);
};
