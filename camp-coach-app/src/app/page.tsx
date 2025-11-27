// src/app/page.tsx  (or app/page.tsx if no src)
import { supabase } from "@/lib/supabaseClient";

export default async function Home() {
  // simple test: try to read 1 player
  const { data, error } = await supabase
    .from("players")
    .select("*")
    .limit(1);

  return (
    <main className="min-h-screen flex items-center justify-center">
      <div className="p-6 border rounded-lg space-y-2">
        <h1 className="text-xl">Supabase Test</h1>

        {error && (
          <p className="text-red-500">
            Error: {error.message}
          </p>
        )}

        {!error && data && data.length > 0 && (
          <p>Supabase is connected! First player: {data[0].first_name} {data[0].last_name}</p>
        )}

        {!error && data && data.length === 0 && (
          <p>Supabase is connected, but no players yet.</p>
        )}
      </div>
    </main>
  );
}
