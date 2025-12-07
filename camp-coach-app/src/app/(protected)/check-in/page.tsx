"use client"

// Check-in page

import { useState, FormEvent, useEffect } from "react"
import { createBrowserSupabase } from "@/lib/supabase/client";

const supabase = createBrowserSupabase();

type Player = {
  id: string
  first_name: string
  last_name: string
  phone: string | null
  notes: string | null
}

type PlayerPackage = {
  id: string
  sessions_total: number
  sessions_used: number
}

type TodayCheckIn = {
  id: string
  created_at: string
  date: string
  players: {
    first_name: string
    last_name: string
  } | null
}

export default function CheckInPage() {
  const [query, setQuery] = useState("")
  const [players, setPlayers] = useState<Player[]>([])
  const [selectedPlayer, setSelectedPlayer] = useState<Player | null>(null)

  const [activePackage, setActivePackage] = useState<PlayerPackage | null>(null)

  const [searchLoading, setSearchLoading] = useState(false)
  const [checkInLoading, setCheckInLoading] = useState(false)

  const [errorMsg, setErrorMsg] = useState<string | null>(null)
  const [successMsg, setSuccessMsg] = useState<string | null>(null)

  const [todayCheckIns, setTodayCheckIns] = useState<TodayCheckIn[]>([])
  const [todayLoading, setTodayLoading] = useState(false)

  // Load today's check-ins on page load
  useEffect(() => {
    loadTodayCheckIns()
    
  }, [])

  async function loadTodayCheckIns() {
    setTodayLoading(true)
    

    const today = new Date().toISOString().slice(0, 10) // "YYYY-MM-DD"

    const { data, error } = await supabase
      .from("attendance")
      .select("id, created_at, date, players(first_name,last_name)")
      .eq("date", today)
      .order("created_at", { ascending: false })

    if (error) {
      console.error(error)
      setTodayCheckIns([])
    } else {
      const safeData: TodayCheckIn[] = (data ?? []).map((row: any) => ({
        id: row.id,
        created_at: row.created_at,
        date: row.date,
        // handle both “object” and “array” just in case Supabase types are funky
        players: Array.isArray(row.players)
          ? row.players[0] ?? null
          : row.players ?? null,
      }))

      setTodayCheckIns(safeData)
    }

    setTodayLoading(false)
  }

  async function handleSearch(e: FormEvent) {
    e.preventDefault()
    setErrorMsg(null)
    setSuccessMsg(null)
    setSelectedPlayer(null)
    setActivePackage(null)
    setSearchLoading(true)

    const trimmed = query.trim()
    if (!trimmed) {
      setSearchLoading(false)
      setPlayers([])
      return
    }

    const { data, error } = await supabase
      .from("players")
      .select("*")
      .or(
        `first_name.ilike.%${trimmed}%,last_name.ilike.%${trimmed}%,phone.ilike.%${trimmed}%`,
      )
      .order("first_name", { ascending: true })

    if (error) {
      console.error(error)
      setErrorMsg(error.message)
      setPlayers([])
    } else {
      setPlayers(data || [])
      if ((data || []).length === 0) {
        setErrorMsg("No players found. Try a different name or phone.")
      }
    }

    setSearchLoading(false)
  }

  async function loadActivePackage(playerId: string) {
    setActivePackage(null)

    const { data, error } = await supabase
      .from("player_packages")
      .select("id, sessions_total, sessions_used")
      .eq("player_id", playerId)
      .order("purchased_at", { ascending: true })

    if (error) {
      console.error(error)
      return
    }

    const list = (data || []) as PlayerPackage[]
    const pkg = list.find((p) => p.sessions_used < p.sessions_total)

    if (pkg) {
      setActivePackage(pkg)
    } else {
      setActivePackage(null)
    }
  }

  async function handleSelectPlayer(player: Player) {
    setSelectedPlayer(player)
    setSuccessMsg(null)
    setErrorMsg(null)
    await loadActivePackage(player.id)
  }

  async function handleCheckIn() {
    if (!selectedPlayer) return

    setErrorMsg(null)
    setSuccessMsg(null)
    setCheckInLoading(true)

    // 1) Insert attendance row
    const { error: attendanceError } = await supabase.from("attendance").insert([
      {
        player_id: selectedPlayer.id,
        // date defaults to today
      },
    ])

    if (attendanceError) {
      console.error(attendanceError)
      setErrorMsg(attendanceError.message)
      setCheckInLoading(false)
      return
    }

    // 2) If they have an active package, increment sessions_used
    if (activePackage) {
      const { error: pkgError } = await supabase
        .from("player_packages")
        .update({
          sessions_used: activePackage.sessions_used + 1,
        })
        .eq("id", activePackage.id)

      if (pkgError) {
        console.error(pkgError)
        setErrorMsg(
          "Checked in, but failed to update package sessions. You may want to adjust manually.",
        )
      } else {
        const updated: PlayerPackage = {
          ...activePackage,
          sessions_used: activePackage.sessions_used + 1,
        }
        setActivePackage(updated)
      }
    }

    setSuccessMsg(
      `Checked in ${selectedPlayer.first_name} ${selectedPlayer.last_name} for today.${
        activePackage
          ? " Session deducted from their package."
          : " (No active package on file.)"
      }`,
    )

    // Refresh today's check-ins list
    await loadTodayCheckIns()

    setCheckInLoading(false)
  }

  return (
    <main className="min-h-screen flex items-center justify-center bg-background">
      <div className="w-full max-w-2xl bg-card rounded-xl border border-border shadow p-6 space-y-4">
        <h1 className="text-2xl font-semibold text-center text-foreground">
          Check-In
        </h1>

        {/* Search form */}
        <form onSubmit={handleSearch} className="flex gap-2">
          <input
            className="flex-1 border border-border rounded-md px-3 py-2 text-sm bg-background text-foreground focus:outline-none focus:ring focus:ring-orange-200"
            placeholder="Search by player name or phone..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          <button
            type="submit"
            disabled={searchLoading}
            className="px-4 py-2 text-sm bg-orange-600 text-white rounded-md hover:bg-orange-700 disabled:opacity-60"
          >
            {searchLoading ? "Searching..." : "Search"}
          </button>
        </form>

        {/* Messages */}
        {errorMsg && <p className="text-sm text-red-500">{errorMsg}</p>}
        {successMsg && <p className="text-sm text-green-600">{successMsg}</p>}

        {/* Search results */}
        <div className="border border-border rounded-md max-h-60 overflow-y-auto bg-background">
          {players.length === 0 ? (
            <p className="p-3 text-sm text-muted-foreground">
              No players loaded yet. Search to see results.
            </p>
          ) : (
            <ul className="divide-y divide-border">
              {players.map((player) => (
                <li
                  key={player.id}
                  className={`p-3 text-sm cursor-pointer flex justify-between items-center ${
                    selectedPlayer?.id === player.id
                      ? "bg-orange-50"
                      : "hover:bg-accent"
                  }`}
                  onClick={() => {
                    if (selectedPlayer?.id === player.id) {
                      setSelectedPlayer(null)
                      setActivePackage(null)
                      setSuccessMsg(null)
                      setErrorMsg(null)
                    } else {
                      handleSelectPlayer(player)
                    }
                  }}
                >
                  <div className="text-foreground">
                    <div className="font-medium">
                      {player.first_name} {player.last_name}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {player.phone || "No phone on file"}
                    </div>
                    {player.notes && (
                      <div className="text-xs text-muted-foreground">
                        Notes: {player.notes}
                      </div>
                    )}
                  </div>
                  {selectedPlayer?.id === player.id && (
                    <span className="text-xs text-orange-600 font-semibold">
                      Selected
                    </span>
                  )}
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Selected player + check-in button + package info */}
        <div className="border border-border rounded-md p-3 space-y-2 bg-background">
          <h2 className="text-sm font-semibold text-foreground">
            Selected Player
          </h2>
          {selectedPlayer ? (
            <>
              <p className="text-sm text-foreground">
                {selectedPlayer.first_name} {selectedPlayer.last_name}
              </p>
              <p className="text-xs text-muted-foreground">
                Phone: {selectedPlayer.phone || "No phone"}
              </p>
              {selectedPlayer.notes && (
                <p className="text-xs text-muted-foreground">
                  Notes: {selectedPlayer.notes}
                </p>
              )}

              <div className="mt-2 text-xs text-foreground">
                {activePackage ? (
                  <p>
                    Package sessions:{" "}
                    <strong>
                      {activePackage.sessions_used} /{" "}
                      {activePackage.sessions_total}
                    </strong>{" "}
                    used (
                    {activePackage.sessions_total -
                      activePackage.sessions_used}{" "}
                    remaining)
                  </p>
                ) : (
                  <p className="text-muted-foreground">
                    No active package with remaining sessions. This will be a
                    drop-in unless they buy a package.
                  </p>
                )}
              </div>

              <button
                onClick={handleCheckIn}
                disabled={checkInLoading}
                className="mt-3 w-full bg-green-600 text-white rounded-md py-2 text-sm font-medium hover:bg-green-700 disabled:opacity-60"
              >
                {checkInLoading ? "Checking in..." : "Check In for Today"}
              </button>
            </>
          ) : (
            <p className="text-xs text-muted-foreground">
              No player selected. Click a player from the list above.
            </p>
          )}
        </div>

        {/* Today's check-ins */}
        <div className="border border-border rounded-md p-3 space-y-2 bg-background text-foreground">
          <h2 className="text-sm font-semibold">Today&apos;s Check-Ins</h2>
          {todayLoading ? (
            <p className="text-xs text-muted-foreground">Loading...</p>
          ) : todayCheckIns.length === 0 ? (
            <p className="text-xs text-muted-foreground">
              Nobody checked in yet today.
            </p>
          ) : (
            <ul className="space-y-1 max-h-40 overflow-y-auto text-xs">
              {todayCheckIns.map((entry) => {
                const player = entry.players

                return (
                  <li key={entry.id} className="flex justify-between">
                    <span>
                      {player
                        ? `${player.first_name} ${player.last_name}`
                        : "Unknown player"}
                    </span>
                    <span className="text-muted-foreground">
                      {new Date(entry.created_at).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                  </li>
                )
              })}
            </ul>
          )}
        </div>
      </div>
    </main>
  )
}
