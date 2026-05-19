# LE Studio (Web do 24h)

LE Studio is the Rubberduck workflow app for **Web do 24h**.

It turns a launch brief into website structure, copy, and a WordPress-ready payload for review before import.

## What it does
- Visual workflow: **Web do 24h Generator**
- Supports project types:
  - business
  - saas
  - booking
  - product-launch
  - support-campaign
  - personal-brand
- Generates validated **structured JSON** output for WordPress metabox payloads (no raw HTML layout generation)
- Shows execution timeline, node statuses, and JSON preview
- Exports JSON after successful compliance pass

## Product direction
This app is not crowdfunding-first. `support-campaign` is one project type among multiple launch paths.

## Live generation and import safety
- LE Studio runs live generation against real user brief data.
- WordPress writes remain server-guarded and disabled unless:
  - `ENABLE_REAL_WP_IMPORT=true`
  - project type is `support-campaign`
  - compliance passed
- Browser never receives WordPress credentials.
- "Web do 24h" means delivery according to scope and available client materials.

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
