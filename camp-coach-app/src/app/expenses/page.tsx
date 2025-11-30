"use client";

import { useEffect, useState, FormEvent } from "react";
import { supabase } from "@/lib/supabaseClient";

type Expense = {
  id: string;
  date: string;
  category: string;
  description: string | null;
  amount_cents: number;
  created_at: string;
};


export default function ExpensesPage() {
  const [date, setDate] = useState<string>(() => {
    return new Date().toISOString().slice(0, 10); // YYYY-MM-DD
  });
  const [category, setCategory] = useState<string>("");
  const [description, setDescription] = useState<string>("");
  const [amountDollars, setAmountDollars] = useState<string>("");

  const [loading, setLoading] = useState(false);
  const [listLoading, setListLoading] = useState(false);
  const [expenses, setExpenses] = useState<Expense[]>([]);

  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  useEffect(() => {
    loadExpenses();
  }, []);

  async function loadExpenses() {
    setListLoading(true);
    setErrorMsg(null);

    const { data, error } = await supabase
      .from("expenses")
      .select("*")
      .order("date", { ascending: false })
      .order("created_at", { ascending: false })
      .limit(50);

    if (error) {
      console.error(error);
      setErrorMsg(error.message);
      setExpenses([]);
    } else {
      setExpenses((data || []) as Expense[]);
    }

    setListLoading(false);
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    if (!category.trim()) {
      setErrorMsg("Please select a category.");
      return;
    }

    const parsed = parseFloat(amountDollars);
    if (isNaN(parsed) || parsed <= 0) {
      setErrorMsg("Please enter a valid amount in dollars.");
      return;
    }

    const amountCents = Math.round(parsed * 100);

    setLoading(true);

    const { error } = await supabase.from("expenses").insert([
      {
        date,
        category: category.trim(),
        description: description.trim() || null,
        amount_cents: amountCents,
      },
    ]);

    if (error) {
      console.error(error);
      setErrorMsg(error.message);
    } else {
      setSuccessMsg("Expense recorded.");
      setDescription("");
      setAmountDollars("");
      await loadExpenses();
    }

    setLoading(false);
  }

  return (
    <main className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="w-full max-w-2xl bg-white rounded-xl shadow p-6 space-y-4">
        <h1 className="text-2xl font-semibold text-center">Expenses</h1>

        <form onSubmit={handleSubmit} className="space-y-3">
          <div className="flex gap-2">
            <div className="flex-1">
              <label className="block text-xs mb-1">Date</label>
              <input
                type="date"
                className="w-full border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring focus:ring-blue-200"
                value={date}
                onChange={(e) => setDate(e.target.value)}
              />
            </div>

            <div className="flex-1">

              <div className="flex-1">
                <label className="block text-xs mb-1">Category</label>
                <input
                    className="w-full border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring focus:ring-blue-200"
                    placeholder="e.g. Gym Rent, Basketballs, Snacks..."
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                />
              </div>

            </div>
          </div>

          <div>
            <label className="block text-xs mb-1">Description (optional)</label>
            <input
              className="w-full border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring focus:ring-blue-200"
              placeholder="e.g. March gym rent, 10 new basketballs..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          <div>
            <label className="block text-xs mb-1">Amount (USD)</label>
            <input
              className="w-full border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring focus:ring-blue-200"
              placeholder="e.g. 50.00"
              value={amountDollars}
              onChange={(e) => setAmountDollars(e.target.value)}
            />
          </div>

          {errorMsg && (
            <p className="text-sm text-red-500">{errorMsg}</p>
          )}
          {successMsg && (
            <p className="text-sm text-green-600">{successMsg}</p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-purple-600 text-white rounded-md py-2 text-sm font-medium hover:bg-purple-700 disabled:opacity-60"
          >
            {loading ? "Saving..." : "Add Expense"}
          </button>
        </form>

        <div className="border rounded-md p-3 space-y-2">
          <h2 className="text-sm font-semibold">Recent Expenses</h2>

          {listLoading ? (
            <p className="text-xs text-gray-500">Loading...</p>
          ) : expenses.length === 0 ? (
            <p className="text-xs text-gray-500">
              No expenses recorded yet.
            </p>
          ) : (
            <ul className="max-h-64 overflow-y-auto space-y-1 text-xs">
              {expenses.map((exp) => (
                <li
                  key={exp.id}
                  className="flex justify-between items-start border-b last:border-b-0 pb-1"
                >
                  <div>
                    <div className="font-medium">
                      {exp.category}
                    </div>
                    <div className="text-gray-500">
                      {exp.description || "No description"}
                    </div>
                  </div>
                  <div className="text-right text-gray-500">
                    <div>
                      ${ (exp.amount_cents / 100).toFixed(2) }
                    </div>
                    <div>
                      {new Date(exp.date).toLocaleDateString()}
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </main>
  );
}
