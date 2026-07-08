"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Leaf,
  LayoutDashboard,
  ScanLine,
  Sprout,
  BellRing,
  Compass,
  Store,
  Settings,
  Moon,
  Sun,
  LogOut,
} from "lucide-react";
import { useTheme } from "./ThemeProvider";
import { logout } from "@/app/(auth)/actions";
import { cn } from "@/lib/utils";

const NAV = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/scan", label: "Scan", icon: ScanLine },
  { href: "/plants", label: "Tanaman", icon: Sprout },
  { href: "/explore", label: "Explore", icon: Compass },
  { href: "/market", label: "Market", icon: Store },
  { href: "/reminders", label: "Reminder", icon: BellRing },
];

export function Navbar({ email }: { email?: string }) {
  const pathname = usePathname();
  const { theme, toggle } = useTheme();

  const isActive = (href: string) => pathname === href || pathname.startsWith(href + "/");

  return (
    <>
      <header className="sticky top-0 z-40 border-b border-black/5 bg-white/80 backdrop-blur-md dark:border-white/10 dark:bg-gray-950/80">
        <div className="mx-auto flex h-16 max-w-5xl items-center justify-between px-4">
          <Link href="/dashboard" className="flex items-center gap-2">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-leaf-700 text-white shadow-soft ring-1 ring-gold-300/30">
              <Leaf className="h-5 w-5" />
            </span>
            <span className="text-lg font-bold tracking-tight">Plant Doctor <span className="text-gold-600 dark:text-gold-300">AI</span></span>
          </Link>

          <nav className="hidden items-center gap-1 md:flex">
            {NAV.map(({ href, label, icon: Icon }) => (
              <Link
                key={href}
                href={href}
                className={cn(
                  "flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition",
                  isActive(href)
                    ? "bg-leaf-100 text-leaf-700 dark:bg-leaf-900/40 dark:text-leaf-200"
                    : "text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800"
                )}
              >
                <Icon className="h-4 w-4" />
                {label}
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-1">
            <button
              onClick={toggle}
              className="rounded-lg p-2 text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800"
              aria-label="Ganti tema"
            >
              {theme === "dark" ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
            </button>
            <Link
              href="/settings"
              className={cn(
                "rounded-lg p-2 transition",
                isActive("/settings")
                  ? "bg-leaf-100 text-leaf-700 dark:bg-leaf-900/40 dark:text-leaf-200"
                  : "text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800"
              )}
              aria-label="Pengaturan"
            >
              <Settings className="h-5 w-5" />
            </Link>
            <form action={logout}>
              <button
                type="submit"
                title={email ? `Keluar (${email})` : "Keluar"}
                className="flex items-center gap-2 rounded-lg p-2 text-gray-500 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-900/20"
              >
                <LogOut className="h-5 w-5" />
              </button>
            </form>
          </div>
        </div>
      </header>

      {/* Bottom nav (mobile) */}
      <nav className="fixed bottom-0 left-0 right-0 z-40 border-t border-black/5 bg-white/90 backdrop-blur-md dark:border-white/10 dark:bg-gray-950/90 md:hidden">
        <div className="mx-auto flex max-w-md items-center justify-around px-2 py-1.5">
          {NAV.map(({ href, label, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex flex-1 flex-col items-center gap-0.5 rounded-lg py-1.5 text-[11px] font-medium transition",
                isActive(href) ? "text-leaf-600" : "text-gray-400"
              )}
            >
              <Icon className="h-5 w-5" />
              {label}
            </Link>
          ))}
        </div>
      </nav>
    </>
  );
}
