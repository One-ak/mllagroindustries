/**
 * MLL Agro Industries website and lead API.
 *
 * Production configuration:
 *   ADMIN_PASSWORD  Optional at startup. Admin access stays disabled until a
 *                   unique value of at least 14 characters is configured.
 *   DB_PATH         Optional SQLite path. Defaults to .data/vansh_leads.db.
 *   CAREER_UPLOADS_PATH Optional private directory for uploaded CVs. Defaults
 *                   to .data/career-resumes beside the database.
 *   ALLOWED_ORIGINS Optional comma-separated development origins.
 *   TRUST_PROXY     Set to 1 only when deployed behind one trusted proxy.
 */

const express = require('express');
const cors = require('cors');
const crypto = require('crypto');
const fs = require('fs');
const path = require('path');

let Database = null;
let databaseLoadError = null;
let multer = null;
let multerLoadError = null;

try {
  Database = require('better-sqlite3');
} catch (error) {
  databaseLoadError = error;
}

try {
  multer = require('multer');
} catch (error) {
  multerLoadError = error;
}

const app = express();
const PORT = Number(process.env.PORT) || 3000;
const NODE_ENV = process.env.NODE_ENV || 'development';
const ADMIN_PASSWORD = String(process.env.ADMIN_PASSWORD || '');
const ADMIN_ENABLED = ADMIN_PASSWORD.length >= 14 && ADMIN_PASSWORD !== 'change-this-password';
const ADMIN_SESSION_TTL_MS = 8 * 60 * 60 * 1000;
const SHORT_CACHE_SECONDS = 60 * 10;
const LONG_CACHE_SECONDS = 60 * 60 * 24 * 30;
const DEFAULT_DB_PATH = path.join(__dirname, '.data', 'vansh_leads.db');
const DB_PATH = process.env.DB_PATH === ':memory:'
  ? ':memory:'
  : (process.env.DB_PATH ? path.resolve(process.env.DB_PATH) : DEFAULT_DB_PATH);
const UPLOADS_PATH = process.env.CAREER_UPLOADS_PATH
  ? path.resolve(process.env.CAREER_UPLOADS_PATH)
  : path.join(DB_PATH === ':memory:' ? path.join(__dirname, '.data') : path.dirname(DB_PATH), 'career-resumes');
const RESUME_MAX_BYTES = 5 * 1024 * 1024;
const RESUME_EXTENSIONS = new Set(['.pdf', '.doc', '.docx']);
const CAREER_EXPERIENCE_OPTIONS = new Set(['Fresher', '0-1 years', '1-3 years', '3-5 years', '5-8 years', '8+ years']);
const CAREER_NOTICE_PERIODS = new Set(['Available immediately', '15 days', '30 days', '60 days', '90 days', 'More than 90 days']);
const adminSessions = new Map();

const PUBLIC_ROOT_FILES = new Set([
  'index.html',
  'about.html',
  'admin.html',
  'agricultural-inputs-manufacturer.html',
  'bio-fertilizer-manufacturer-india.html',
  'business.html',
  'career.html',
  'cattle-feed-manufacturer-uttar-pradesh.html',
  'contact.html',
  'fertilizer-manufacturer-uttar-pradesh.html',
  'fish-feed-manufacturer-uttar-pradesh.html',
  'grievance.html',
  'infrastructure.html',
  'pesticide-manufacturer-uttar-pradesh.html',
  'privacy.html',
  'product-detail.html',
  'products.html',
  'quality.html',
  'vendor.html',
  'apple-touch-icon.png',
  'favicon-48x48.png',
  'favicon-96x96.png',
  'favicon-safari.ico',
  'favicon.ico',
  'robots.txt',
  'site.webmanifest',
  'sitemap.xml',
  'google1d414cec827e1c2e.html'
]);
const PUBLIC_DIRECTORIES = new Set(['assets', 'css', 'js', 'social']);
const ALLOWED_INQUIRY_TYPES = new Set([
  'Distributorship Inquiry',
  'Product Information',
  'Grievance Redressal',
  'Export Inquiry',
  'Vendor Registration'
]);
const developmentOrigins = [
  'http://localhost:4177',
  'http://127.0.0.1:4177'
];
const configuredOrigins = String(process.env.ALLOWED_ORIGINS || '')
  .split(',')
  .map(value => value.trim())
  .filter(Boolean);
