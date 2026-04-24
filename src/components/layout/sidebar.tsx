"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  BookOpen,
  UtensilsCrossed,
  ListOrdered,
  Users,
  GlassWater,
  Settings,
  ChefHat,
} from "lucide-react";

interface NavItem {
  href: string;
  label: string;
  icon: React.ElementType;
}

const creatorNav: NavItem[] = [
  { href: "/dashboard", label: "Overview", icon: LayoutDashboard },
  { href: "/dashboard/recipes", label: "Recipes", icon: BookOpen },
  { href: "/dashboard/ingredients", label: "Ingredients", icon: UtensilsCrossed },
  { href: "/dashboard/menus", label: "Menus", icon: ListOrdered },
  { href: "/dashboard/settings", label: "Bar Settings", icon: Settings },
];

const bartenderNav: NavItem[] = [
  { href: "/bartender", label: "Overview", icon: LayoutDashboard },
  { href: "/bartender/recipes", label: "Recipes", icon: BookOpen },
];

const adminNav: NavItem[] = [
  { href: "/admin", label: "Overview", icon: LayoutDashboard },
  { href: "/admin/bars", label: "Bars", icon: GlassWater },
  { href: "/admin/users", label: "Users", icon: Users },
  { href: "/admin/classics", label: "Classic Cocktails", icon: ChefHat },
];

interface SidebarProps {
  role: "CREATOR" | "BARTENDER" | "ADMIN";
}

export function Sidebar({ role }: SidebarProps) {
  const pathname = usePathname();

  const nav =
    role === "ADMIN"
      ? adminNav
      : role === "BARTENDER"
        ? bartenderNav
        : creatorNav;

  return (
    <aside className="w-56 shrink-0 hidden md:flex flex-col gap-1 py-6">
      {nav.map((item) => {
        const Icon = item.icon;
        const active =
          item.href === "/dashboard" ||
          item.href === "/bartender" ||
          item.href === "/admin"
            ? pathname === item.href
            : pathname.startsWith(item.href);

        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
              active
                ? "bg-amber-50 text-amber-700"
                : "text-stone-600 hover:bg-stone-100 hover:text-stone-900"
            )}
          >
            <Icon className="w-4 h-4 shrink-0" />
            {item.label}
          </Link>
        );
      })}
    </aside>
  );
}
