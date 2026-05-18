# AGENTS.md — neurogen-saas

## Project
- Eleventy (11ty) static site, ESM (`"type": "module"`)
- Source: `src/` → Output: `_site/`
- Templates: `.njk` (Nunjucks) + `.html`
- CSS, JS, fonts are passthrough-copied (no preprocessing)

## Commands
- `npm install` — install deps (only `@11ty/eleventy`)
- `npm run build` — build to `_site/`
- `npm start` — dev server with live reload (`--serve --quiet`)

## CI / Deploy
- GitHub Actions: push to `master` → build → deploy to Yandex Cloud S3 (`neuro-gen.ru`)
- Node 20 in CI
- Bucket region: `ru-central1`, endpoint: `storage.yandexcloud.net`

## Structure
- `src/_includes/partials/` — shared Nunjucks partials
- `src/public/` — root-level static assets (favicon, images, manifest)
- `src/_redirects` — Netlify-style redirects, copied to output root
- Pages: `join.njk`, `promo-kit.njk`, `crm.njk`, `crm-demo.njk`, `ai.njk`, `qr2pdf.njk`, `verify.njk`, `go-polza.html`

## Notes
- No tests, no linter, no formatter — verify changes visually via `npm start`
- Default branch is `master` (not `main`)
- `.env` is gitignored; secrets live in GitHub repo settings (`YC_KEY_ID`, `YC_SECRET_KEY`)
