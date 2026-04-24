import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { GlassWater, Users, BookOpen, ChefHat } from "lucide-react";

export default async function AdminPage() {
  const [barCount, userCount, recipeCount, classicCount] = await Promise.all([
    prisma.bar.count(),
    prisma.user.count(),
    prisma.recipe.count(),
    prisma.classicCocktail.count(),
  ]);

  const stats = [
    { label: "Bars", value: barCount, icon: GlassWater, href: "/admin/bars", color: "text-amber-600 bg-amber-50" },
    { label: "Users", value: userCount, icon: Users, href: "/admin/users", color: "text-blue-600 bg-blue-50" },
    { label: "Recipes", value: recipeCount, icon: BookOpen, href: "/admin/bars", color: "text-green-600 bg-green-50" },
    { label: "Classic cocktails", value: classicCount, icon: ChefHat, href: "/admin/classics", color: "text-purple-600 bg-purple-50" },
  ];

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-stone-900">Admin Overview</h1>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((s) => {
          const Icon = s.icon;
          return (
            <Link key={s.label} href={s.href}>
              <Card className="hover:shadow-md transition-shadow cursor-pointer">
                <CardContent className="py-5 flex flex-col gap-2">
                  <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${s.color}`}>
                    <Icon className="w-4 h-4" />
                  </div>
                  <div className="text-2xl font-bold text-stone-900">{s.value}</div>
                  <div className="text-sm text-stone-500">{s.label}</div>
                </CardContent>
              </Card>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
