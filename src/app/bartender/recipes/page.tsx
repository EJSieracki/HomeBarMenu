import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatGlassType } from "@/lib/utils";
import { BookOpen } from "lucide-react";

export default async function BartenderRecipesPage() {
  const session = await auth();
  if (!session?.user) redirect("/auth/signin");

  const staffRecord = await prisma.barStaff.findFirst({
    where: { userId: session.user.id },
  });

  if (!staffRecord) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <BookOpen className="w-12 h-12 text-stone-300 mb-4" />
        <h3 className="text-lg font-medium text-stone-700 mb-1">No bar assigned</h3>
        <p className="text-sm text-stone-500">
          Ask your bar creator to add you to their team.
        </p>
      </div>
    );
  }

  const recipes = await prisma.recipe.findMany({
    where: { barId: staffRecord.barId, isPublished: true },
    include: {
      versions: {
        where: { isActive: true },
        include: { _count: { select: { ingredients: true, steps: true } } },
      },
    },
    orderBy: { name: "asc" },
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-stone-900">Recipes</h1>
        <p className="text-sm text-stone-500 mt-0.5">{recipes.length} published recipe{recipes.length !== 1 ? "s" : ""}</p>
      </div>

      {recipes.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <BookOpen className="w-12 h-12 text-stone-300 mb-4" />
          <p className="text-sm text-stone-500">No published recipes yet.</p>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {recipes.map((recipe) => {
            const activeVersion = recipe.versions[0];
            return (
              <Link key={recipe.id} href={`/bartender/recipes/${recipe.id}`}>
                <Card className="hover:shadow-md transition-shadow cursor-pointer h-full">
                  <CardContent className="py-5 flex flex-col gap-3">
                    <h3 className="font-semibold text-stone-900">{recipe.name}</h3>
                    {recipe.description && (
                      <p className="text-sm text-stone-500 line-clamp-2">{recipe.description}</p>
                    )}
                    <div className="flex flex-wrap gap-1.5 mt-auto">
                      <Badge variant="info">{formatGlassType(recipe.glassType)}</Badge>
                      {activeVersion && (
                        <>
                          <Badge>{activeVersion._count.ingredients} ingredient{activeVersion._count.ingredients !== 1 ? "s" : ""}</Badge>
                          <Badge>{activeVersion._count.steps} step{activeVersion._count.steps !== 1 ? "s" : ""}</Badge>
                        </>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
