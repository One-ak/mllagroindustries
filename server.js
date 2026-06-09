/**
 * =============================================================
 *  server.js — Vansh Feeds | Backend Server
 * =============================================================
 *
 * Stack : Node.js + Express + better-sqlite3
 * Purpose:
 *   1. Serves all static HTML/CSS/JS files from this directory.
 *   2. Accepts POST /api/contact  — saves form submissions to
 *      the SQLite database (vansh_leads.db).
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
const path     = require('path');
const Database = require('better-sqlite3');

// ── App & DB setup ───────────────────────────────────────────
const app  = express();
const PORT = process.env.PORT || 3000;

// Open (or create) the SQLite database file
const db = new Database(path.join(__dirname, 'vansh_leads.db'));

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
app.use(cors());                          // allow fetch from same origin
app.use(express.json());                  // parse JSON request bodies
app.use(express.static(__dirname));       // serve all static files (HTML/CSS/JS)

// ── Routes ───────────────────────────────────────────────────

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
app.get('/api/submissions', (req, res) => {
  if (req.headers.authorization !== 'vansh@admin2026') {
    return res.status(401).json({ success: false, error: 'Unauthorized' });
  }
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
app.delete('/api/submissions/:id', (req, res) => {
  if (req.headers.authorization !== 'vansh@admin2026') {
    return res.status(401).json({ success: false, error: 'Unauthorized' });
  }
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

// ── Start server ─────────────────────────────────────────────
app.listen(PORT, '0.0.0.0', () => {
  console.log(`\n✅ Vansh Feeds server is LIVE on your network!`);
  console.log(`   1. On THIS computer :  http://localhost:${PORT}`);
  console.log(`   2. On OTHER devices :  http://YOUR_COMPUTER_IP:${PORT}`);
  console.log(`\n   Admin panel :  http://localhost:${PORT}/admin.html`);
});
