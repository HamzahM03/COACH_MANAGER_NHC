"use client";

//register page

import { useState, FormEvent } from "react";
import { supabase } from "@/lib/supabase/client";

export default function RegisterPlayerPage() {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [phone, setPhone] = useState("");
  const [notes, setNotes] = useState("");

  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    setSuccessMsg(null);
    setErrorMsg(null);

    if (!firstName.trim() || !lastName.trim()) {
      setErrorMsg("First name and last name are required.");
      setLoading(false);
      return;
    }

    const { data, error } = await supabase
      .from("players")
      .insert([
        {
          first_name: firstName.trim(),
          last_name: lastName.trim(),
          phone: phone.trim() || null,
          notes: notes.trim() || null,
        },
      ])
      .select()
      .single();

    if (error) {
      console.error(error);
      setErrorMsg(error.message);
    } else {
      setSuccessMsg(
        `Player ${data.first_name} ${data.last_name} registered successfully.`
      );
      // Clear form
      setFirstName("");
      setLastName("");
      setPhone("");
      setNotes("");
    }

    setLoading(false);
  }

  return (
    <main className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="w-full max-w-md bg-white rounded-xl shadow p-6">
        <h1 className="text-2xl font-semibold mb-4 text-center">
          Register Player
        </h1>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm mb-1">First Name *</label>
            <input
              className="w-full border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring focus:ring-blue-200"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              placeholder="e.g. Ali"
              required
            />
          </div>

          <div>
            <label className="block text-sm mb-1">Last Name *</label>
            <input
              className="w-full border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring focus:ring-blue-200"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              placeholder="e.g. Khan"
              required
            />
          </div>

          <div>
            <label className="block text-sm mb-1">Phone</label>
            <input
              className="w-full border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring focus:ring-blue-200"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="Parent phone number"
            />
          </div>

          <div>
            <label className="block text-sm mb-1">Notes</label>
            <textarea
              className="w-full border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring focus:ring-blue-200"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Allergies, injuries, behavior notes, etc."
              rows={3}
            />
          </div>

          {errorMsg && (
            <p className="text-sm text-red-500">
              {errorMsg}
            </p>
          )}

          {successMsg && (
            <p className="text-sm text-green-600">
              {successMsg}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 text-white rounded-md py-2 text-sm font-medium hover:bg-blue-700 disabled:opacity-60"
          >
            {loading ? "Registering..." : "Register Player"}
          </button>
        </form>
      </div>
    </main>
  );
}
