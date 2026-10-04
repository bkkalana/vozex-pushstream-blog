"use client";

import { useState } from "react";
import { LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";

export function LogoutButton() {
  const [loading, setLoading] = useState(false);
  return <Button variant="ghost" disabled={loading} onClick={async () => {
    setLoading(true);
    try { await fetch("/api/auth/logout", { method: "POST" }); } finally { window.location.href = "/admin/login"; }
  }}><LogOut size={17}/>{loading ? "Signing out…" : "Sign out"}</Button>;
}
