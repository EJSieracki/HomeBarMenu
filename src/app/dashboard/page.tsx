import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import Link from "next/link";
import { BookOpen, ListOrdered, Users, ExternalLink, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export default async function DashboardPage() {
  const session = await auth();
  if (!session?.user) redirect("/auth/signin");

  const bar = await prisma.bar.findUnique({
    where: { ownerId: session.user.id },
    include: {
      _count: {
        select: {
          recipes: true,
          menus: true,
          staff: true,
        },
      },
    },
  });

  if (!bar) redirect("/onboarding");

  const stats = [
    {
      label: "Recipes",
      value: bar._count.recipes,
      icon: BookOpen,
      href: "/dashboard/recipes",
      color: "text-amber-600 bg-amber-50",
    },
    {
      label: "Menus",
      value: bar._count.menus,
      icon: ListOrdered,
      href: "/dashboard/menus",
      color: "text-blue-600 bg-blue-50",
    },
    {
      label: "Bartenders",
      value: bar._count.staff,
      icon: Users,
      href: "/dashboard/settings",
      color: "text-green-600 bg-green-50",
    },
  ];

  return (
    <div className="space-y-8">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-stone-900">{bar.name}</h1>
          <p className="text-sm text-stone-500 mt-1">
            Public menu:{" "}
            <Link
              href={`/bar/${bar.slug}`}
              className="text-amber-600 hover:underline inline-flex items-center gap-1"
              target="_blank"
            >
              /bar/{bar.slug}
              <ExternalLink className="w-3 h-3" />
            </Link>
          </p>
        </div>
        <Link href="/dashboard/recipes/new">
          <Button size="sm">
            <Plus className="w-4 h-4" />
            New recipe
          </Button>
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {stats.map((s) => {
          const Icon = s.icon;
          return (
            <Link key={s.label} href={s.href}>
              <Card className="hover:shadow-md transition-shadow cursor-pointer">
                <CardContent className="flex items-center gap-4 py-5">
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${s.color}`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-stone-900">{s.value}</div>
                    <div className="text-sm text-stone-500">{s.label}</div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          );
        })}
      </div>

      {/* Quick links */}
      <div className="grid sm:grid-cols-2 gap-4">
        <Card>
          <CardContent className="py-5">
            <h3 className="font-semibold text-stone-900 mb-3">Quick actions</h3>
            <div className="space-y-2">
              <Link
                href="/dashboard/recipes/new"
                className="flex items-center gap-2 text-sm text-stone-600 hover:text-amber-600 transition-colors"
              >
                <Plus className="w-4 h-4" />
                Create a new recipe
              </Link>
              <Link
                href="/dashboard/menus/new"
                className="flex items-center gap-2 text-sm text-stone-600 hover:text-amber-600 transition-colors"
              >
                <Plus className="w-4 h-4" />
                Create a new menu
              </Link>
              <Link
                href="/dashboard/ingredients"
                className="flex items-center gap-2 text-sm text-stone-600 hover:text-amber-600 transition-colors"
              >
                <Plus className="w-4 h-4" />
                Add an ingredient
              </Link>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="py-5">
            <h3 className="font-semibold text-stone-900 mb-3">Your bar</h3>
            {bar.description && (
              <p className="text-sm text-stone-500 mb-3">{bar.description}</p>
            )}
            <Link href="/dashboard/settings">
              <Button variant="secondary" size="sm">
                Edit bar settings
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
