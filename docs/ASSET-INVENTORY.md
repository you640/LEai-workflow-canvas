# LE Studio Asset Inventory

## Product Assets

- LE Studio web app
- Brief flow
- Workflow canvas
- Magic wand prompt generator
- Source-of-truth WordPress metabox export
- Compliance validation
- Import guard
- i18n SK/EN

## Technical Assets

- Next.js app
- Mistral integration
- Zod validation schemas
- Playwright/E2E scripts
- Fixture validator
- Source-of-truth schema based on `meta.numbers`

## WordPress Assets

- Palicox Terminal Theme
- WordPress block theme patterns
- `launch-payload.json`
- Staging smoke checklist

## Brand Assets

- Rubberduck umbrella
- LE Studio product name
- Web do 24h offer name

## Domains / Deployments

- `studio.rubberduck.sk`
- `studio-rubberduck-sk.vercel.app`
- `test01.rubberduck.sk` staging target

## Risks / Unknowns

- Revenue: not used in current valuation
- Active users: not used in current valuation
- Final trademark/brand ownership: verify
- Production WordPress write path: guarded, not buyer-ready
- Palicox staging smoke: pending because staging HTTPS is not passing yet

## Handover Notes

- Codebase: `/Users/erikbabcan/LEai-workflow-canvas`
- WordPress proof artifact: `/Users/erikbabcan/BUILDER-EMERGENT-COM/palicox-terminal-theme.zip`
- Run local checks with `pnpm lint`, `pnpm typecheck`, `pnpm test`, and `pnpm build`.
- Validate generated JSON with `pnpm validate:fixture`.
- Test WordPress artifacts only on a confirmed staging target.
