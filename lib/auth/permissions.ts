export const ROLE_NAMES = ["SUPER_ADMIN", "ADMIN", "EDITOR", "AUTHOR", "SEO_MANAGER", "VIEWER"] as const;
export type RoleName = (typeof ROLE_NAMES)[number];

export const PERMISSIONS = [
  "posts.view", "posts.create", "posts.edit", "posts.publish", "posts.delete",
  "pages.view", "pages.create", "pages.edit", "pages.publish", "pages.delete",
  "categories.view", "categories.create", "categories.edit", "categories.delete",
  "tags.view", "tags.create", "tags.edit", "tags.delete",
  "tools.view", "tools.create", "tools.edit", "tools.publish", "tools.delete",
  "reviews.view", "reviews.create", "reviews.edit", "reviews.publish", "reviews.delete",
  "comparisons.view", "comparisons.create", "comparisons.edit", "comparisons.publish", "comparisons.delete",
  "media.view", "media.upload", "media.edit", "media.delete",
  "comments.view", "comments.moderate", "comments.delete",
  "users.view", "users.create", "users.edit", "users.delete",
  "roles.view", "roles.manage",
  "settings.view", "settings.edit",
  "seo.view", "seo.edit",
  "analytics.view", "jobs.view", "jobs.manage",
  "affiliate.view", "affiliate.manage",
  "ads.view", "ads.manage",
  "newsletter.view", "newsletter.manage", "newsletter.export", "emailTemplates.view", "emailTemplates.manage", "activity.view", "audit.export",
  "contacts.view", "contacts.manage",
  "navigation.view", "navigation.manage",
  "homepage.view", "homepage.manage",
  "sitePages.view", "sitePages.manage",
  "imports.view", "imports.manage",
  "calendar.view", "calendar.manage",
  "workflow.submit", "workflow.review", "workflow.approve", "workflow.schedule", "workflow.overrideLock",
  "editorialNotes.view", "editorialNotes.manage",
  "ai.view", "ai.use", "ai.manage",
  "series.view", "series.manage", "collections.view", "collections.manage", "resources.view", "resources.manage",
  "security.view", "security.manage",
  "webhooks.view", "webhooks.manage",
] as const;

export type PermissionKey = (typeof PERMISSIONS)[number];

export function hasPermission(granted: Iterable<string>, requested: string): boolean {
  const set = granted instanceof Set ? granted : new Set(granted);
  if (set.has("*") || set.has(requested)) return true;
  const namespace = requested.split(".")[0];
  return Boolean(namespace && set.has(`${namespace}.*`));
}

export const ROLE_PERMISSION_MATRIX: Record<RoleName, readonly string[]> = {
  SUPER_ADMIN: ["*"],
  ADMIN: PERMISSIONS.filter((permission) => !permission.startsWith("roles.")),
  EDITOR: PERMISSIONS.filter((permission) => ["posts.", "pages.", "categories.", "tags.", "media.", "comments.", "tools.", "reviews.", "comparisons.", "calendar.", "workflow.", "editorialNotes.", "ai.", "series.", "collections.", "resources.", "sitePages.", "imports.view"].some((prefix) => permission.startsWith(prefix))),
  AUTHOR: ["posts.view", "posts.create", "posts.edit", "media.view", "media.upload", "calendar.view", "workflow.submit", "editorialNotes.view", "editorialNotes.manage", "ai.view", "ai.use"],
  SEO_MANAGER: ["posts.view", "pages.view", "categories.view", "tags.view", "tools.view", "reviews.view", "seo.view", "seo.edit", "analytics.view", "jobs.view", "jobs.manage", "affiliate.view", "ai.view", "ai.use", "collections.view", "resources.view"],
  VIEWER: ["posts.view", "pages.view", "categories.view", "tags.view", "tools.view", "reviews.view", "comparisons.view", "media.view", "comments.view", "analytics.view"],
};
