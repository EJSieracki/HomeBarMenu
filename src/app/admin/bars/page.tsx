import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { ExternalLink } from "lucide-react";

export default async function AdminBarsPage() {
  const bars = await prisma.bar.findMany({
    include: {
      owner: { select: { name: true, email: true } },
      _count: { select: { recipes: true, menus: true, staff: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-stone-900">All Bars</h1>

      <div className="space-y-3">
        {bars.map((bar) => (
          <Card key={bar.id}>
            <CardContent className="py-4 flex items-start justify-between gap-4 flex-wrap">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-semibold text-stone-900">{bar.name}</h3>
                  <Link
                    href={`/bar/${bar.slug}`}
                    target="_blank"
                    className="text-stone-400 hover:text-amber-500"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                  </Link>
                </div>
                <p className="text-sm text-stone-400">/{bar.slug}</p>
                <p className="text-sm text-stone-500 mt-0.5">
                  Owner: {bar.owner.name ?? bar.owner.email}
                </p>
              </div>
              <div className="flex gap-4 text-sm text-stone-500">
                <span>{bar._count.recipes} recipes</span>
                <span>{bar._count.menus} menus</span>
                <span>{bar._count.staff} bartenders</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
