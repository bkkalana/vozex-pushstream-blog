import Link from "next/link";
import { Card } from "@/components/ui/card";
import { ForgotPasswordForm } from "@/components/admin/forgot-password-form";
export default function ForgotPasswordPage(){return <main className="grid min-h-screen place-items-center bg-[var(--background-soft)] px-4 py-12"><Card className="w-full max-w-md p-7 sm:p-8"><h1 className="text-3xl font-bold">Reset password</h1><p className="mb-7 mt-2 text-sm text-[var(--text-secondary)]">Enter your admin email. The response is intentionally the same whether an account exists or not.</p><ForgotPasswordForm/><Link href="/admin/login" className="mt-5 block text-center text-sm font-semibold text-[var(--primary)] hover:underline">Back to sign in</Link></Card></main>}
