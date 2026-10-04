# Phase 26 Status — Communications, Segments, Activity & Audit

## Implemented
- Provider-neutral transactional email contract.
- SMTP provider plus Brevo and Resend HTTP adapters.
- Mailchimp/ConvertKit selection remains future-sync ready and does not become mandatory.
- Provider credentials remain environment-only.
- Newsletter interest segments and subscriber-to-segment relationships.
- Homepage interest selection and footer signup source tracking.
- Segment/status filtering and CSV export.
- Existing double-opt-in setting preserved and wired to the token flow.
- Safe reusable email templates with escaped variable substitution.
- Seed templates for newsletter confirmation, password reset, contact acknowledgement and editorial notifications.
- Operational ActivityLog separate from immutable AuditLog.
- Recent activity dashboard feed and dedicated `/admin/activity` view.
- Audit filtering by user/action/entity/date and authorized CSV export.
- New permissions: `emailTemplates.view`, `emailTemplates.manage`, `activity.view`, `audit.export`.

## Deliberately not claimed as runtime-verified
- Real provider delivery for SMTP/Brevo/Resend.
- Mailchimp/ConvertKit subscriber synchronization (architecture-ready, not mandatory yet).
- Prisma migration against a configured MySQL test database.
- Full dependency-aware typecheck/lint/test/build.

## Deployment gate
Run dependency install, Prisma validate/generate/deploy, seed, typecheck, lint, tests and production build before marking Phase 26 fully released.
