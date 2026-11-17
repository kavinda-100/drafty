"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { authClient } from "@/lib/auth-client";

export function LogoutButton() {
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const [error, setError] = useState(false);

  async function logout() {
    setPending(true);
    setError(false);
    try {
      const result = await authClient.signOut();
      if (result.error) throw new Error("Logout failed");
      router.replace("/login");
      router.refresh();
    } catch {
      setError(true);
      setPending(false);
    }
  }

  return <div className="flex items-center gap-3">{error && <span role="alert" className="text-sm text-destructive">Could not log out. Try again.</span>}<Button variant="outline" onClick={logout} disabled={pending}>{pending ? "Logging out..." : "Logout"}</Button></div>;
}
