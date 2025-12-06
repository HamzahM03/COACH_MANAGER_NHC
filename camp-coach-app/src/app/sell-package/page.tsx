"use client";

//sell package page

import { useEffect, useState, FormEvent } from "react";
import { supabase } from "@/lib/supabase/client";
import { Player} from "@/types/players"



type Package = {
  id: string;
  name: string;
  sessions_included: number;
  price_cents: number;
};

export default function SellPackagePage() {
  const [players, setPlayers] = useState<Player[]>([]);
  const [packages, setPackages] = useState<Package[]>([]);
  const [query, setQuery] = useState("");
  const [selectedPlayer, setSelectedPlayer] = useState<Player | null>(null);
  const [selectedPackageId, setSelectedPackageId] = useState<string>("");

  const [loadingPlayers, setLoadingPlayers] = useState(false);
  const [loadingPackages, setLoadingPackages] = useState(false);
  const [saving, setSaving] = useState(false);

  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Load packages once on mount
  useEffect(() => {
    async function loadPackages() {
      setLoadingPackages(true);
      const { data, error } = await supabase
        .from("packages")
        .select("*")
        .order("sessions_included", { ascending: true });

      if (error) {
        console.error(error);
        setErrorMsg(error.message);
      } else {
        setPackages(data || []);
      }

      setLoadingPackages(false);
    }

    loadPackages();
  }, []);

  // Search players
  async function handleSearch(e: FormEvent) {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);
    setSelectedPlayer(null);
    setLoadingPlayers(true);

    const trimmed = query.trim();
    if (!trimmed) {
      setLoadingPlayers(false);
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
        setErrorMsg("No players found. Try another name/phone.");
      }
    }

    setLoadingPlayers(false);
  }

  async function handleSellPackage() {
    setErrorMsg(null);
    setSuccessMsg(null);

    if (!selectedPlayer) {
      setErrorMsg("Select a player first.");
      return;
    }

    if (!selectedPackageId) {
      setErrorMsg("Select a package to sell.");
      return;
    }

    const pkg = packages.find((p) => p.id === selectedPackageId);
    if (!pkg) {
      setErrorMsg("Selected package not found.");
      return;
    }

    setSaving(true);

    const { error } = await supabase.from("player_packages").insert([
      {
        player_id: selectedPlayer.id,
        package_id: pkg.id,
        sessions_total: pkg.sessions_included,
        sessions_used: 0,
        price_cents: pkg.price_cents,
      },
    ]);

    if (error) {
      console.error(error);
      setErrorMsg(error.message);
    } else {
      setSuccessMsg(
        `Sold ${pkg.name} to ${selectedPlayer.first_name} ${selectedPlayer.last_name}.`
      );
    }

    setSaving(false);
  }

  return (
    <main className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="w-full max-w-2xl bg-white rounded-xl shadow p-6 space-y-4">
        <h1 className="text-2xl font-semibold text-center">Sell Package</h1>

        {/* Search player */}
        <form onSubmit={handleSearch} className="flex gap-2">
          <input
            className="flex-1 border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring focus:ring-blue-200"
            placeholder="Search player by name or phone..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          <button
            type="submit"
            disabled={loadingPlayers}
            className="px-4 py-2 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-60"
          >
            {loadingPlayers ? "Searching..." : "Search"}
          </button>
        </form>

        {errorMsg && <p className="text-sm text-red-500">{errorMsg}</p>}
        {successMsg && <p className="text-sm text-green-600">{successMsg}</p>}

        {/* Player results */}
        <div className="border rounded-md max-h-40 overflow-y-auto">
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

        {/* Package select */}
        <div className="border rounded-md p-3 space-y-2">
          <h2 className="text-sm font-semibold">Select Package</h2>

          {loadingPackages ? (
            <p className="text-xs text-gray-500">Loading packages…</p>
          ) : packages.length === 0 ? (
            <p className="text-xs text-gray-500">
              No packages found. Check your database seeding.
            </p>
          ) : (
            <select
              className="w-full border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring focus:ring-blue-200"
              value={selectedPackageId}
              onChange={(e) => setSelectedPackageId(e.target.value)}
            >
              <option value="">Choose a package…</option>
              {packages.map((pkg) => (
                <option key={pkg.id} value={pkg.id}>
                  {pkg.name} — {pkg.sessions_included} sessions — $
                  {(pkg.price_cents / 100).toFixed(2)}
                </option>
              ))}
            </select>
          )}
        </div>

        {/* Action button */}
        <button
          onClick={handleSellPackage}
          disabled={saving}
          className="w-full bg-green-600 text-white rounded-md py-2 text-sm font-medium hover:bg-green-700 disabled:opacity-60"
        >
          {saving ? "Saving..." : "Sell Package"}
        </button>
      </div>
    </main>
  );
}