const allowedOrigins = new Set(
  configuredOrigins.length || NODE_ENV === 'production' ? configuredOrigins : developmentOrigins
);

let db = null;
let databaseStartupError = databaseLoadError;
let resumeUpload = null;
let uploadStartupError = multerLoadError;

try {
  if (!Database) throw databaseLoadError || new Error('SQLite driver is unavailable.');

  if (DB_PATH !== ':memory:') {
    fs.mkdirSync(path.dirname(DB_PATH), { recursive: true, mode: 0o700 });
    migrateLegacyDatabase();
  }

  db = new Database(DB_PATH);
  db.pragma('journal_mode = WAL');
  db.pragma('busy_timeout = 5000');
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
  db.exec(`
    CREATE TABLE IF NOT EXISTS career_applications (
      id                   INTEGER PRIMARY KEY AUTOINCREMENT,
      full_name            TEXT    NOT NULL,
      email                TEXT    NOT NULL,
      phone                TEXT    NOT NULL,
      position             TEXT    NOT NULL,
      experience           TEXT    NOT NULL,
      location             TEXT    NOT NULL,
      education            TEXT    NOT NULL,
      current_company      TEXT,
      skills               TEXT,
      notice_period        TEXT,
      cover_letter         TEXT,
      resume_stored_name   TEXT    NOT NULL,
      resume_original_name TEXT    NOT NULL,
      resume_size          INTEGER NOT NULL,
      submitted_at         TEXT    NOT NULL DEFAULT (datetime('now','localtime'))
    )
  `);
  databaseStartupError = null;
} catch (error) {
  databaseStartupError = error;
  db = null;
  console.error('[DB] Database features disabled:', error.message);
}

try {
  if (!multer) throw multerLoadError || new Error('File upload support is unavailable.');
  if (db) {
    fs.mkdirSync(UPLOADS_PATH, { recursive: true, mode: 0o700 });
    resumeUpload = createResumeUpload();
    uploadStartupError = null;
  }
} catch (error) {
  uploadStartupError = error;
  resumeUpload = null;
  console.error('[UPLOAD] Career resume uploads disabled:', error.message);
}

if (!ADMIN_ENABLED) {
  console.warn('[ADMIN] Admin access disabled: configure ADMIN_PASSWORD with at least 14 characters.');
}

app.disable('x-powered-by');
app.set('trust proxy', process.env.TRUST_PROXY === '1' ? 1 : false);
app.use(securityHeaders);
app.use(createCorsMiddleware());
app.use(express.json({ limit: '16kb', strict: true }));

const adminLoginLimiter = createRateLimiter({ windowMs: 15 * 60 * 1000, max: 5 });
const contactLimiter = createRateLimiter({ windowMs: 10 * 60 * 1000, max: 5 });
const careerLimiter = createRateLimiter({ windowMs: 60 * 60 * 1000, max: 3 });

app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    service: 'mllagroindustries',
    status: 'ok',
    features: {
      contact: Boolean(db),
      careers: Boolean(db && resumeUpload),
      admin: ADMIN_ENABLED && Boolean(db)
    }
  });
});

app.post('/api/admin/login', adminLoginLimiter, (req, res) => {
  if (!ADMIN_ENABLED) {
    return res.status(503).json({ success: false, error: 'Admin access is not configured.' });
  }

  const password = typeof req.body?.password === 'string' ? req.body.password : '';

  if (!safeStringEqual(password, ADMIN_PASSWORD)) {
    return res.status(401).json({ success: false, error: 'Invalid password.' });
  }

  const token = crypto.randomBytes(32).toString('hex');
  adminSessions.set(token, Date.now() + ADMIN_SESSION_TTL_MS);
  res.setHeader('Cache-Control', 'no-store');
  return res.json({ success: true, token, expiresIn: ADMIN_SESSION_TTL_MS / 1000 });
});

app.post('/api/admin/logout', requireAdmin, (req, res) => {
  adminSessions.delete(getBearerToken(req));
  res.setHeader('Cache-Control', 'no-store');
  res.json({ success: true });
});

