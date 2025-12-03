import type React from "react"
import Link from "next/link"
import { CheckCircle2, UserPlus, Package, Users, DollarSign, BarChart3, Calendar } from "lucide-react"

export default function Home() {
  return (
    <div className="min-h-[calc(100vh-4rem)] bg-background">
      {/* Hero Section */}
      <div className="border-b border-border bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-white">
        <div className="max-w-7xl mx-auto px-6 py-12 md:py-16">
          <div className="max-w-3xl">
            <h1 className="text-4xl md:text-5xl font-bold mb-4 tracking-tight text-balance">HoopFlow Dashboard</h1>
            <p className="text-xl text-slate-300 text-pretty leading-relaxed">
              Streamline your basketball camp operations with quick access to player management, attendance tracking,
              and financial insights.
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8 md:py-12">
        {/* Quick Actions */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold mb-6 text-foreground">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <ActionCard
              href="/check-in"
              title="Check-In"
              description="Mark player attendance for today's session"
              icon={<CheckCircle2 className="w-6 h-6" />}
              variant="primary"
              featured
            />
            <ActionCard
              href="/register"
              title="Register Player"
              description="Add new players to your camp roster"
              icon={<UserPlus className="w-6 h-6" />}
              variant="secondary"
            />
            <ActionCard
              href="/sell-package"
              title="Sell Package"
              description="Assign session packages to players"
              icon={<Package className="w-6 h-6" />}
              variant="secondary"
            />
          </div>
        </div>

        {/* Management & Analytics */}
        <div>
          <h2 className="text-2xl font-bold mb-6 text-foreground">Management & Reports</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <ActionCard
              href="/players"
              title="Players"
              description="View and manage all registered players"
              icon={<Users className="w-5 h-5" />}
              variant="outline"
              compact
            />
            <ActionCard
              href="/expenses"
              title="Expenses"
              description="Log and track camp expenses"
              icon={<DollarSign className="w-5 h-5" />}
              variant="outline"
              compact
            />
            <ActionCard
              href="/summary"
              title="Summary"
              description="Monthly revenue and profit reports"
              icon={<BarChart3 className="w-5 h-5" />}
              variant="outline"
              compact
            />
            <ActionCard
              href="/attendance"
              title="Attendance Log"
              description="Review past check-ins and no-shows"
              icon={<CheckCircle2 className="w-5 h-5" />}
              variant="outline"
              compact
            />
          </div>
        </div>


        {/* Stats Overview */}
        <div className="mt-12 grid grid-cols-2 md:grid-cols-4 gap-4">
          <StatCard label="Registered Players" value="—" />
          <StatCard label="Today's Check-ins" value="—" trend="+0" />
          <StatCard label="Packages Sold (This Week)" value="—" />
          <StatCard label="This Month Revenue" value="—" trend="—" />
        </div>

      </div>
    </div>
  )
}

// Action Card Component
function ActionCard({
  href,
  title,
  description,
  icon,
  variant = "secondary",
  featured = false,
  compact = false,
}: {
  href: string
  title: string
  description: string
  icon: React.ReactNode
  variant?: "primary" | "secondary" | "outline"
  featured?: boolean
  compact?: boolean
}) {
  const variantStyles = {
    primary:
      "bg-gradient-to-br from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white border-transparent shadow-lg shadow-orange-500/20",
    secondary: "bg-card hover:bg-accent border-border text-foreground",
    outline: "bg-card hover:bg-accent border-border text-foreground",
  }

  return (
    <Link
      href={href}
      className={`group block rounded-xl border transition-all duration-200 ${
        variantStyles[variant]
      } ${featured ? "ring-2 ring-orange-500 ring-offset-2 ring-offset-background" : ""}`}
    >
      <div className={compact ? "p-5" : "p-6"}>
        <div className="flex items-start gap-4">
          <div className={`${variant === "primary" ? "text-white" : "text-foreground"} ${compact ? "mt-0.5" : "mt-1"}`}>
            {icon}
          </div>
          <div className="flex-1 min-w-0">
            <h3
              className={`font-semibold mb-1 group-hover:opacity-80 transition-opacity ${
                compact ? "text-base" : "text-lg"
              } ${variant === "primary" ? "text-white" : "text-foreground"}`}
            >
              {title}
            </h3>
            <p
              className={`leading-relaxed ${
                compact ? "text-xs" : "text-sm"
              } ${variant === "primary" ? "text-orange-50" : "text-muted-foreground"}`}
            >
              {description}
            </p>
          </div>
        </div>
      </div>
    </Link>
  )
}

// Stat Card Component
function StatCard({
  label,
  value,
  trend,
}: {
  label: string
  value: string
  trend?: string
}) {
  return (
    <div className="bg-card rounded-xl border border-border p-5 hover:shadow-md transition-shadow">
      <p className="text-sm text-muted-foreground mb-2">{label}</p>
      <div className="flex items-baseline gap-2">
        <p className="text-3xl font-bold text-foreground">{value}</p>
        {trend && (
          <span className={`text-xs font-medium ${trend.startsWith("+") ? "text-green-600" : "text-muted-foreground"}`}>
            {trend}
          </span>
        )}
      </div>
    </div>
  )
}
