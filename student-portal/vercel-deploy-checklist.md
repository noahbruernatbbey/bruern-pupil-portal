Vercel Deployment Checklist for student-portal

- Root & Project Settings
  - Ensure the project root is `student-portal/` when creating the Vercel project.
  - Set `Framework Preset` to `Other` (static) if only deploying static files + serverless API under `/api`.

- vercel.json
  - Remove any custom `builds` entries that conflict with Vercel's auto-detected build.
  - Keep `version: 2` and ensure routes include `/api/**` passthrough if using serverless functions.

- Environment Variables
  - Add `DATABASE_URL` (Neon/Postgres) to Project > Settings > Environment Variables.
  - Add any other secrets (e.g., `NEON_ORG`, `NEON_PROJECT`) if used by your API.

- API & Serverless
  - Place serverless functions under `api/` (already in this repo).
  - Ensure `export const config = { runtime: 'edge' }` only for edge-compatible code.
  - Test API locally (with `vercel dev` or similar) before deploying.

- Static Assets
  - Verify fonts are under `assets/fonts/` and referenced with relative paths in `style.css`.
  - Ensure any large assets are stored in a CDN if they will be hot-linked.

- Security & CORS
  - Ensure API routes validate and sanitize inputs (password handling, etc.).
  - Do not commit production secrets to the repo. Use Vercel env variables.

- Build & Preview
  - Use `vercel dev` to run a local preview that matches Vercel's runtime.
  - Confirm `/api/signup`, `/api/login`, `/api/students`, and `/api/promote` work locally.

- Deploy & Verify
  - Deploy to a staging branch first, test sign up/login flows across machines.
  - Verify profile pictures persist, admin promotion persists, and sessions behave across devices.

- Post-deploy
  - Enable Environment Variable protection for production.
  - Add team members and set appropriate access.
  - Monitor logs on Vercel Dashboard for errors and cold starts.

Notes
- This repo includes a Neon/Postgres-backed API; ensure `DATABASE_URL` points to the serverless Neon connection string.
- If you use `@neondatabase/serverless`, verify the package is in `package.json` and included in the deployment build step.
