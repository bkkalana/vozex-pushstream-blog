# Phase 28 Status — Article UX

## Implemented
- Lightweight Facebook, LinkedIn, X, WhatsApp and Copy Link actions with no social SDKs.
- Accessible code block component with Copy button, mobile horizontal scrolling, optional filename and line numbers.
- Lightweight highlighting for JavaScript, TypeScript, JSON, Bash, SQL, PHP, CSS, HTML and Python.
- TipTap technical code-block attributes for language, filename and line-number preference.
- Reusable tutorial Step block with step number, heading, optional image and optional code.
- Post tutorial metadata: difficulty, estimated minutes, requirements, tools and prerequisites.
- Public tutorial requirements panel near article intro.
- Published and Updated dates remain visible on article pages.
- Post view counter now increments `Post.views` with raw parameterized SQL so Prisma `@updatedAt` is not changed by analytics-only view writes.
- Phase 28 migration and regression-test fixtures added.

## Verification completed in artifact environment
- Required source files present.
- Phase 28 migration present.
- `package.json` updated with the explicit TipTap code-block extension.
- TypeScript syntax diagnostic scan: TS1xxx parse errors = 0.

## Pending deployment-environment gates
- `npm install`
- `npm run db:validate`
- `npm run db:generate`
- `npm run db:deploy`
- `npm run typecheck`
- `npm run lint`
- `npm test`
- `npm run build`
- Browser/mobile QA for copy code, share links, line-number scrolling and tutorial blocks.
