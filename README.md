# Rubberduck Launch Studio (Web do 24h)

Rubberduck Launch Studio is the workflow canvas for **Web do 24h**.

## What it does
- Visual workflow: **Web do 24h Generator**
- Supports project types:
  - business
  - saas
  - booking
  - product-launch
  - support-campaign
  - personal-brand
- Generates validated **structured JSON** output (no raw HTML generation)
- Shows execution timeline, node statuses, and JSON preview
- Exports JSON after successful compliance pass

## Product direction
This app is not crowdfunding-first. `support-campaign` is one project type among multiple launch paths.

## Dry-run and import safety
- Default mode is dry-run.
- Real WordPress import is disabled unless:
  - `ENABLE_REAL_WP_IMPORT=true`
  - project type is `support-campaign`
  - compliance passed
- Browser never receives WordPress credentials.

## Environment
Use `.env.example` as baseline.

## Scripts
- `pnpm dev`
- `pnpm typecheck`
- `pnpm lint`
- `pnpm build`

## Security
- Never commit secrets
- Never expose app passwords in client code
- Keep production writes disabled by default

## Runtime targets
- WordPress runtime: `https://rubberduck.sk`
- Studio target: `https://studio.rubberduck.sk`
