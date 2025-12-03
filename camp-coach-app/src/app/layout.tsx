import "./globals.css";
import Link from "next/link";

export const metadata = {
  title: "Camp Coach App",
  description: "Manage athletes, sessions, packages, and attendance",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-background text-foreground">
        <nav className="w-full border-b border-[var(--border-color)] bg-background sticky top-0 z-20">
          <div className="max-w-5xl mx-auto flex items-center gap-6 px-4 py-3 text-sm">
            {/* Logo / Home */}
            <Link href="/" className="font-semibold hover:underline">
              Camp Coach
            </Link>

            {/* Main nav links */}
            <div className="flex gap-4">
              <Link href="/register" className="text-white-600 hover:underline">
                Register
              </Link>
              <Link href="/sell-package" className="hover:underline">
                Sell Package
              </Link>
              <Link href="/check-in" className="hover:underline">
                Check-In
              </Link>
              <Link href="/players" className="hover:underline">
                Players
              </Link>
              <Link href="/expenses" className="hover:underline">
                Expenses
              </Link>
              <Link href="/summary" className="hover:underline">
                Summary
              </Link>
            </div>
          </div>
        </nav>

        {/* Page content */}
        <div className="pt-4">{children}</div>
      </body>
    </html>
  );
}
