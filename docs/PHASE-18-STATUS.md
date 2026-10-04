# Phase 18 Status — AI-Assisted Editorial Workspace

## Status

Core source implementation is complete. Runtime verification with real provider credentials and a test MySQL database is still required before production enablement.

## Implemented

- Provider-neutral `AiProvider` interface.
- Server-side OpenAI Responses API adapter.
- Server-side Anthropic Messages API adapter.
- Server-side Gemini `generateContent` adapter.
- Future/local endpoint adapter.
- Provider secrets from environment variables only.
- Admin provider/model selection and feature toggles.
- Maximum-output-token, site-daily-call and per-user-daily-call limits.
- `AiActivity` editorial activity history.
- `AiUsageDaily` usage aggregation.
- `ai.view`, `ai.use`, `ai.manage` permissions.
- AI Workspace admin dashboard and provider configuration status without exposing credentials.
- AI activity history with editor/post/action/provider/model/accepted state.
- Editor-side title, SEO title, description, excerpt, outline, headings, FAQ, internal-link, summary, social, comparison, related-content and alt-text assistance.
- TipTap selection assistant for rewrite, simplify, grammar, clarity, expand and shorten.
- Editable AI result before insertion.
- Explicit Accept/Insert, Copy, Discard and Regenerate actions.
- Accepted AI activity is timestamped.
- No AI API route writes post publication status or auto-publishes content.
- Internal-link/related-content requests receive verified database candidates when editing an existing post.
- Editorial safety system prompt forbids fabricated statistics, testimonials, ratings, reviews, quotes, sources and unsupported claims.
- Audit event for AI generation and AI settings changes.

## Migration

`prisma/migrations/20260929170000_phase18_ai_workspace/migration.sql`

Adds:

- `AiActivity`
- `AiUsageDaily`
- `AiProviderName`

## Environment variables

```env
OPENAI_API_KEY=
ANTHROPIC_API_KEY=
GEMINI_API_KEY=
LOCAL_AI_ENDPOINT=
LOCAL_AI_API_KEY=
```

Only configure the providers you intend to use. Provider credentials are server-only.

## Safety boundary

AI features are drafting helpers. Generated text remains a draft until an authorized editor explicitly accepts/inserts it and normal editorial workflow subsequently publishes the post. Product ratings, review scores and factual verification remain manual/editorial controls.

## Verification completed in artifact environment

- `package.json` parses successfully.
- Phase 18 TypeScript source has no detected parser/syntax errors.
- Provider credential names are confined to server environment/provider code and `.env.example`.
- Migration/source relations were statically reviewed.

## Runtime verification still required

- `npm install`
- `npm run db:validate`
- `npm run db:generate`
- `npm run db:deploy` on a test database
- seed existing-role permission updates
- `npm run typecheck`
- `npm run lint`
- `npm test`
- provider contract/integration tests with configured test credentials
- daily/per-user concurrency-limit test
- activity-history persistence test
- editor browser smoke test
- `npm run build`

Do not enable AI in production until the selected provider is configured and these gates are green.
