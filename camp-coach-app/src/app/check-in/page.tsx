"use client";

import { useState, FormEvent } from "react";
import { supabase } from "@/lib/supabaseClient";

type Player = {
  id: string;
  first_name: string;
  last_name: string;
  phone: string | null;
  notes: string | null;
};

export default function CheckInPage() {
  const [query, setQuery] = useState("");
  const [players, setPlayers] = useState<Player[]>([]);
  const [selectedPlayer, setSelectedPlayer] = useState<Player | null>(null);

  const [searchLoading, setSearchLoading] = useState(false);
  const [checkInLoading, setCheckInLoading] = useState(false);

  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  async function handleSearch(e: FormEvent) {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);
    setSelectedPlayer(null);
    setSearchLoading(true);

    const trimmed = query.trim();
    if (!trimmed) {
      setSearchLoading(false);
      setPlayers([]);
      return;
    }

    const { data, error } = await supabase
      .from("players")
      .select("*")
      .or(
        `first_name.ilike.%${trimmed}%,last_name.ilike.%${trimmed}%,phone.ilike.%${trimmed}%`
      )
      .order("first_name", { ascending: true });

    if (error) {
      console.error(error);
      setErrorMsg(error.message);
      setPlayers([]);
    } else {
      setPlayers(data || []);
      if ((data || []).length === 0) {
        setErrorMsg("No players found. Try a different name or phone.");
      }
    }

    setSearchLoading(false);
  }

  async function handleCheckIn() {
    if (!selectedPlayer) return;

    setErrorMsg(null);
    setSuccessMsg(null);
    setCheckInLoading(true);

    const { error } = await supabase.from("attendance").insert([
      {
        player_id: selectedPlayer.id,
        // date will default to today
      },
    ]);

    if (error) {
      console.error(error);
      setErrorMsg(error.message);
    } else {
      setSuccessMsg(
        `Checked in ${selectedPlayer.first_name} ${selectedPlayer.last_name} for today.`
      );
    }

    setCheckInLoading(false);
  }

  return (
    <main className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="w-full max-w-2xl bg-white rounded-xl shadow p-6 space-y-4">
        <h1 className="text-2xl font-semibold text-center">Check-In</h1>

        {/* Search form */}
        <form onSubmit={handleSearch} className="flex gap-2">
          <input
            className="flex-1 border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring focus:ring-blue-200"
            placeholder="Search by player name or phone..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          <button
            type="submit"
            disabled={searchLoading}
            className="px-4 py-2 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-60"
          >
            {searchLoading ? "Searching..." : "Search"}
          </button>
        </form>

        {/* Messages */}
        {errorMsg && <p className="text-sm text-red-500">{errorMsg}</p>}
        {successMsg && <p className="text-sm text-green-600">{successMsg}</p>}

        {/* Search results */}
        <div className="border rounded-md max-h-60 overflow-y-auto">
          {players.length === 0 ? (
            <p className="p-3 text-sm text-gray-500">
              No players loaded yet. Search to see results.
            </p>
          ) : (
            <ul className="divide-y">
              {players.map((player) => (
                <li
                  key={player.id}
                  className={`p-3 text-sm cursor-pointer flex justify-between items-center ${
                    selectedPlayer?.id === player.id
                      ? "bg-blue-50"
                      : "hover:bg-gray-50"
                  }`}
                  onClick={() => {
                    setSelectedPlayer(player);
                    setSuccessMsg(null);
                    setErrorMsg(null);
                  }}
                >
                  <div>
                    <div className="font-medium">
                      {player.first_name} {player.last_name}
                    </div>
                    <div className="text-xs text-gray-500">
                      {player.phone || "No phone on file"}
                    </div>
                    {player.notes && (
                      <div className="text-xs text-gray-400">
                        Notes: {player.notes}
                      </div>
                    )}
                  </div>
                  {selectedPlayer?.id === player.id && (
                    <span className="text-xs text-blue-600 font-semibold">
                      Selected
                    </span>
                  )}
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Selected player + check-in button */}
        <div className="border rounded-md p-3 space-y-2">
          <h2 className="text-sm font-semibold">Selected Player</h2>
          {selectedPlayer ? (
            <>
              <p className="text-sm">
                {selectedPlayer.first_name} {selectedPlayer.last_name}
              </p>
              <p className="text-xs text-gray-500">
                Phone: {selectedPlayer.phone || "No phone"}
              </p>
              {selectedPlayer.notes && (
                <p className="text-xs text-gray-500">
                  Notes: {selectedPlayer.notes}
                </p>
              )}

              <button
                onClick={handleCheckIn}
                disabled={checkInLoading}
                className="mt-2 w-full bg-green-600 text-white rounded-md py-2 text-sm font-medium hover:bg-green-700 disabled:opacity-60"
              >
                {checkInLoading ? "Checking in..." : "Check In for Today"}
              </button>
            </>
          ) : (
            <p className="text-xs text-gray-500">
              No player selected. Click a player from the list above.
            </p>
          )}
        </div>
      </div>
    </main>
  );
}
