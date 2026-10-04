# Phase 8 Status — Reviews & Comparisons

## Implemented
- Review admin CRUD and permissions.
- Review rating dimensions: overall, ease of use, features, performance, support and value for money.
- Review pros/cons, best-for, pricing, official/affiliate URLs, FAQ, verdict, screenshots data model, alternatives data model and publication workflow.
- Normalized ReviewScreenshot and ReviewAlternative relations.
- Comparison admin CRUD with exactly two products and ordered feature rows.
- Public reviews index and detailed review template.
- Public comparisons index and responsive horizontally scrollable comparison table.
- Affiliate disclosure/rel attributes.
- Audit log integration for create/update/archive actions.
- Phase 8 Prisma migration included.

## Deliberately not fabricated
- Review JSON-LD is not emitted until a stricter schema helper is added; this avoids invalid or misleading aggregate review markup.
- No ratings are automatically calculated or invented.

## Pending runtime verification
- npm install
- prisma validate/generate/deploy against MySQL
- typecheck
- lint
- tests
- production build
- browser/mobile QA
