import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import Link from "next/link";
import { Navbar } from "@/components/layout/navbar";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { GlassWater, ArrowLeft } from "lucide-react";
import { formatGlassType } from "@/lib/utils";

export default async function PublicMenuPage({
  params,
}: {
  params: Promise<{ slug: string; menuId: string }>;
}) {
  const { slug, menuId } = await params;

  const bar = await prisma.bar.findUnique({ where: { slug } });
  if (!bar) notFound();

  const menu = await prisma.menu.findUnique({
    where: { id: menuId, barId: bar.id, isPublic: true },
    include: {
      items: {
        include: {
          recipe: {
            include: {
              versions: {
                where: { isActive: true },
                include: {
                  ingredients: {
                    include: { ingredient: true },
                    orderBy: { order: "asc" },
                  },
                },
              },
            },
          },
        },
        orderBy: { order: "asc" },
      },
    },
  });

  if (!menu) notFound();

  return (
    <div className="min-h-screen flex flex-col bg-stone-50">
      <Navbar />

      <main className="flex-1 max-w-4xl mx-auto w-full px-4 sm:px-6 py-12">
        {/* Breadcrumb */}
        <Link
          href={`/bar/${slug}`}
          className="inline-flex items-center gap-1 text-sm text-stone-500 hover:text-stone-700 mb-8"
        >
          <ArrowLeft className="w-4 h-4" />
          {bar.name}
        </Link>

        {/* Menu header */}
        <div className="mb-10">
          <h1 className="text-3xl font-bold text-stone-900">{menu.name}</h1>
          {menu.description && (
            <p className="mt-2 text-stone-500">{menu.description}</p>
          )}
          <p className="mt-1 text-sm text-stone-400">
            {menu.items.length} cocktail{menu.items.length !== 1 ? "s" : ""}
          </p>
        </div>

        {/* Cocktail list */}
        {menu.items.length === 0 ? (
          <p className="text-stone-500 text-center py-12">No cocktails on this menu yet.</p>
        ) : (
          <div className="space-y-4">
            {menu.items.map((item) => {
              const recipe = item.recipe;
              const activeVersion = recipe.versions[0];

              return (
                <Card key={item.id}>
                  <CardContent className="py-5">
                    <div className="flex items-start justify-between gap-4 flex-wrap">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h3 className="text-lg font-semibold text-stone-900">
                            {recipe.name}
                          </h3>
                          <Badge variant="info">{formatGlassType(recipe.glassType)}</Badge>
                          {recipe.garnish && (
                            <span className="text-sm text-stone-400">Garnish: {recipe.garnish}</span>
                          )}
                        </div>

                        {recipe.description && (
                          <p className="text-sm text-stone-500 mt-1">{recipe.description}</p>
                        )}
                      </div>
                    </div>

                    {/* Ingredients */}
                    {activeVersion && activeVersion.ingredients.length > 0 && (
                      <div className="mt-4 pt-4 border-t border-stone-100">
                        <div className="flex flex-wrap gap-3">
                          {activeVersion.ingredients.map((ing) => (
                            <div key={ing.id} className="flex items-center gap-1 text-sm">
                              <span className="font-medium text-stone-700">
                                {ing.amount}{ing.unit ? ` ${ing.unit}` : ""}
                              </span>
                              <span className="text-stone-500">{ing.ingredient.name}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </main>

      <footer className="border-t border-stone-200 py-6 px-4 mt-8">
        <div className="max-w-4xl mx-auto flex items-center justify-center gap-1.5 text-sm text-stone-400">
          <GlassWater className="w-4 h-4 text-amber-400" />
          <span>Powered by HomeBarMenu</span>
        </div>
      </footer>
    </div>
  );
}
