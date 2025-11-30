import { supabase } from "@/lib/supabaseClient";

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
  // figure out current month range
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth(); // 0 = Jan

  const startOfMonth = new Date(year, month, 1);
  const startOfNextMonth = new Date(year, month + 1, 1);

  const startIso = startOfMonth.toISOString(); // for timestamp columns
  const nextIso = startOfNextMonth.toISOString();
  const startDateStr = startIso.slice(0, 10); // "YYYY-MM-DD"
  const nextDateStr = nextIso.slice(0, 10);

  // 1) Revenue for the month (sum of player_packages.price_cents)
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

  // 2) Expenses for the month (sum of expenses.amount_cents)
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
      <div className="w-full max-w-2xl bg-white rounded-xl shadow p-6 space-y-6">
        <h1 className="text-2xl font-semibold text-center">
          Monthly Summary
        </h1>
        <p className="text-sm text-gray-600 text-center">
          {monthLabel}
        </p>

        {(revenueError || expenseError) && (
          <p className="text-sm text-red-500 text-center">
            Failed to load some data. Revenue error:{" "}
            {revenueError?.message || "none"}. Expenses error:{" "}
            {expenseError?.message || "none"}.
          </p>
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="border rounded-lg p-4 text-center">
            <h2 className="text-xs font-semibold text-gray-500 uppercase">
              Revenue
            </h2>
            <p className="text-xl font-bold mt-1">
              {formatCurrency(totalRevenueCents)}
            </p>
            <p className="text-xs text-gray-500 mt-1">
              From sold packages this month
            </p>
          </div>

          <div className="border rounded-lg p-4 text-center">
            <h2 className="text-xs font-semibold text-gray-500 uppercase">
              Expenses
            </h2>
            <p className="text-xl font-bold mt-1">
              {formatCurrency(totalExpensesCents)}
            </p>
            <p className="text-xs text-gray-500 mt-1">
              Logged in Expenses page
            </p>
          </div>

          <div className="border rounded-lg p-4 text-center">
            <h2 className="text-xs font-semibold text-gray-500 uppercase">
              Profit
            </h2>
            <p
              className={`text-xl font-bold mt-1 ${
                profitCents >= 0 ? "text-green-600" : "text-red-600"
              }`}
            >
              {formatCurrency(profitCents)}
            </p>
            <p className="text-xs text-gray-500 mt-1">
              Revenue − Expenses
            </p>
          </div>
        </div>

        <div className="border rounded-md p-3 space-y-1 text-sm text-gray-600">
          <p>
            Revenue is calculated from{" "}
            <code className="text-xs bg-gray-100 px-1 py-0.5 rounded">
              player_packages.price_cents
            </code>{" "}
            where the purchase date is in this month.
          </p>
          <p>
            Expenses are calculated from{" "}
            <code className="text-xs bg-gray-100 px-1 py-0.5 rounded">
              expenses.amount_cents
            </code>{" "}
            where the expense date is in this month.
          </p>
        </div>
      </div>
    </main>
  );
}