app.post('/api/contact', contactLimiter, requireDatabase, (req, res) => {
  const body = req.body || {};
  const fullName = normalizeText(body.fullName);
  const phone = normalizeText(body.phone);
  const inquiryType = normalizeText(body.inquiryType);
  const message = normalizeText(body.message);

  if (normalizeText(body.website)) {
    return res.json({ success: true });
  }
  if (fullName.length < 2 || fullName.length > 100) {
    return res.status(400).json({ success: false, error: 'Enter a valid full name.' });
  }
  if (!isValidPhone(phone)) {
    return res.status(400).json({ success: false, error: 'Enter a valid phone number.' });
  }
  if (!ALLOWED_INQUIRY_TYPES.has(inquiryType)) {
    return res.status(400).json({ success: false, error: 'Select a valid inquiry type.' });
  }
  if (message.length > 2000) {
    return res.status(400).json({ success: false, error: 'Message must be 2000 characters or fewer.' });
  }
  if (body.privacyAccepted !== true) {
    return res.status(400).json({ success: false, error: 'Privacy acknowledgement is required.' });
  }

  try {
    const result = db.prepare(`
      INSERT INTO submissions (full_name, phone, inquiry_type, message)
      VALUES (?, ?, ?, ?)
    `).run(fullName, phone, inquiryType, message);

    console.info(`[DB] New contact submission #${result.lastInsertRowid}`);
    return res.status(201).json({ success: true, id: result.lastInsertRowid });
  } catch (error) {
    console.error('[DB] Insert failed:', error.message);
    return res.status(500).json({ success: false, error: 'Server error. Please try again.' });
  }
});

