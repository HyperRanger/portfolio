Backend for portfolio

This backend provides API endpoints for the portfolio site and an admin UI located at /admin.

Features

- Projects CRUD (reads from Supabase when configured; falls back to local data/projects.json)
- Contact form email sending (nodemailer)
- Admin endpoints protected by ADMIN_TOKEN (or environment credentials)
- CSP nonce-based serving of the admin UI to allow CDN scripts and inline scripts securely

Required environment variables

- SUPABASE_URL: your Supabase project URL
- SUPABASE_ANON_KEY: public anon key (used for client-side; optional)
- SUPABASE_SERVICE_ROLE_KEY: REQUIRED for server-side DB writes (keep secret)
- EMAIL_USER, EMAIL_PASS: SMTP credentials for contact form
- ADMIN_USERNAME, ADMIN_PASSWORD: fallback admin credentials
- ADMIN_TOKEN: token returned by /api/login to authenticate admin actions

Quick start (development)

1. Copy the example env: cd backend && cp .env.example .env (or create .env manually)
2. Install dependencies: npm install
3. Start server: npm run dev

Production notes

- Set NODE_ENV=production and provide SUPABASE_SERVICE_ROLE_KEY
- Do NOT commit secrets to the repository
- Use a process manager (PM2, systemd) and a TLS-terminating proxy (NGINX) for deployment
- Ensure the Supabase `projects` table exists and has the columns your frontend expects

CSP and Admin UI

- The server injects a per-request nonce into inline scripts and sets a strict Content-Security-Policy header allowing only the necessary CDN hosts and web-worker blob: for Monaco Editor.
- For even stricter policies, move inline scripts into external files served from the same origin and remove 'unsafe-inline' allowances.

If you want, I can:

- Convert admin inline scripts into external files to avoid needing nonces
- Add a small integration test suite for API endpoints
- Add a CI workflow for linting and deployment
