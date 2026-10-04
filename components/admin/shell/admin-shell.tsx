"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useMemo, useState, type ReactNode } from "react";
import { Bell, ChevronLeft, ChevronRight, Menu, Search, UserRound } from "lucide-react";
import { Toaster } from "sonner";
import { Sheet } from "@/components/ui/sheet";
import { Tooltip } from "@/components/ui/tooltip";
import { Dropdown } from "@/components/ui/dropdown";
import { LogoutButton } from "@/components/admin/logout-button";
import { visibleAdminNavigation } from "./admin-nav";
import { cn } from "@/lib/utils";

type AdminShellUser = { name: string; email: string; roles: string[]; permissions: string[] };

function isActive(pathname: string, href: string, exact?: boolean) {
  return exact ? pathname === href : pathname === href || pathname.startsWith(`${href}/`);
}

function Sidebar({ user, collapsed, onNavigate }: { user: AdminShellUser; collapsed: boolean; onNavigate?: () => void }) {
  const pathname = usePathname();
  const groups = useMemo(() => visibleAdminNavigation(user.permissions), [user.permissions]);
  return <nav aria-label="Admin navigation" className="space-y-6 px-3 pb-6 pt-3">
    {groups.map((group) => <section key={group.label}>
      {!collapsed && <p className="mb-2 px-3 text-[11px] font-bold uppercase tracking-[0.12em] text-[var(--text-muted)]">{group.label}</p>}
      <div className="space-y-1">{group.items.map((item) => {
        const Icon = item.icon; const active = isActive(pathname, item.href, item.exact);
        const link = <Link onClick={onNavigate} href={item.href} aria-current={active ? "page" : undefined} className={cn("flex min-h-11 items-center rounded-xl px-3 text-sm font-semibold transition", collapsed ? "justify-center" : "gap-3", active ? "bg-[var(--background-blue)] text-[var(--primary)]" : "text-[var(--text-secondary)] hover:bg-[var(--background-soft)] hover:text-[var(--foreground)]")}><Icon size={18} aria-hidden="true"/>{!collapsed && <span>{item.label}</span>}</Link>;
        return <div key={item.href}>{collapsed ? <Tooltip label={item.label}>{link}</Tooltip> : link}</div>;
      })}</div>
    </section>)}
  </nav>;
}

function Breadcrumbs() {
  const pathname = usePathname();
  const parts = pathname.split("/").filter(Boolean).slice(1);
  return <nav aria-label="Breadcrumb" className="hidden items-center gap-1 text-sm text-[var(--text-muted)] sm:flex">
    <Link href="/admin" className="hover:text-[var(--primary)]">Admin</Link>
    {parts.map((part, index) => {
      const href = `/admin/${parts.slice(0, index + 1).join("/")}`;
      const label = part.replaceAll("-", " ").replace(/\b\w/g, (letter) => letter.toUpperCase());
      return <span key={href} className="flex items-center gap-1"><span aria-hidden="true">/</span><Link href={href} className="hover:text-[var(--primary)]">{label}</Link></span>;
    })}
  </nav>;
}

