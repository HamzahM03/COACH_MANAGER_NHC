"use client";
import { createBrowserSupabase } from "@/lib/supabase/client";

const supabase = createBrowserSupabase();
import { useRouter } from "next/navigation";

export function LogoutButton() {
  const router = useRouter();

  async function handleLogout() {
    await supabase.auth.signOut();
    router.push("/login");
  }

  return (
    <button
      onClick={handleLogout}
      className="text-xs text-muted-foreground hover:text-foreground"
    >
      Log out
    </button>
  );
}
