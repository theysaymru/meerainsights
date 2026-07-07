const express = require('express');
const cors = require('cors');
const { initDb } = require('./db');
const { analyzeReviews, setSentimentOverride } = require('./analysis');

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

// ─── "Ask Meera" — optional AI layer ────────────────────────────────────────
// Additive on top of the deterministic engine. If no API key is configured, or
// the provider call fails, the rest of the app is unaffected — this endpoint
// simply reports that AI mode is unavailable. The key is read from the
// environment only (OPENAI_API_KEY) and is never committed or logged.

// AI provider config — points at the Buildathon Bifrost gateway by default
// (OpenAI-compatible /v1/chat/completions). All values env-overridable.
const AI_ENDPOINT = process.env.AI_ENDPOINT || 'https://gateway-buildathon.ltl.sh/v1/chat/completions';
const AI_MODEL = process.env.OPENAI_MODEL || 'gpt-4o';
const MAX_CONTEXT_CHARS = 14000; // cap reviews sent to the model to control token cost

// AI is used only where the gateway is reachable: a key is set AND we're not on
// Vercel (gateway blocks Vercel). Elsewhere the deterministic engine is used.
function aiEnabled() {
  return Boolean(process.env.OPENAI_API_KEY) && !(process.env.VERCEL || process.env.VERCEL_ENV);
}

// Classify each review's sentiment with the LLM for higher accuracy than keywords.
// Returns a Map(reviewText -> 'positive'|'negative'|'mixed'|'neutral'). Any review
// the AI can't label is simply left out → detectSentiment falls back to keywords.
// Never throws — returns whatever it managed (possibly empty) so analysis proceeds.
async function classifySentimentsAI(lines) {
  const map = new Map();
  if (!aiEnabled() || lines.length === 0) return map;

  const BATCH = 40;
  const system =
    'You classify Meesho customer reviews by sentiment. For each review output exactly one label: ' +
    'positive (satisfaction / good outcome), negative (problem, complaint, bad outcome), ' +
    'mixed (BOTH praise AND complaint in the same review), or neutral (ONLY a pure factual ' +
    'statement with zero opinion — rare). Judge by meaning, not keywords. Reviews may be ' +
    'code-mixed (Hinglish etc.): "paisa vasool"/"badhiya"=positive, "bekaar"/"ghatiya"/"bakwaas"=negative, ' +
    '"theek thaak"=mixed. Respond with ONLY a JSON array, no prose: ' +
    '[{"id":0,"sentiment":"positive"}, ...] covering every id.';

  for (let start = 0; start < lines.length; start += BATCH) {
    const batch = lines.slice(start, start + BATCH);
    const numbered = batch.map((t, i) => `${i}. ${t}`).join('\n');
    try {
      const resp = await fetch(AI_ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${process.env.OPENAI_API_KEY}` },
        body: JSON.stringify({
          model: AI_MODEL,
          temperature: 0,
          max_tokens: 1500,
          messages: [
            { role: 'system', content: system },
            { role: 'user', content: `Classify these ${batch.length} reviews:\n${numbered}` },
          ],
        }),
        signal: AbortSignal.timeout(20000),
      });
      if (!resp.ok) continue; // leave this batch to keyword fallback
      const data = await resp.json();
      let content = data?.choices?.[0]?.message?.content?.trim() || '';
      content = content.replace(/^```(?:json)?/i, '').replace(/```$/, '').trim();
      const jsonStart = content.indexOf('[');
      const jsonEnd = content.lastIndexOf(']');
      if (jsonStart === -1 || jsonEnd === -1) continue;
      const arr = JSON.parse(content.slice(jsonStart, jsonEnd + 1));
      for (const item of arr) {
        const idx = Number(item.id);
        const s = String(item.sentiment || '').toLowerCase();
        if (batch[idx] && ['positive', 'negative', 'mixed', 'neutral'].includes(s)) {
          map.set(batch[idx], s);
        }
      }
    } catch { /* batch failed — those reviews fall back to keyword logic */ }
  }
  return map;
}

// GET /api/ai-status — the chat bubble shows when a key is configured, EXCEPT on
// Vercel. The AI gateway is internal to the buildathon network and returns
// "Access Denied" to Vercel, so the chat can't work there — we hide it on Vercel
// (which sets the VERCEL env var automatically) to avoid a dead feature, while
// keeping it on the buildathon deployment where it belongs.
app.get('/api/ai-status', (req, res) => {
  const onVercel = Boolean(process.env.VERCEL || process.env.VERCEL_ENV);
  res.json({ enabled: Boolean(process.env.OPENAI_API_KEY) && !onVercel });
});

// Single swappable provider call. To move to Claude later, change only this function.
async function callLLM(question, contextText) {
  const key = process.env.OPENAI_API_KEY;
  if (!key) return { ok: false, error: 'AI mode is not configured on the server.' };

  const system =
    'You are Meera, a review-analysis assistant for Meesho sellers. ' +
    'Answer ONLY using the customer reviews provided below. Quote verbatim snippets in "quotes" as evidence. ' +
    'If the reviews do not cover the question, say so plainly — never invent facts, policies, or numbers. ' +
    'Reviews may be in English or romanized Hindi/other Indian languages; judge meaning, not keywords. ' +
    'Be concise and practical, like advice to a busy seller.';

  try {
    const resp = await fetch(AI_ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${key}` },
      body: JSON.stringify({
        model: AI_MODEL,
        temperature: 0.2,
        max_tokens: 500,
        messages: [
          { role: 'system', content: system },
          { role: 'user', content: `CUSTOMER REVIEWS:\n${contextText}\n\nQUESTION: ${question}` },
        ],
      }),
    });
    if (!resp.ok) {
      const detail = (await resp.text().catch(() => '')).replace(/\s+/g, ' ').trim().slice(0, 200);
      console.error('AI gateway error', resp.status, detail);
      return { ok: false, error: `AI gateway returned ${resp.status}${detail ? ' — ' + detail : ''}` };
    }
    const data = await resp.json();
    const answer = data?.choices?.[0]?.message?.content?.trim();
    if (!answer) return { ok: false, error: 'AI returned an empty response.' };
    return { ok: true, answer };
  } catch (err) {
    console.error('callLLM failed:', err.message);
    return { ok: false, error: 'Could not reach the AI provider.' };
  }
}

