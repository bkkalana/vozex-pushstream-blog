import {
  BarChart3, Bot, Contact, FileText, FolderTree, Gauge, Image, LayoutDashboard,
  Mail, Megaphone, Menu, MessageSquare, Newspaper, PanelsTopLeft, Search, Settings,
  ShieldCheck, Tags, Users, Wrench, GitCompareArrows, Star, Link2, Bell, TrendingUp, CalendarDays, Clock3, Blocks, Import, BookOpen, Library, Compass, ListTodo, PanelsTopLeft as SitePagesIcon, type LucideIcon,
} from "lucide-react";
import { hasPermission } from "@/lib/auth/permissions";

export type AdminNavItem = { label: string; href: string; icon: LucideIcon; permission?: string; exact?: boolean };
export type AdminNavGroup = { label: string; items: AdminNavItem[] };

export const adminNavigation: AdminNavGroup[] = [
  { label: "Overview", items: [{ label: "Dashboard", href: "/admin", icon: LayoutDashboard, exact: true }] },
  { label: "Content", items: [
    { label: "Posts", href: "/admin/posts", icon: Newspaper, permission: "posts.view" },
    { label: "Author Dashboard", href: "/admin/author-dashboard", icon: Gauge, permission: "posts.view" },
    { label: "Editorial Calendar", href: "/admin/calendar", icon: CalendarDays, permission: "calendar.view" },
    { label: "Review Due", href: "/admin/posts/review-due", icon: Clock3, permission: "posts.view" },
    { label: "Content Blocks", href: "/admin/content-blocks", icon: Blocks, permission: "posts.edit" },
    { label: "Pages", href: "/admin/pages", icon: FileText, permission: "pages.view" },
    { label: "Categories", href: "/admin/categories", icon: FolderTree, permission: "categories.view" },
    { label: "Tags", href: "/admin/tags", icon: Tags, permission: "tags.view" },
    { label: "Authors", href: "/admin/authors", icon: Users, permission: "users.view" },
    { label: "Comments", href: "/admin/comments", icon: MessageSquare, permission: "comments.view" },
    { label: "Content Series", href: "/admin/series", icon: BookOpen, permission: "series.view" },
    { label: "Featured Collections", href: "/admin/collections", icon: Library, permission: "collections.view" },
    { label: "Resources", href: "/admin/resources", icon: Compass, permission: "resources.view" },
  ]},
  { label: "Tools", items: [
    { label: "AI Workspace", href: "/admin/ai", icon: Bot, permission: "ai.view" },
    { label: "AI Tools", href: "/admin/ai-tools", icon: Bot, permission: "tools.view" },
    { label: "Reviews", href: "/admin/reviews", icon: Star, permission: "reviews.view" },
    { label: "Comparisons", href: "/admin/comparisons", icon: GitCompareArrows, permission: "comparisons.view" },
  ]},
  { label: "Media", items: [{ label: "Media Library", href: "/admin/media", icon: Image, permission: "media.view" }, { label: "Media Collections", href: "/admin/media/collections", icon: Image, permission: "media.view" }] },
  { label: "Marketing", items: [
    { label: "Newsletter", href: "/admin/newsletter", icon: Mail, permission: "newsletter.view" },
    { label: "Newsletter Segments", href: "/admin/newsletter/segments", icon: Tags, permission: "newsletter.view" },
    { label: "Email Templates", href: "/admin/email-templates", icon: Mail, permission: "emailTemplates.view" },
    { label: "Affiliate Links", href: "/admin/affiliate-links", icon: Link2, permission: "affiliate.view" },
    { label: "Ads", href: "/admin/ads", icon: Megaphone, permission: "ads.view" },
    { label: "SEO", href: "/admin/seo", icon: Search, permission: "seo.view" },
  ]},
  { label: "Engagement", items: [
    { label: "Contact Messages", href: "/admin/contact-messages", icon: Contact, permission: "contacts.view" },
    { label: "Notifications", href: "/admin/notifications", icon: Bell },
  ]},
  { label: "Analytics", items: [
    { label: "Traffic", href: "/admin/analytics/traffic", icon: BarChart3, permission: "analytics.view" },
    { label: "Content Performance", href: "/admin/analytics/content", icon: Gauge, permission: "analytics.view" },
    { label: "Search Analytics", href: "/admin/analytics/search", icon: Search, permission: "analytics.view" },
    { label: "Trending", href: "/admin/analytics/trending", icon: TrendingUp, permission: "analytics.view" },
  ]},
  { label: "System", items: [
    { label: "Users", href: "/admin/users", icon: Users, permission: "users.view" },
    { label: "Roles & Permissions", href: "/admin/roles", icon: ShieldCheck, permission: "roles.view" },
    { label: "Appearance", href: "/admin/appearance", icon: PanelsTopLeft, permission: "settings.view" },
    { label: "Navigation", href: "/admin/navigation", icon: Menu, permission: "navigation.view" },
    { label: "Homepage", href: "/admin/homepage", icon: LayoutDashboard, permission: "homepage.view" },
    { label: "Site Pages", href: "/admin/site-pages", icon: SitePagesIcon, permission: "sitePages.view" },
    { label: "Settings", href: "/admin/settings", icon: Settings, permission: "settings.view" },
    { label: "Activity Feed", href: "/admin/activity", icon: ListTodo, permission: "activity.view" },
    { label: "Audit Logs", href: "/admin/audit-logs", icon: Wrench, permission: "users.view" },
    { label: "Security Events", href: "/admin/security/events", icon: Wrench, permission: "security.view" },
    { label: "Account Security", href: "/admin/profile/security", icon: Wrench },
    { label: "Import / Export", href: "/admin/import-export", icon: Import, permission: "imports.view" },
    { label: "Jobs", href: "/admin/system/jobs", icon: ListTodo, permission: "jobs.view" },
    { label: "Webhooks", href: "/admin/webhooks", icon: Link2, permission: "webhooks.view" },
    { label: "Feature Flags", href: "/admin/settings/features", icon: Settings, permission: "settings.view" },
    { label: "Announcement", href: "/admin/settings/announcement", icon: Megaphone, permission: "settings.view" },
    { label: "Settings History", href: "/admin/settings/history", icon: Clock3, permission: "settings.view" },
    { label: "System Info", href: "/admin/system", icon: Wrench, permission: "settings.view" },
  ]},
];

export function visibleAdminNavigation(permissions: string[]) {
  return adminNavigation.map((group) => ({
    ...group,
    items: group.items.filter((item) => !item.permission || hasPermission(permissions, item.permission)),
  })).filter((group) => group.items.length > 0);
}
