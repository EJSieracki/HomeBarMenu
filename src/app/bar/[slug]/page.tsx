import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import Link from "next/link";
import { Navbar } from "@/components/layout/navbar";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { GlassWater, ListOrdered } from "lucide-react";

export default async function BarPublicPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;

  const bar = await prisma.bar.findUnique({
    where: { slug },
    include: {
      menus: {
        where: { isPublic: true },
        include: { _count: { select: { items: true } } },
        orderBy: { updatedAt: "desc" },
      },
    },
  });

  if (!bar) notFound();

  return (
    <div className="min-h-screen flex flex-col bg-stone-50">
      <Navbar />

      <main className="flex-1 max-w-4xl mx-auto w-full px-4 sm:px-6 py-12">
        {/* Bar header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-amber-100 mb-4">
            <GlassWater className="w-8 h-8 text-amber-600" />
          </div>
          <h1 className="text-4xl font-bold text-stone-900">{bar.name}</h1>
          {bar.description && (
            <p className="mt-3 text-lg text-stone-500 max-w-xl mx-auto">{bar.description}</p>
          )}
        </div>

        {/* Menus */}
        {bar.menus.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <ListOrdered className="w-12 h-12 text-stone-300 mb-4" />
            <p className="text-stone-500">No public menus available yet.</p>
          </div>
        ) : (
          <div>
            <h2 className="text-xl font-semibold text-stone-900 mb-6">Our menus</h2>
            <div className="grid sm:grid-cols-2 gap-4">
              {bar.menus.map((menu) => (
                <Link key={menu.id} href={`/bar/${slug}/menu/${menu.id}`}>
                  <Card className="hover:shadow-md transition-shadow cursor-pointer h-full">
                    <CardContent className="py-6 flex flex-col gap-2">
                      <h3 className="text-lg font-semibold text-stone-900">{menu.name}</h3>
                      {menu.description && (
                        <p className="text-sm text-stone-500">{menu.description}</p>
                      )}
                      <p className="text-sm text-stone-400 mt-auto">
                        {menu._count.items} cocktail{menu._count.items !== 1 ? "s" : ""}
                      </p>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          </div>
        )}
      </main>

      <footer className="border-t border-stone-200 py-6 px-4">
        <div className="max-w-4xl mx-auto flex items-center justify-center gap-1.5 text-sm text-stone-400">
          <GlassWater className="w-4 h-4 text-amber-400" />
          <span>Powered by HomeBarMenu</span>
        </div>
      </footer>
    </div>
  );
}
