"use client";

import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { GlassWater, Menu, X, ChevronDown } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";

export function Navbar() {
  const { data: session } = useSession();
  const [menuOpen, setMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  const role = session?.user?.role;

  const dashboardHref =
    role === "ADMIN"
      ? "/admin"
      : role === "BARTENDER"
        ? "/bartender"
        : "/dashboard";

  return (
    <header className="sticky top-0 z-50 bg-white border-b border-stone-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link
            href="/"
            className="flex items-center gap-2 font-bold text-stone-900 hover:text-amber-600 transition-colors"
          >
            <GlassWater className="w-6 h-6 text-amber-500" />
            <span>HomeBarMenu</span>
          </Link>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-6">
            {session ? (
              <>
                <Link
                  href={dashboardHref}
                  className="text-sm font-medium text-stone-600 hover:text-stone-900 transition-colors"
                >
                  Dashboard
                </Link>

                {/* User menu */}
                <div className="relative">
                  <button
                    onClick={() => setUserMenuOpen(!userMenuOpen)}
                    className="flex items-center gap-1.5 text-sm font-medium text-stone-600 hover:text-stone-900 transition-colors"
                  >
                    <span>{session.user.name ?? session.user.email}</span>
                    <ChevronDown className="w-4 h-4" />
                  </button>

                  {userMenuOpen && (
                    <div className="absolute right-0 mt-2 w-44 bg-white rounded-lg border border-stone-200 shadow-lg py-1 z-50">
                      <div className="px-3 py-2 text-xs text-stone-400 border-b border-stone-100">
                        {role}
                      </div>
                      <button
                        onClick={() => signOut({ callbackUrl: "/" })}
                        className="w-full text-left px-3 py-2 text-sm text-stone-700 hover:bg-stone-50 transition-colors"
                      >
                        Sign out
                      </button>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <>
                <Link href="/auth/signin">
                  <Button variant="ghost" size="sm">
                    Sign in
                  </Button>
                </Link>
                <Link href="/auth/signup">
                  <Button size="sm">Get started</Button>
                </Link>
              </>
            )}
          </nav>

          {/* Mobile menu toggle */}
          <button
            className="md:hidden p-2 text-stone-600 hover:text-stone-900"
            onClick={() => setMenuOpen(!menuOpen)}
          >
            {menuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="md:hidden border-t border-stone-200 bg-white px-4 py-3 space-y-2">
          {session ? (
            <>
              <Link
                href={dashboardHref}
                className="block py-2 text-sm font-medium text-stone-700"
                onClick={() => setMenuOpen(false)}
              >
                Dashboard
              </Link>
              <button
                onClick={() => signOut({ callbackUrl: "/" })}
                className="block w-full text-left py-2 text-sm text-stone-700"
              >
                Sign out
              </button>
            </>
          ) : (
            <>
              <Link
                href="/auth/signin"
                className="block py-2 text-sm font-medium text-stone-700"
                onClick={() => setMenuOpen(false)}
              >
                Sign in
              </Link>
              <Link
                href="/auth/signup"
                className="block py-2 text-sm font-medium text-amber-600"
                onClick={() => setMenuOpen(false)}
              >
                Get started
              </Link>
            </>
          )}
        </div>
      )}
    </header>
  );
}
