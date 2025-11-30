"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabaseClient";


type Player = {
  id: string;
  first_name: string;
  last_name: string;
  phone: string | null;
  notes: string | null;
  created_at: string;
};

type PlayerPackage = {
  sessions_total: number;
  sessions_used: number;
};

type PlayerWithPackage = Player & {
  activePackage: PlayerPackage | null;
};

export default function PlayersPage() {
  const [players, setPlayers] = useState<PlayerWithPackage[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [query, setQuery] = useState("");

  useEffect(() => {
    async function loadPlayers() {
      setLoading(true);
      setErrorMsg(null);

      // 1) Get all players
      const { data: playersData, error } = await supabase
        .from("players")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) {
        console.error(error);
        setErrorMsg(error.message);
        setPlayers([]);
        setLoading(false);
        return;
      }

      const basePlayers = (playersData || []) as Player[];

      // 2) For each player, get their active package (if any)
      const withPackages = await Promise.all(
        basePlayers.map(async (player) => {
          const { data: pkgs } = await supabase
            .from("player_packages")
            .select("sessions_total, sessions_used, purchased_at")
            .eq("player_id", player.id)
            .order("purchased_at", { ascending: false });

          const active =
            pkgs?.find((p) => p.sessions_used < p.sessions_total) || null;

          return {
            ...player,
            activePackage: active as PlayerPackage | null,
          };
        })
      );

      setPlayers(withPackages);
      setLoading(false);
    }

    loadPlayers();
  }, []);

  // simple client-side filter
  const trimmedQuery = query.trim().toLowerCase();
  const filteredPlayers =
    trimmedQuery === ""
      ? players
      : players.filter((p) => {
          const fullName = `${p.first_name} ${p.last_name}`.toLowerCase();
          const phone = (p.phone || "").toLowerCase();
          return (
            fullName.includes(trimmedQuery) || phone.includes(trimmedQuery)
          );
        });

  return (
    <main className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="w-full max-w-2xl bg-white rounded-xl shadow p-6 space-y-4">
        <h1 className="text-2xl font-semibold text-center">All Players</h1>

        {/* Search bar */}
        <div className="flex gap-2">
          <input
            className="flex-1 border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring focus:ring-blue-200"
            placeholder="Search by name or phone..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>

        {errorMsg && (
          <p className="text-sm text-red-500">Failed to load players: {errorMsg}</p>
        )}

        {loading ? (
          <p className="text-sm text-gray-500">Loading players…</p>
        ) : filteredPlayers.length === 0 ? (
          <p className="text-sm text-gray-500">
            No players found. Try a different search or register a new player.
          </p>
        ) : (
          <ul className="divide-y max-h-[480px] overflow-y-auto">
            {filteredPlayers.map((player) => (
              <li
                key={player.id}
                className="py-3 text-sm flex justify-between items-start"
              >
              <div>
                <Link
                  href={`/players/${player.id}`}
                  className="font-medium hover:underline"
                >
                  {player.first_name} {player.last_name}
                </Link>

                <div className="text-xs text-gray-500">
                  {player.phone || "No phone on file"}
                </div>

                {player.notes && (
                  <div className="text-xs text-gray-400">
                    Notes: {player.notes}
                  </div>
                )}

                <div className="mt-1 text-xs">
                  {player.activePackage ? (
                    <span className="text-green-600 font-medium">
                      {player.activePackage.sessions_total -
                        player.activePackage.sessions_used}{" "}
                      sessions remaining
                    </span>
                  ) : (
                    <span className="text-red-500">No active package</span>
                  )}
                </div>
              </div>

              <div className="text-xs text-gray-400 text-right">
                {new Date(player.created_at).toLocaleDateString()}
              </div>
            </li>

            ))}
          </ul>
        )}
      </div>
    </main>
  );
}
