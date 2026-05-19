# LE Studio Demo Briefs

These briefs are used to prove that LE Studio can generate source-of-truth WordPress payload exports for different commercial scenarios.

## Rules

- Use real project names and real business context.
- Do not add invented testimonials, invented customer counts, guaranteed SEO rankings, guaranteed income, or invented prices.
- Keep contact emails as demo-safe addresses.
- Generated exports must validate through `pnpm validate:fixture`.

## Demo Set

- `local-service-physio.brief.json`: local service landing page.
- `secure-pwa-booking.brief.json`: SaaS/security-focused launch plan.
- `palicox-terminal.brief.json`: WordPress content hub / knowledge base.

## Expected Output

Each generated export must include:

- `dryRun: false`
- `productionWrite: false`
- `wordpressPostId: null`
- `sourceOfTruth: "meta.numbers"`
- valid `wordpress.main`, `wordpress.post`, `wordpress.services`, `wordpress.products`, and `wordpress.media` payloads
- no filler copy
- no fake claims
