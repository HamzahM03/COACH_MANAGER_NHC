import { supabase } from "@/lib/supabaseClient";

export default async function Home() {
  // Try to read 1 player from the database
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
          <p>
            Supabase is connected! First player:{" "}
            <strong>{data[0].first_name} {data[0].last_name}</strong>
          </p>
        )}

        {!error && data && data.length === 0 && (
          <p>Supabase is connected, but there are no players yet.</p>
        )}
      </div>
    </main>
  );
}
