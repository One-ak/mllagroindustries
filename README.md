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

If `DB_PATH` is not set, the app creates `vansh_leads.db` in the project
folder. The database file is intentionally ignored by Git.
