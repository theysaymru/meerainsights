const express = require('express');
const cors = require('cors');
const { initDb } = require('./db');
const { analyzeReviews } = require('./analysis');

const app = express();
const PORT = process.env.PORT || 8090;
const MAX_INPUT_BYTES = 500 * 1024; // 500 KB

app.use(cors({
  origin: [/^http:\/\/localhost:\d+$/],
  methods: ['GET', 'POST', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type']
}));

app.use(express.json({ limit: '2mb' }));

let db;

// GET /api/health — used by the single-image smoke test through nginx
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' });
});

// POST /api/analyze
app.post('/api/analyze', (req, res) => {
  try {
    const { reviews } = req.body || {};

    if (!reviews || typeof reviews !== 'string' || reviews.trim().length === 0) {
      return res.status(400).json({ error: 'Reviews text is required and cannot be empty.' });
    }

    if (Buffer.byteLength(reviews, 'utf8') > MAX_INPUT_BYTES) {
      return res.status(413).json({
        error: 'Input too large (max 500KB). Please reduce the number of reviews and try again.'
      });
    }

    const batchResult = db.prepare('INSERT INTO review_batches (raw_reviews) VALUES (?)').run(reviews);
    const batchId = batchResult.lastInsertRowid;

    const analysisData = analyzeReviews(reviews);

    const analysisResult = db.prepare('INSERT INTO analyses (batch_id, analysis_json) VALUES (?, ?)').run(batchId, '{}');
    const analysisId = analysisResult.lastInsertRowid;

    const replyInsert = db.prepare(
      `INSERT INTO auto_replies (analysis_id, theme, complaint_pattern, affected_reviews_count, suggested_reply, status)
       VALUES (?, ?, ?, ?, ?, ?)`
    );

    const autoRepliesWithIds = analysisData.autoReplies.map(reply => {
      const r = replyInsert.run(
        analysisId,
        reply.theme,
        reply.complaintPattern,
        reply.affectedReviewsCount,
        reply.suggestedReply,
        'draft'
      );
      return { ...reply, id: Number(r.lastInsertRowid) };
    });

    const fullAnalysis = {
      id: Number(analysisId),
      ...analysisData,
      autoReplies: autoRepliesWithIds
    };

    db.prepare('UPDATE analyses SET analysis_json = ? WHERE id = ?')
      .run(JSON.stringify(fullAnalysis), analysisId);

    return res.json(fullAnalysis);
  } catch (err) {
    console.error('POST /api/analyze error:', err);
    return res.status(500).json({ error: 'Analysis failed. Please try again.' });
  }
});

function enrichWithFreshStatuses(analysis) {
  if (!analysis || !analysis.id) return analysis;
  const replies = db.prepare('SELECT id, status FROM auto_replies WHERE analysis_id = ?').all(analysis.id);
  const statusMap = {};
  replies.forEach(r => { statusMap[r.id] = r.status; });
  if (analysis.autoReplies) {
    analysis.autoReplies = analysis.autoReplies.map(r => ({
      ...r,
      status: statusMap[r.id] || r.status
    }));
  }
  return analysis;
}

// GET /api/analyses/latest
app.get('/api/analyses/latest', (req, res) => {
  try {
    const row = db.prepare('SELECT * FROM analyses ORDER BY id DESC LIMIT 1').get();
    if (!row) return res.json(null);
    return res.json(enrichWithFreshStatuses(JSON.parse(row.analysis_json)));
  } catch (err) {
    console.error('GET /api/analyses/latest error:', err);
    return res.status(500).json({ error: 'Failed to fetch latest analysis.' });
  }
});

// GET /api/analyses/history — last 8 analyses for trend view (must be before /:id)
app.get('/api/analyses/history', (req, res) => {
  try {
    const rows = db.prepare('SELECT id, analysis_json FROM analyses ORDER BY id DESC LIMIT 8').all();
    const history = rows.reverse().map(row => {
      try {
        const a = JSON.parse(row.analysis_json);
        return {
          id: a.id || row.id,
          totalReviews: a.totalReviews || 0,
          productCategory: a.productCategory || null,
          healthScore: a.healthScore ?? null,
          healthGrade: a.healthGrade ?? null,
          positive: a.overallSentiment?.positive ?? 0,
          neutral:  a.overallSentiment?.neutral  ?? 0,
          negative: a.overallSentiment?.negative ?? 0,
        };
      } catch { return null; }
    }).filter(Boolean);
    return res.json(history);
  } catch (err) {
    console.error('GET /api/analyses/history error:', err);
    return res.status(500).json({ error: 'Failed to fetch history.' });
  }
});

// GET /api/analyses/:id
app.get('/api/analyses/:id', (req, res) => {
  try {
    const row = db.prepare('SELECT * FROM analyses WHERE id = ?').get(req.params.id);
    if (!row) return res.status(404).json({ error: 'Analysis not found.' });
    return res.json(enrichWithFreshStatuses(JSON.parse(row.analysis_json)));
  } catch (err) {
    console.error('GET /api/analyses/:id error:', err);
    return res.status(500).json({ error: 'Failed to fetch analysis.' });
  }
});

// PATCH /api/auto-replies/:id/status
app.patch('/api/auto-replies/:id/status', (req, res) => {
  try {
    const { status } = req.body || {};
    const valid = ['draft', 'ready', 'copied'];
    if (!status || !valid.includes(status)) {
      return res.status(400).json({ error: 'Invalid status. Must be draft, ready, or copied.' });
    }
    const result = db.prepare('UPDATE auto_replies SET status = ? WHERE id = ?').run(status, req.params.id);
    if (result.changes === 0) return res.status(404).json({ error: 'Auto-reply not found.' });
    return res.json({ success: true, status });
  } catch (err) {
    console.error('PATCH /api/auto-replies/:id/status error:', err);
    return res.status(500).json({ error: 'Failed to update status.' });
  }
});

app.use((req, res) => res.status(404).json({ error: 'Route not found.' }));

// Resolves once the database is initialized. Both the standalone server
// (server.js) and the Vercel serverless entry (api/index.js) await this
// before handling requests.
const ready = initDb().then(d => { db = d; });

module.exports = { app, ready, PORT };
