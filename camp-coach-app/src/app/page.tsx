import Link from "next/link";

export default function Home() {
  return (
    <main className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="w-full max-w-md bg-white rounded-xl shadow p-6 space-y-4">
        <h1 className="text-2xl font-semibold text-center">
          Camp Coach Dashboard
        </h1>
        <p className="text-sm text-gray-600 text-center">
          Choose an action to manage players and sessions.
        </p>

        <div className="space-y-2">
          <Link
            href="/register"
            className="block w-full text-center bg-blue-600 text-white rounded-md py-2 text-sm font-medium hover:bg-blue-700"
          >
            Register Player
          </Link>

          <Link
            href="/check-in"
            className="block w-full text-center bg-green-600 text-white rounded-md py-2 text-sm font-medium hover:bg-green-700"
          >
            Check-In
          </Link>

          <Link
            href="/sell-package"
            className="block w-full text-center bg-purple-600 text-white rounded-md py-2 text-sm font-medium hover:bg-purple-700"
          >
            Sell Package
          </Link>

          <Link
            href="/players"
            className="block w-full text-center bg-gray-800 text-white rounded-md py-2 text-sm font-medium hover:bg-gray-900"
          >
            View All Players
          </Link>

          <Link
            href="/expenses"
            className="block w-full text-center bg-orange-600 text-white rounded-md py-2 text-sm font-medium hover:bg-orange-700"
          >
            Track Expenses
        </Link>
        <Link
          href="/summary"
          className="block w-full text-center bg-orange-600 text-white rounded-md py-2 text-sm font-medium hover:bg-orange-700"
        >
          Monthly Summary & Profit
        </Link>


        </div>
      </div>
    </main>
  );
}
