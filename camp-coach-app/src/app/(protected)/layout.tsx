// app/(protected)/layout.tsx
import { createServerSupabase } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export default async function ProtectedLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createServerSupabase();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Not logged in? Kick them to login page
  if (!user) {
    redirect("/login");
  }

  return <>{children}</>;
}
