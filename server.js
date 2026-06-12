/**
 * =============================================================
 *  server.js — MLL Agro Industries | Backend Server
 * =============================================================
 *
 * Stack : Node.js + Express + better-sqlite3
 * Purpose:
 *   1. Serves all static HTML/CSS/JS files from this directory.
 *   2. Accepts POST /api/contact  — saves form submissions to
 *      the SQLite database.
 *   3. Accepts GET  /api/submissions — returns all submissions
 *      as JSON (used by admin.html dashboard).
 *   4. Accepts DELETE /api/submissions/:id — delete one record.
 *
 * Run:  node server.js
 * Port: 3000  (change PORT env var to override)
 * =============================================================
 */

const express  = require('express');
const cors     = require('cors');
const crypto   = require('crypto');
const path     = require('path');
const Database = require('better-sqlite3');

// ── App & DB setup ───────────────────────────────────────────
const app  = express();
const PORT = process.env.PORT || 3000;
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'change-this-password';
const DB_PATH = process.env.DB_PATH || path.join(__dirname, 'vansh_leads.db');
const adminSessions = new Set();
const SHORT_CACHE_SECONDS = 60 * 10;
const LONG_CACHE_SECONDS = 60 * 60 * 24 * 30;

// Open (or create) the SQLite database file
const db = new Database(DB_PATH);

// Create the submissions table if it doesn't exist yet
db.exec(`
  CREATE TABLE IF NOT EXISTS submissions (
    id           INTEGER PRIMARY KEY AUTOINCREMENT,
    full_name    TEXT    NOT NULL,
    phone        TEXT    NOT NULL,
    inquiry_type TEXT    NOT NULL,
    message      TEXT,
    submitted_at TEXT    NOT NULL DEFAULT (datetime('now','localtime'))
  )
`);

// ── Middleware ───────────────────────────────────────────────
app.disable('x-powered-by');
app.use(cors());                          // allow fetch from same origin
app.use(express.json());                  // parse JSON request bodies
app.use(express.static(__dirname, {
  etag: true,
  lastModified: true,
  setHeaders(res, filePath) {
    if (/(?:^|[\\/])sitemap\.xml$/i.test(filePath)) {
      res.type('application/xml');
      res.setHeader('Cache-Control', `public, max-age=${SHORT_CACHE_SECONDS}, must-revalidate`);
    } else if (/(?:^|[\\/])(?:favicon|apple-touch-icon|site\.webmanifest)/i.test(filePath)) {
      res.setHeader('Cache-Control', `public, max-age=${SHORT_CACHE_SECONDS}, must-revalidate`);
    } else if (/\.(?:png|jpe?g|webp|gif|svg|ico)$/i.test(filePath)) {
      res.setHeader('Cache-Control', `public, max-age=${LONG_CACHE_SECONDS}, immutable`);
    } else if (/\.(?:css|js|json|xml|txt)$/i.test(filePath)) {
      res.setHeader('Cache-Control', `public, max-age=${SHORT_CACHE_SECONDS}, must-revalidate`);
    }
  }
}));                                      // serve all static files (HTML/CSS/JS)

// ── Routes ───────────────────────────────────────────────────

app.get('/api/health', (req, res) => {
  res.json({ success: true, service: 'mllagroindustries', status: 'ok' });
});

app.post('/api/admin/login', (req, res) => {
  const { password } = req.body || {};

  if (password !== ADMIN_PASSWORD) {
    return res.status(401).json({ success: false, error: 'Invalid password.' });
  }

  const token = crypto.randomBytes(32).toString('hex');
  adminSessions.add(token);
  res.json({ success: true, token });
});

app.post('/api/admin/logout', requireAdmin, (req, res) => {
  adminSessions.delete(getBearerToken(req));
  res.json({ success: true });
});

/**
 * POST /api/contact
 * Body: { fullName, phone, inquiryType, message }
 * Validates fields then inserts into DB.
 * Returns: { success: true, id }
 */
app.post('/api/contact', (req, res) => {
  const { fullName, phone, inquiryType, message } = req.body;

  // Basic server-side validation
  if (!fullName || !fullName.trim()) {
    return res.status(400).json({ success: false, error: 'Full name is required.' });
  }
  if (!phone || !phone.trim()) {
    return res.status(400).json({ success: false, error: 'Phone number is required.' });
  }
  if (!inquiryType || !inquiryType.trim()) {
    return res.status(400).json({ success: false, error: 'Inquiry type is required.' });
  }

  try {
    const stmt = db.prepare(`
      INSERT INTO submissions (full_name, phone, inquiry_type, message)
      VALUES (?, ?, ?, ?)
    `);
    const result = stmt.run(
      fullName.trim(),
      phone.trim(),
      inquiryType.trim(),
      (message || '').trim()
    );

    console.log(`[DB] New submission #${result.lastInsertRowid} from ${fullName}`);
    res.json({ success: true, id: result.lastInsertRowid });

  } catch (err) {
    console.error('[DB] Insert error:', err);
    res.status(500).json({ success: false, error: 'Server error. Please try again.' });
  }
});

/**
 * GET /api/submissions
 * Returns all form submissions, newest first.
 * Protected by Authorization header.
 * Used by admin.html.
 */
app.get('/api/submissions', requireAdmin, (req, res) => {
  try {
    const rows = db.prepare(`
      SELECT * FROM submissions ORDER BY id DESC
    `).all();
    res.json({ success: true, count: rows.length, data: rows });
  } catch (err) {
    console.error('[DB] Query error:', err);
    res.status(500).json({ success: false, error: 'Server error.' });
  }
});

/**
 * DELETE /api/submissions/:id
 * Deletes a single submission by ID.
 * Protected by Authorization header.
 */
app.delete('/api/submissions/:id', requireAdmin, (req, res) => {
  try {
    const result = db.prepare('DELETE FROM submissions WHERE id = ?').run(req.params.id);
    if (result.changes === 0) {
      return res.status(404).json({ success: false, error: 'Record not found.' });
    }
    res.json({ success: true });
  } catch (err) {
    console.error('[DB] Delete error:', err);
    res.status(500).json({ success: false, error: 'Server error.' });
  }
});

function getBearerToken(req) {
  const header = req.headers.authorization || '';
  return header.startsWith('Bearer ') ? header.slice(7) : header;
}

function requireAdmin(req, res, next) {
  const token = getBearerToken(req);
  if (!token || !adminSessions.has(token)) {
    return res.status(401).json({ success: false, error: 'Unauthorized' });
  }
  next();
}

// ── Start server ─────────────────────────────────────────────
app.listen(PORT, '0.0.0.0', () => {
  console.log(`\n✅ MLL Agro Industries server is LIVE on your network!`);
  console.log(`   1. On THIS computer :  http://localhost:${PORT}`);
  console.log(`   2. On OTHER devices :  http://YOUR_COMPUTER_IP:${PORT}`);
  console.log(`\n   Admin panel :  http://localhost:${PORT}/admin.html`);
  console.log(`   Database    :  ${DB_PATH}`);
});
