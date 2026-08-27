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

If `DB_PATH` is not set, the app creates `vansh_leads.db` in the project
folder. The database file is intentionally ignored by Git.

For the career application form, set `CAREER_UPLOADS_PATH` beside the
persistent database storage (not inside a public web directory). When it is
not set, CVs are stored in `.data/career-resumes` next to the default database.
Back up both the SQLite database and this directory before a redeployment.