export function AdminShell({ user, unreadNotifications = 0, children }: { user: AdminShellUser; unreadNotifications?: number; children: ReactNode }) {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  useEffect(() => { setCollapsed(window.localStorage.getItem("pushstream.admin.sidebarCollapsed") === "1"); }, []);
  function toggleCollapsed() { setCollapsed((value) => { const next = !value; window.localStorage.setItem("pushstream.admin.sidebarCollapsed", next ? "1" : "0"); return next; }); }

  return <div className="min-h-screen bg-[var(--background-soft)]"><a href="#admin-main" className="skip-link">Skip to admin content</a>
    <Toaster richColors position="top-right" closeButton />
    <aside className={cn("fixed inset-y-0 left-0 z-40 hidden border-r border-[var(--border)] bg-white transition-[width] duration-200 lg:flex lg:flex-col", collapsed ? "w-[76px]" : "w-[270px]")}>
      <div className={cn("flex h-16 items-center border-b border-[var(--border)]", collapsed ? "justify-center px-2" : "justify-between px-5")}>
        <Link href="/admin" aria-label="PushStream Admin" className={cn("font-extrabold", collapsed ? "text-lg" : "text-xl")}>{collapsed ? <span className="text-[var(--primary)]">PS</span> : <>Push<span className="text-[var(--primary)]">Stream</span></>}</Link>
        {!collapsed && <button type="button" onClick={toggleCollapsed} aria-label="Collapse sidebar" className="grid size-9 place-items-center rounded-lg hover:bg-[var(--background-soft)]"><ChevronLeft size={18}/></button>}
      </div>
      <div className="min-h-0 flex-1 overflow-y-auto"><Sidebar user={user} collapsed={collapsed}/></div>
      {collapsed && <button type="button" onClick={toggleCollapsed} aria-label="Expand sidebar" className="mx-auto mb-4 grid size-10 place-items-center rounded-xl border border-[var(--border)] hover:bg-[var(--background-soft)]"><ChevronRight size={18}/></button>}
    </aside>

    <div id="admin-mobile-navigation"><Sheet open={mobileOpen} title="Admin navigation" onClose={() => setMobileOpen(false)}><Sidebar user={user} collapsed={false} onNavigate={() => setMobileOpen(false)}/></Sheet></div>

    <div className={cn("transition-[padding] duration-200", collapsed ? "lg:pl-[76px]" : "lg:pl-[270px]")}>
      <header className="sticky top-0 z-30 flex min-h-16 items-center gap-3 border-b border-[var(--border)] bg-white/95 px-4 backdrop-blur sm:px-6">
        <button type="button" className="grid size-10 place-items-center rounded-xl hover:bg-[var(--background-soft)] lg:hidden" aria-label="Open admin navigation" aria-expanded={mobileOpen} aria-controls="admin-mobile-navigation" onClick={() => setMobileOpen(true)}><Menu size={20}/></button>
        <div className="min-w-0 flex-1"><Breadcrumbs/></div>
        <Link href="/admin/search" className="hidden min-h-10 min-w-56 items-center gap-2 rounded-xl border border-[var(--border)] bg-[var(--background-soft)] px-3 text-sm text-[var(--text-muted)] md:flex"><Search size={17}/>Search admin…<kbd className="ml-auto text-[11px]">⌘K</kbd></Link>
        <Link href="/admin/notifications" aria-label={`Notifications${unreadNotifications ? ` (${unreadNotifications} unread)` : ""}`} className="relative grid size-10 place-items-center rounded-xl hover:bg-[var(--background-soft)]"><Bell size={19}/>{unreadNotifications>0&&<span className="absolute right-1 top-1 min-w-4 rounded-full bg-[var(--primary)] px-1 text-center text-[10px] font-bold leading-4 text-white">{unreadNotifications>99?"99+":unreadNotifications}</span>}</Link>
        <Dropdown trigger={<span className="flex items-center gap-2 rounded-xl p-1 pr-2 hover:bg-[var(--background-soft)]"><span className="grid size-9 place-items-center rounded-lg bg-[var(--background-blue)] text-[var(--primary)]"><UserRound size={18}/></span><span className="hidden max-w-36 text-left sm:block"><strong className="block truncate text-xs">{user.name}</strong><span className="block truncate text-[11px] text-[var(--text-muted)]">{user.roles.join(" · ")}</span></span></span>}>
          <div className="px-3 py-2 text-xs text-[var(--text-muted)]">{user.email}</div>
          <Link role="menuitem" href="/admin/profile" className="block rounded-lg px-3 py-2 text-sm hover:bg-[var(--background-soft)]">Profile</Link>
          <div className="my-1 border-t border-[var(--border)]"/><div className="px-1"><LogoutButton/></div>
        </Dropdown>
      </header>
      <main id="admin-main" className="p-4 sm:p-6 lg:p-8">{children}</main>
    </div>
  </div>;
}
