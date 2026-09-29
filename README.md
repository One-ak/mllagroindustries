# mllagroindustries

MLL Agro Industries website with a Node.js backend for contact-form leads and
the admin dashboard.

## Hostinger deployment

Use Hostinger's Node.js app hosting, not static-only hosting, because
`admin.html` and the contact form need the Express API in `server.js`.

- Node version: `20.x` or `22.x`
- Startup file / app entry: `server.js` or `index.js`
- Install command: `npm install`
- Build command: `npm run build`
- Start command: `npm start`
- Public URL should point to the Node app root

If Hostinger shows "Unsupported framework or invalid project structure", you
are likely using the static/framework importer. Choose Node.js app hosting for
this repository, because the admin panel requires the Express backend.

Set these environment variables in Hostinger:

- `ADMIN_PASSWORD`: password for `admin.html`
- `DB_PATH`: optional persistent SQLite file path
- `CAREER_UPLOADS_PATH`: recommended persistent private directory for uploaded CVs

If `DB_PATH` is not set, the app creates `.data/vansh_leads.db` in the project
folder. Configure persistent private storage on the host before redeployment;
the database file is intentionally ignored by Git.

For the career application form, set `CAREER_UPLOADS_PATH` beside the
persistent database storage (not inside a public web directory). When it is
not set, CVs are stored in `.data/career-resumes` next to the default database.
Back up both the SQLite database and this directory before a redeployment.

## SEO build and checks

`assets/products.json` is the product catalog source. After changing products,
run `npm run build` to regenerate the crawlable catalog blocks, organic manure
and micronutrient category pages, and `sitemap.xml`. Do not hand-edit generated
category pages; edit their content in `scripts/build-seo.js` instead.

Run `npm test` for metadata, JSON-LD, server rendering, escaping, sitemap URLs,
internal links, canonical redirects, 404 handling and compression checks. Tests
start a temporary local server with an in-memory database and disposable upload
directory; they never use production storage. Use Node 20 or 22 for native
database compatibility.

Product details are rendered by Express using `lib/product-page.js` and the
shared `js/product-seo.js` module. GitHub Pages alone cannot provide server-rendered
product content, API forms or the admin backend. Products without an explicit
catalog price do not emit Product rich-result markup; never add fabricated prices,
ratings, stock status or reviews to make a validator green.

See `SEO_REPORT.md`, `PAGE_AUDIT.md` and `FIXES_IMPLEMENTED.md` for the September
2026 audit, keyword priorities, verified changes and follow-up work.
