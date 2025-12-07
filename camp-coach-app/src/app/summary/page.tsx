// app/summary/page.tsx (or wherever it lives)
import { createServerSupabase } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

type RevenueRow = {
  price_cents: number;
  purchased_at: string;
};

type ExpenseRow = {
  amount_cents: number;
  date: string;
};

function formatCurrency(cents: number) {
  return `$${(cents / 100).toFixed(2)}`;
}

export default async function SummaryPage() {
  const supabase = await createServerSupabase(); // 👈 await now

  // 🔒 enforce login on server side
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // ... your existing summary logic below ...
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth();

  const startOfMonth = new Date(year, month, 1);
  const startOfNextMonth = new Date(year, month + 1, 1);

  const startIso = startOfMonth.toISOString();
  const nextIso = startOfNextMonth.toISOString();
  const startDateStr = startIso.slice(0, 10);
  const nextDateStr = nextIso.slice(0, 10);

  const { data: revenueData, error: revenueError } = await supabase
    .from("player_packages")
    .select("price_cents, purchased_at")
    .gte("purchased_at", startIso)
    .lt("purchased_at", nextIso);

  const revenueRows = (revenueData || []) as RevenueRow[];
  const totalRevenueCents = revenueRows.reduce(
    (sum, row) => sum + (row.price_cents || 0),
    0
  );

  const { data: expenseData, error: expenseError } = await supabase
    .from("expenses")
    .select("amount_cents, date")
    .gte("date", startDateStr)
    .lt("date", nextDateStr);

  const expenseRows = (expenseData || []) as ExpenseRow[];
  const totalExpensesCents = expenseRows.reduce(
    (sum, row) => sum + (row.amount_cents || 0),
    0
  );

  const profitCents = totalRevenueCents - totalExpensesCents;

  const monthLabel = startOfMonth.toLocaleString("default", {
    month: "long",
    year: "numeric",
  });

  return (
    <main className="min-h-screen flex items-center justify-center bg-gray-50">
      {/* your existing JSX from before */}
    </main>
  );
}
