import { createServerSupabase } from "@/lib/supabase/server"
import Link from "next/link"


// player/[id] page

type Player = {
  id: string
  first_name: string
  last_name: string
  phone: string | null
  notes: string | null
  created_at: string
}

type PlayerPackage = {
  id: string
  sessions_total: number
  sessions_used: number
  price_cents: number
  purchased_at: string
}

type AttendanceRow = {
  id: string
  date: string
  created_at: string
}

export default async function PlayerProfilePage({
  params,
}: {
  params: { id: string }
}) {
  const supabase = createServerSupabase() // 👈 create server client once
  const playerId = params.id

  // 1) Load player
  const { data: playerData, error: playerError } = await supabase
    .from("players")
    .select("*")
    .eq("id", playerId)
    .single()

  if (playerError || !playerData) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="w-full max-w-md bg-white rounded-xl shadow p-6 space-y-4">
          <p className="text-sm text-red-500 text-center">
            Failed to load player.
          </p>
          <div className="text-center">
            <Link
              href="/players"
              className="text-sm text-blue-600 hover:underline"
            >
              Back to Players
            </Link>
          </div>
        </div>
      </main>
    )
  }

  const player = playerData as Player

  // 2) Load package history
  const { data: pkgData } = await supabase
    .from("player_packages")
    .select("id, sessions_total, sessions_used, price_cents, purchased_at")
    .eq("player_id", playerId)
    .order("purchased_at", { ascending: false })

  const packages = (pkgData || []) as PlayerPackage[]

  // 3) Load recent attendance
  const { data: attData } = await supabase
    .from("attendance")
    .select("id, date, created_at")
    .eq("player_id", playerId)
    .order("date", { ascending: false })
    .limit(20)

  const attendance = (attData || []) as AttendanceRow[]

  const activePackage = packages.find(
    (p) => p.sessions_used < p.sessions_total,
  )

  return (
    <main className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="w-full max-w-2xl bg-white rounded-xl shadow p-6 space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-semibold">
            {player.first_name} {player.last_name}
          </h1>
          <Link
            href="/players"
            className="text-sm text-blue-600 hover:underline"
          >
            Back to Players
          </Link>
        </div>

        {/* Basic info */}
        <section className="border rounded-md p-3 space-y-1 text-sm">
          <h2 className="text-sm font-semibold mb-1">Player Info</h2>
          <p>
            <span className="text-gray-500 text-xs">Phone: </span>
            {player.phone || "No phone on file"}
          </p>
          {player.notes && (
            <p>
              <span className="text-gray-500 text-xs">Notes: </span>
              {player.notes}
            </p>
          )}
          <p className="text-xs text-gray-400">
            Registered on{" "}
            {new Date(player.created_at).toLocaleDateString()}
          </p>
          <p className="text-xs text-gray-500 mt-1">
            (Later we can add address, parent name, emergency contact, etc.
            here once we add those fields.)
          </p>
        </section>

        {/* Package info */}
        <section className="border rounded-md p-3 space-y-2 text-sm">
          <h2 className="text-sm font-semibold mb-1">Packages</h2>

          {packages.length === 0 ? (
            <p className="text-xs text-gray-500">
              No packages purchased yet.
            </p>
          ) : (
            <>
              {activePackage && (
                <p className="text-xs text-green-700 font-medium">
                  Active package:{" "}
                  {activePackage.sessions_total - activePackage.sessions_used}{" "}
                  sessions remaining (
                  {activePackage.sessions_used}/
                  {activePackage.sessions_total} used)
                </p>
              )}

              <ul className="space-y-1 max-h-40 overflow-y-auto text-xs">
                {packages.map((pkg) => (
                  <li
                    key={pkg.id}
                    className="flex justify-between border-b last:border-b-0 pb-1"
                  >
                    <div>
                      <div>
                        {pkg.sessions_total} sessions — $
                        {(pkg.price_cents / 100).toFixed(2)}
                      </div>
                      <div className="text-gray-500">
                        Used: {pkg.sessions_used} / {pkg.sessions_total}
                      </div>
                    </div>
                    <div className="text-gray-500 text-right">
                      {new Date(pkg.purchased_at).toLocaleDateString()}
                    </div>
                  </li>
                ))}
              </ul>
            </>
          )}
        </section>

        {/* Attendance */}
        <section className="border rounded-md p-3 space-y-2 text-sm">
          <h2 className="text-sm font-semibold mb-1">Recent Attendance</h2>
          {attendance.length === 0 ? (
            <p className="text-xs text-gray-500">
              No attendance recorded yet.
            </p>
          ) : (
            <ul className="space-y-1 max-h-40 overflow-y-auto text-xs">
              {attendance.map((row) => (
                <li
                  key={row.id}
                  className="flex justify-between border-b last:border-b-0 pb-1"
                >
                  <span>
                    {new Date(row.date).toLocaleDateString()}
                  </span>
                  <span className="text-gray-500">
                    {new Date(row.created_at).toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </main>
  )
}