app.post('/api/career-applications', careerLimiter, requireDatabase, handleResumeUpload, (req, res) => {
  const body = req.body || {};
  const resume = req.file;
  const fullName = normalizeText(body.fullName);
  const email = normalizeText(body.email).toLowerCase();
  const phone = normalizeText(body.phone);
  const position = normalizeText(body.position);
  const experience = normalizeText(body.experience);
  const location = normalizeText(body.location);
  const education = normalizeText(body.education);
  const currentCompany = normalizeText(body.currentCompany);
  const skills = normalizeText(body.skills);
  const noticePeriod = normalizeText(body.noticePeriod);
  const coverLetter = normalizeText(body.coverLetter);

  if (normalizeText(body.website)) {
    removeUploadedFile(resume);
    return res.json({ success: true });
  }
  if (fullName.length < 2 || fullName.length > 100) {
    return rejectCareerApplication(res, resume, 'Enter a valid full name.');
  }
  if (!isValidEmail(email)) {
    return rejectCareerApplication(res, resume, 'Enter a valid email address.');
  }
  if (!isValidPhone(phone)) {
    return rejectCareerApplication(res, resume, 'Enter a valid phone number.');
  }
  if (position.length < 2 || position.length > 100) {
    return rejectCareerApplication(res, resume, 'Enter the position you are applying for.');
  }
  if (!CAREER_EXPERIENCE_OPTIONS.has(experience)) {
    return rejectCareerApplication(res, resume, 'Select a valid experience range.');
  }
  if (location.length < 2 || location.length > 100) {
    return rejectCareerApplication(res, resume, 'Enter your current location.');
  }
  if (education.length < 2 || education.length > 150) {
    return rejectCareerApplication(res, resume, 'Enter your highest education or qualification.');
  }
  if (currentCompany.length > 120 || skills.length > 500 || coverLetter.length > 1500) {
    return rejectCareerApplication(res, resume, 'One or more career details are too long.');
  }
  if (noticePeriod && !CAREER_NOTICE_PERIODS.has(noticePeriod)) {
    return rejectCareerApplication(res, resume, 'Select a valid notice period.');
  }
  if (!isPrivacyAccepted(body.privacyAccepted)) {
    return rejectCareerApplication(res, resume, 'Privacy acknowledgement is required.');
  }
  if (!resume) {
    return res.status(400).json({ success: false, error: 'Upload your CV in PDF, DOC, or DOCX format.' });
  }
  if (!isValidResumeFile(resume)) {
    return rejectCareerApplication(res, resume, 'The uploaded CV file could not be verified. Upload a valid PDF, DOC, or DOCX file.');
  }

  try {
    const result = db.prepare(`
      INSERT INTO career_applications (
        full_name, email, phone, position, experience, location, education,
        current_company, skills, notice_period, cover_letter,
        resume_stored_name, resume_original_name, resume_size
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      fullName, email, phone, position, experience, location, education,
      currentCompany, skills, noticePeriod, coverLetter,
      resume.filename, sanitizeDownloadName(resume.originalname), resume.size
    );

    console.info(`[CAREERS] New application #${result.lastInsertRowid}`);
    return res.status(201).json({ success: true, id: result.lastInsertRowid });
  } catch (error) {
    removeUploadedFile(resume);
    console.error('[CAREERS] Insert failed:', error.message);
    return res.status(500).json({ success: false, error: 'We could not save your application. Please try again.' });
  }
});

app.get('/api/submissions', requireAdmin, requireDatabase, (req, res) => {
  try {
    const contactRows = db.prepare(`
      SELECT id, full_name, phone, inquiry_type, message, submitted_at
      FROM submissions
      ORDER BY id DESC
      LIMIT 1000
    `).all().map(row => ({ ...row, source: 'contact' }));
    const careerRows = db.prepare(`
      SELECT id, full_name, email, phone, position, experience, location, education,
             current_company, skills, notice_period, cover_letter,
             resume_original_name, submitted_at
      FROM career_applications
      ORDER BY id DESC
      LIMIT 1000
    `).all().map(row => ({
      id: row.id,
      full_name: row.full_name,
      phone: row.phone,
      inquiry_type: 'Career Application',
      message: createCareerSummary(row),
      submitted_at: row.submitted_at,
      source: 'career',
      email: row.email,
      position: row.position,
      experience: row.experience,
      resume_name: row.resume_original_name
    }));
    const rows = [...contactRows, ...careerRows]
      .sort((first, second) => `${second.submitted_at}|${second.id}`.localeCompare(`${first.submitted_at}|${first.id}`))
      .slice(0, 1000);
    res.setHeader('Cache-Control', 'no-store');
    return res.json({ success: true, count: rows.length, data: rows });
  } catch (error) {
    console.error('[DB] Query failed:', error.message);
    return res.status(500).json({ success: false, error: 'Server error.' });
  }
});

app.get('/api/career-applications/:id/resume', requireAdmin, requireDatabase, (req, res) => {
  const id = getSafeId(req.params.id);
  if (!id) return res.status(400).json({ success: false, error: 'Invalid application ID.' });

  try {
    const application = db.prepare(`
      SELECT resume_stored_name, resume_original_name
      FROM career_applications
      WHERE id = ?
    `).get(id);
    if (!application) return res.status(404).json({ success: false, error: 'Application not found.' });

    const resumePath = getStoredResumePath(application.resume_stored_name);
    if (!resumePath || !fs.existsSync(resumePath)) {
      return res.status(404).json({ success: false, error: 'CV file is no longer available.' });
    }

    const fileStats = fs.statSync(resumePath);
    const downloadName = sanitizeDownloadName(application.resume_original_name);
    res.setHeader('Cache-Control', 'no-store');
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('Content-Length', String(fileStats.size));
    res.attachment(downloadName);

    const resumeStream = fs.createReadStream(resumePath);
    resumeStream.on('error', error => {
      console.error('[CAREERS] Resume stream failed:', error.message);
      if (!res.headersSent) {
        return res.status(500).json({ success: false, error: 'Could not download this CV.' });
      }
      return res.destroy(error);
    });
    return resumeStream.pipe(res);
  } catch (error) {
    console.error('[CAREERS] Resume download failed:', error.message);
    return res.status(500).json({ success: false, error: 'Could not download this CV.' });
  }
});

app.delete('/api/submissions/:id', requireAdmin, requireDatabase, (req, res) => {
  const id = getSafeId(req.params.id);
  if (!id) {
    return res.status(400).json({ success: false, error: 'Invalid submission ID.' });
  }

  try {
    const result = db.prepare('DELETE FROM submissions WHERE id = ?').run(id);
    if (result.changes === 0) {
      return res.status(404).json({ success: false, error: 'Record not found.' });
    }
    res.setHeader('Cache-Control', 'no-store');
    return res.json({ success: true });
  } catch (error) {
    console.error('[DB] Delete failed:', error.message);
    return res.status(500).json({ success: false, error: 'Server error.' });
  }
});

app.delete('/api/career-applications/:id', requireAdmin, requireDatabase, (req, res) => {
  const id = getSafeId(req.params.id);
  if (!id) return res.status(400).json({ success: false, error: 'Invalid application ID.' });

  try {
    const application = db.prepare('SELECT resume_stored_name FROM career_applications WHERE id = ?').get(id);
    if (!application) return res.status(404).json({ success: false, error: 'Application not found.' });

    db.prepare('DELETE FROM career_applications WHERE id = ?').run(id);
    removeStoredResume(application.resume_stored_name);
    res.setHeader('Cache-Control', 'no-store');
    return res.json({ success: true });
  } catch (error) {
    console.error('[CAREERS] Delete failed:', error.message);
    return res.status(500).json({ success: false, error: 'Could not delete this application.' });
  }
});

// Product metadata is rendered into the first response for crawlers and link previews.
app.get('/product-detail.html', (req, res, next) => {
  const productId = normalizeText(req.query.id);
  if (!productId) return next();

  try {
    const products = JSON.parse(fs.readFileSync(path.join(__dirname, 'assets', 'products.json'), 'utf8'));
    const product = products.find(item => productSlug(item) === productId);
    if (!product) return next();

    const template = fs.readFileSync(path.join(__dirname, 'product-detail.html'), 'utf8');
    const html = renderProductMetadata(template, product, productId);
    res.setHeader('Cache-Control', `public, max-age=${SHORT_CACHE_SECONDS}, must-revalidate`);
    return res.type('html').send(html);
  } catch (error) {
    console.error('[SEO] Product metadata rendering failed:', error.message);
    return next();
  }
});

const staticFiles = express.static(__dirname, {
  etag: true,
  fallthrough: false,
  index: 'index.html',
  lastModified: true,
  setHeaders(res, filePath) {
    if (/(?:^|[\\/])admin\.html$/i.test(filePath)) {
      res.setHeader('Cache-Control', 'no-store');
    } else if (/(?:^|[\\/])sitemap\.xml$/i.test(filePath)) {
      res.type('application/xml');
      res.setHeader('Cache-Control', `public, max-age=${SHORT_CACHE_SECONDS}, must-revalidate`);
    } else if (/(?:^|[\\/])(?:favicon|apple-touch-icon|site\.webmanifest)/i.test(filePath)) {
      res.setHeader('Cache-Control', `public, max-age=${SHORT_CACHE_SECONDS}, must-revalidate`);
    } else if (/\.(?:png|jpe?g|webp|avif|gif|svg|ico|mp4)$/i.test(filePath)) {
      res.setHeader('Cache-Control', `public, max-age=${LONG_CACHE_SECONDS}, immutable`);
    } else if (/\.(?:css|js|json|xml|txt)$/i.test(filePath)) {
      res.setHeader('Cache-Control', `public, max-age=${SHORT_CACHE_SECONDS}, must-revalidate`);
    }
  }
});

app.use((req, res, next) => {
  if (req.method !== 'GET' && req.method !== 'HEAD') return next();

  let relativePath;
  try {
    relativePath = decodeURIComponent(req.path).replace(/^\/+/, '');
  } catch {
    return res.status(400).send('Bad request');
  }

  if (relativePath.includes('\0') || relativePath.includes('\\') || relativePath.split('/').includes('..')) {
    return res.status(404).send('Not found');
  }

  const firstSegment = relativePath.split('/')[0];
  const isPublic = relativePath === '' || PUBLIC_ROOT_FILES.has(relativePath) || PUBLIC_DIRECTORIES.has(firstSegment);
  if (!isPublic) return res.status(404).send('Not found');

  return staticFiles(req, res, next);
});

app.use('/api', (req, res) => {
  res.status(404).json({ success: false, error: 'API route not found.' });
});

app.use((error, req, res, next) => {
  if (error?.status === 404) {
    return res.status(404).send('Not found');
  }
  if (error?.name === 'MulterError' && error.code === 'LIMIT_FILE_SIZE') {
    removeUploadedFile(req.file);
    return res.status(413).json({ success: false, error: 'CV file must be 5 MB or smaller.' });
  }
  if (error?.code === 'UNSUPPORTED_RESUME_TYPE') {
    removeUploadedFile(req.file);
    return res.status(400).json({ success: false, error: 'Upload your CV in PDF, DOC, or DOCX format.' });
  }
  if (error?.type === 'entity.too.large') {
    return res.status(413).json({ success: false, error: 'Request body is too large.' });
  }
  if (error instanceof SyntaxError && 'body' in error) {
    return res.status(400).json({ success: false, error: 'Invalid JSON body.' });
  }
  if (res.headersSent) return next(error);
  console.error('[SERVER] Unhandled request error:', error.message);
  return res.status(500).json({ success: false, error: 'Server error.' });
});

function createCorsMiddleware() {
  return (req, res, next) => cors({
    credentials: false,
    methods: ['GET', 'POST', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    maxAge: 600,
    origin(origin, callback) {
      if (!origin) return callback(null, true);
      const requestOrigin = `${req.protocol}://${req.get('host')}`;
      return callback(null, origin === requestOrigin || allowedOrigins.has(origin));
    }
  })(req, res, next);
}

function securityHeaders(req, res, next) {
  const csp = [
    "default-src 'self'",
    "base-uri 'self'",
    "connect-src 'self' http://localhost:3000 http://127.0.0.1:3000",
    "font-src 'self' https://cdnjs.cloudflare.com https://fonts.gstatic.com data:",
    "form-action 'self'",
    "frame-ancestors 'none'",
    "frame-src https://www.google.com https://maps.google.com",
    "img-src 'self' data: https://images.unsplash.com https://5.imimg.com",
    "media-src 'self'",
    "object-src 'none'",
    "script-src 'self' 'unsafe-inline' https://cdnjs.cloudflare.com",
    "style-src 'self' 'unsafe-inline' https://cdnjs.cloudflare.com https://fonts.googleapis.com",
    "upgrade-insecure-requests"
  ].join('; ');

  res.setHeader('Content-Security-Policy', csp);
  res.setHeader('Cross-Origin-Opener-Policy', 'same-origin-allow-popups');
  res.setHeader('Cross-Origin-Resource-Policy', 'same-origin');
  res.setHeader('Permissions-Policy', 'camera=(), microphone=(), geolocation=(), payment=()');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');

  if (req.secure || req.get('x-forwarded-proto') === 'https') {
    res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
  }
  if (req.path.startsWith('/api/') || req.path === '/admin.html') {
    res.setHeader('Cache-Control', 'no-store');
  }
  next();
}

function createRateLimiter({ windowMs, max }) {
  const clients = new Map();

  return (req, res, next) => {
    const now = Date.now();
    const key = req.ip || req.socket.remoteAddress || 'unknown';
    const current = clients.get(key);
    const entry = !current || current.resetAt <= now
      ? { count: 0, resetAt: now + windowMs }
      : current;

    entry.count += 1;
    clients.set(key, entry);

    if (clients.size > 1000) {
      for (const [clientKey, value] of clients) {
        if (value.resetAt <= now) clients.delete(clientKey);
      }
    }

    res.setHeader('RateLimit-Limit', String(max));
    res.setHeader('RateLimit-Remaining', String(Math.max(0, max - entry.count)));
    res.setHeader('RateLimit-Reset', String(Math.ceil(entry.resetAt / 1000)));

    if (entry.count > max) {
      res.setHeader('Retry-After', String(Math.ceil((entry.resetAt - now) / 1000)));
      return res.status(429).json({ success: false, error: 'Too many requests. Please try again later.' });
    }
    return next();
  };
}

function normalizeText(value) {
  return typeof value === 'string' ? value.trim().replace(/\s+/g, ' ') : '';
}

function isValidPhone(value) {
  if (!/^\+?[0-9\s().-]+$/.test(value) || value.length > 24) return false;
  const digits = value.replace(/\D/g, '');
  return digits.length >= 10 && digits.length <= 15;
}

function safeStringEqual(candidate, expected) {
  const candidateBuffer = Buffer.from(candidate);
  const expectedBuffer = Buffer.from(expected);
  return candidateBuffer.length === expectedBuffer.length &&
    crypto.timingSafeEqual(candidateBuffer, expectedBuffer);
}

function getBearerToken(req) {
  const header = req.headers.authorization || '';
  return header.startsWith('Bearer ') ? header.slice(7) : '';
}

function requireAdmin(req, res, next) {
  if (!ADMIN_ENABLED) {
    return res.status(503).json({ success: false, error: 'Admin access is not configured.' });
  }

  const token = getBearerToken(req);
  const expiresAt = token ? adminSessions.get(token) : null;

  if (!expiresAt || expiresAt <= Date.now()) {
    if (token) adminSessions.delete(token);
    return res.status(401).json({ success: false, error: 'Unauthorized' });
  }

  adminSessions.set(token, Date.now() + ADMIN_SESSION_TTL_MS);
  res.setHeader('Cache-Control', 'no-store');
  return next();
}

function requireDatabase(req, res, next) {
  if (!db) {
    return res.status(503).json({
      success: false,
      error: 'This service is temporarily unavailable. Please use phone, email, or WhatsApp.'
    });
  }
  return next();
}

function handleResumeUpload(req, res, next) {
  if (!resumeUpload) {
    return res.status(503).json({
      success: false,
      error: 'CV upload is temporarily unavailable. Please use the office email.'
    });
  }
  return resumeUpload.single('resume')(req, res, next);
}

function createResumeUpload() {
  const storage = multer.diskStorage({
    destination: (req, file, callback) => callback(null, UPLOADS_PATH),
    filename: (req, file, callback) => {
      const extension = path.extname(file.originalname || '').toLowerCase();
      callback(null, `${crypto.randomUUID()}${extension}`);
    }
  });

  return multer({
    storage,
    limits: { fileSize: RESUME_MAX_BYTES, files: 1, fields: 20, fieldSize: 16 * 1024 },
    fileFilter: (req, file, callback) => {
      const extension = path.extname(file.originalname || '').toLowerCase();
      if (!RESUME_EXTENSIONS.has(extension)) {
        const error = new Error('Unsupported resume type.');
        error.code = 'UNSUPPORTED_RESUME_TYPE';
        return callback(error);
      }
      return callback(null, true);
    }
  });
}

function rejectCareerApplication(res, resume, error) {
  removeUploadedFile(resume);
  return res.status(400).json({ success: false, error });
}

function removeUploadedFile(file) {
  if (!file?.path) return;
  try {
    fs.unlinkSync(file.path);
  } catch (error) {
    if (error.code !== 'ENOENT') console.error('[UPLOAD] Could not remove rejected CV:', error.message);
  }
}

function isValidResumeFile(file) {
  if (!file?.path || !RESUME_EXTENSIONS.has(path.extname(file.originalname || '').toLowerCase())) return false;

  try {
    const bytes = fs.readFileSync(file.path);
    const extension = path.extname(file.originalname).toLowerCase();
    if (extension === '.pdf') return bytes.subarray(0, 5).toString('ascii') === '%PDF-';
    if (extension === '.doc') {
      return bytes.subarray(0, 8).equals(Buffer.from([0xd0, 0xcf, 0x11, 0xe0, 0xa1, 0xb1, 0x1a, 0xe1]));
    }
    return bytes.subarray(0, 4).equals(Buffer.from([0x50, 0x4b, 0x03, 0x04])) &&
      bytes.includes(Buffer.from('[Content_Types].xml'));
  } catch (error) {
    console.error('[UPLOAD] CV verification failed:', error.message);
    return false;
  }
}

function isValidEmail(value) {
  return value.length <= 254 && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

function isPrivacyAccepted(value) {
  return value === true || value === 'true';
}

function getSafeId(value) {
  const id = Number(value);
  return Number.isSafeInteger(id) && id > 0 ? id : null;
}

function sanitizeDownloadName(value) {
  const fallback = 'resume.pdf';
  const safe = path.basename(String(value || fallback))
    .replace(/[^A-Za-z0-9._ -]/g, '_')
    .replace(/\s+/g, ' ')
    .slice(0, 120);
  return safe || fallback;
}

function getStoredResumePath(storedName) {
  if (!/^[a-f0-9-]{36}\.(pdf|doc|docx)$/i.test(String(storedName || ''))) return null;
  const resumePath = path.resolve(UPLOADS_PATH, storedName);
  return path.dirname(resumePath) === path.resolve(UPLOADS_PATH) ? resumePath : null;
}

function removeStoredResume(storedName) {
  const resumePath = getStoredResumePath(storedName);
  if (!resumePath) return;
  try {
    fs.unlinkSync(resumePath);
  } catch (error) {
    if (error.code !== 'ENOENT') console.error('[UPLOAD] Could not remove CV:', error.message);
  }
}

function createCareerSummary(application) {
  const details = [
    `Role: ${application.position}`,
    `Experience: ${application.experience}`,
    `Email: ${application.email}`,
    `Location: ${application.location}`,
    `Education: ${application.education}`
  ];
  if (application.current_company) details.push(`Current/Last Company: ${application.current_company}`);
  if (application.notice_period) details.push(`Availability: ${application.notice_period}`);
  if (application.skills) details.push(`Skills: ${application.skills}`);
  if (application.cover_letter) details.push(`Note: ${application.cover_letter}`);
  return details.join(' | ');
}

function slugifyProduct(value) {
  return String(value || '')
    .toLowerCase()
    .replace(/&/g, ' and ')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function productSlug(product) {
  return product.slug || slugifyProduct(product.displayName || product.name);
}

function absoluteAssetUrl(value) {
  if (/^https?:\/\//i.test(value || '')) return value;
  return `https://mllagroindustries.com/${String(value || 'assets/logo_en.png').replace(/^\/+/, '')}`;
}

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function renderProductMetadata(template, product, slug) {
  const name = product.displayName || product.name;
  const title = `${name} | Vansh Group Product`;
  const description = normalizeText(product.shortDescription || product.description || `${name} product information from Vansh Group.`).slice(0, 220);
  const canonical = `https://mllagroindustries.com/product-detail.html?id=${encodeURIComponent(slug)}`;
  const image = absoluteAssetUrl(product.image);
  const productSchema = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name,
    image,
    description,
    category: product.category || undefined,
    brand: { '@type': 'Brand', name: 'Vansh Group' },
    manufacturer: { '@id': 'https://mllagroindustries.com/#organization' },
    url: canonical
  };
  const schemaJson = JSON.stringify(productSchema).replace(/</g, '\\u003c');

  return template
    .replace(/<title>[^<]*<\/title>/, `<title>${escapeHtml(title)}</title>`)
    .replace(/(<meta id="product-meta-description" name="description" content=")[^"]*(">)/, `$1${escapeHtml(description)}$2`)
    .replace(/(<link id="product-canonical" rel="canonical" href=")[^"]*(">)/, `$1${escapeHtml(canonical)}$2`)
    .replace(/(<meta id="product-og-title" property="og:title" content=")[^"]*(">)/, `$1${escapeHtml(title)}$2`)
    .replace(/(<meta id="product-og-description" property="og:description" content=")[^"]*(">)/, `$1${escapeHtml(description)}$2`)
    .replace(/(<meta id="product-og-url" property="og:url" content=")[^"]*(">)/, `$1${escapeHtml(canonical)}$2`)
    .replace(/(<meta id="product-og-image" property="og:image" content=")[^"]*(">)/, `$1${escapeHtml(image)}$2`)
    .replace(/(<meta id="product-twitter-title" name="twitter:title" content=")[^"]*(">)/, `$1${escapeHtml(title)}$2`)
    .replace(/(<meta id="product-twitter-description" name="twitter:description" content=")[^"]*(">)/, `$1${escapeHtml(description)}$2`)
    .replace(/(<meta id="product-twitter-image" name="twitter:image" content=")[^"]*(">)/, `$1${escapeHtml(image)}$2`)
    .replace(/(<script id="product-jsonld" type="application\/ld\+json">)[\s\S]*?(<\/script>)/, `$1${schemaJson}$2`);
}

function migrateLegacyDatabase() {
  const legacyPath = path.join(__dirname, 'vansh_leads.db');
  if (DB_PATH === DEFAULT_DB_PATH && !fs.existsSync(DB_PATH) && fs.existsSync(legacyPath)) {
    fs.copyFileSync(legacyPath, DB_PATH, fs.constants.COPYFILE_EXCL);
    fs.chmodSync(DB_PATH, 0o600);
    console.info('[DB] Existing lead database copied into the protected .data directory.');
  }
}

function closeDatabase() {
  if (db?.open) db.close();
}

// Hostinger loads the entry file through its process manager, where
// require.main is not this module. Listening unconditionally is required.
const server = app.listen(PORT, '0.0.0.0', () => {
  console.info(`MLL Agro Industries server listening on http://localhost:${PORT}`);
  console.info(`Admin panel: http://localhost:${PORT}/admin.html`);
  if (databaseStartupError) {
    console.warn('[DB] Contact storage is unavailable; public pages remain online.');
  }
  if (uploadStartupError) {
    console.warn('[UPLOAD] Career CV uploads are unavailable; public pages remain online.');
  }
});

for (const signal of ['SIGINT', 'SIGTERM']) {
  process.on(signal, () => {
    server.close(() => {
      closeDatabase();
      process.exit(0);
    });
  });
}

module.exports = { app, server, closeDatabase };
