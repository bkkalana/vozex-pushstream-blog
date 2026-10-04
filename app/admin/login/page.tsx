import Link from "next/link";
import { redirect } from "next/navigation";
import { Card } from "@/components/ui/card";
import { LoginForm } from "@/components/admin/login-form";
import { getCurrentSession } from "@/lib/auth/session";

export default async function AdminLoginPage() {
  if (await getCurrentSession()) redirect("/admin");
  return <main className="grid min-h-screen place-items-center bg-[var(--background-soft)] px-4 py-12"><div className="w-full max-w-md"><Link href="/" className="mb-7 block text-center text-2xl font-extrabold text-[var(--foreground)]">Push<span className="text-[var(--primary)]">Stream</span></Link><Card className="p-7 sm:p-8"><p className="text-sm font-bold uppercase tracking-[0.14em] text-[var(--primary)]">Secure Admin</p><h1 className="mt-2 text-3xl font-bold">Sign in</h1><p className="mb-7 mt-2 text-sm text-[var(--text-secondary)]">Access the PushStream publication dashboard.</p><LoginForm /></Card></div></main>;
}