// POST /api/ask — { question, reviews? , analysisId? }
app.post('/api/ask', async (req, res) => {
  try {
    if (!process.env.OPENAI_API_KEY) {
      return res.status(503).json({ error: 'AI mode is not enabled on this server.' });
    }
    const { question, reviews, analysisId } = req.body || {};
    if (!question || typeof question !== 'string' || question.trim().length === 0) {
      return res.status(400).json({ error: 'A question is required.' });
    }

    // Ground the answer in the actual raw reviews: prefer inline text, else look
    // up the raw reviews stored for this analysis id.
    let contextText = typeof reviews === 'string' ? reviews : '';
    if (!contextText && analysisId) {
      const row = db.prepare(
        `SELECT rb.raw_reviews AS raw
         FROM analyses a JOIN review_batches rb ON rb.id = a.batch_id
         WHERE a.id = ?`
      ).get(analysisId);
      if (row && row.raw) contextText = row.raw;
    }
    if (!contextText) {
      return res.status(400).json({ error: 'No reviews available to answer from.' });
    }
    if (contextText.length > MAX_CONTEXT_CHARS) {
      contextText = contextText.slice(0, MAX_CONTEXT_CHARS) + '\n…(truncated)';
    }

    const result = await callLLM(question.trim(), contextText);
    if (!result.ok) return res.status(502).json({ error: result.error });
    return res.json({ answer: result.answer });
  } catch (err) {
    console.error('POST /api/ask error:', err);
    return res.status(500).json({ error: 'Ask Meera failed. Please try again.' });
  }
});

// POST /api/analyze
app.post('/api/analyze', async (req, res) => {
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

    // When the AI gateway is reachable, let the LLM classify sentiment for higher
    // accuracy; detectSentiment falls back to keywords for anything it doesn't label.
    // The same line-splitting as analyzeReviews so the override keys match.
    let overrideMap = null;
    if (aiEnabled()) {
      const lines = reviews.split('\n').map(l => l.trim()).filter(l => l.length > 5);
      try { overrideMap = await classifySentimentsAI(lines); } catch { overrideMap = null; }
    }

    let analysisData;
    setSentimentOverride(overrideMap);
    try {
      analysisData = analyzeReviews(reviews);
    } finally {
      setSentimentOverride(null); // never leak the override to the next request
    }
    analysisData.sentimentEngine = (overrideMap && overrideMap.size > 0) ? 'ai' : 'deterministic';

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
