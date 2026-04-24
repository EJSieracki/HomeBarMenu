import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Plus, BookOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { formatGlassType } from "@/lib/utils";

export default async function RecipesPage() {
  const session = await auth();
  if (!session?.user) redirect("/auth/signin");

  const bar = await prisma.bar.findUnique({ where: { ownerId: session.user.id } });
  if (!bar) redirect("/onboarding");

  const recipes = await prisma.recipe.findMany({
    where: { barId: bar.id },
    include: {
      baseClassic: { select: { name: true } },
      clonedFrom: { select: { name: true } },
      _count: { select: { versions: true } },
    },
    orderBy: { updatedAt: "desc" },
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-stone-900">Recipes</h1>
          <p className="text-sm text-stone-500 mt-0.5">{recipes.length} recipe{recipes.length !== 1 ? "s" : ""}</p>
        </div>
        <Link href="/dashboard/recipes/new">
          <Button size="sm">
            <Plus className="w-4 h-4" />
            New recipe
          </Button>
        </Link>
      </div>

      {recipes.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <BookOpen className="w-12 h-12 text-stone-300 mb-4" />
          <h3 className="text-lg font-medium text-stone-700 mb-1">No recipes yet</h3>
          <p className="text-sm text-stone-500 mb-6">
            Start by creating a recipe from scratch or pick a classic cocktail as a base.
          </p>
          <Link href="/dashboard/recipes/new">
            <Button>
              <Plus className="w-4 h-4" />
              Create your first recipe
            </Button>
          </Link>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {recipes.map((recipe) => (
            <Link key={recipe.id} href={`/dashboard/recipes/${recipe.id}`}>
              <Card className="hover:shadow-md transition-shadow cursor-pointer h-full">
                <CardContent className="py-5 flex flex-col gap-3">
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="font-semibold text-stone-900 leading-tight">{recipe.name}</h3>
                    <Badge variant={recipe.isPublished ? "success" : "default"}>
                      {recipe.isPublished ? "Published" : "Draft"}
                    </Badge>
                  </div>

                  {recipe.description && (
                    <p className="text-sm text-stone-500 line-clamp-2">{recipe.description}</p>
                  )}

                  <div className="flex flex-wrap gap-1.5 mt-auto">
                    <Badge variant="info">{formatGlassType(recipe.glassType)}</Badge>
                    {recipe.baseClassic && (
                      <Badge variant="warning">Based on {recipe.baseClassic.name}</Badge>
                    )}
                    {recipe.clonedFrom && (
                      <Badge>Cloned from {recipe.clonedFrom.name}</Badge>
                    )}
                    <Badge>{recipe._count.versions} version{recipe._count.versions !== 1 ? "s" : ""}</Badge>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
