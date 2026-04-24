import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { redirect, notFound } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { formatGlassType } from "@/lib/utils";
import { RecipeEditor } from "./recipe-editor";

export default async function RecipePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await auth();
  if (!session?.user) redirect("/auth/signin");

  const bar = await prisma.bar.findUnique({ where: { ownerId: session.user.id } });
  if (!bar) redirect("/onboarding");

  const recipe = await prisma.recipe.findUnique({
    where: { id },
    include: {
      baseClassic: true,
      clonedFrom: { select: { id: true, name: true } },
      versions: {
        include: {
          ingredients: {
            include: { ingredient: true },
            orderBy: { order: "asc" },
          },
          steps: { orderBy: { stepNumber: "asc" } },
          createdBy: { select: { name: true } },
        },
        orderBy: { versionNumber: "asc" },
      },
    },
  });

  if (!recipe || recipe.barId !== bar.id) notFound();

  const barIngredients = await prisma.ingredient.findMany({
    where: { OR: [{ barId: bar.id }, { isGlobal: true }] },
    orderBy: [{ category: "asc" }, { name: "asc" }],
  });

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <h1 className="text-2xl font-bold text-stone-900">{recipe.name}</h1>
            <Badge variant={recipe.isPublished ? "success" : "default"}>
              {recipe.isPublished ? "Published" : "Draft"}
            </Badge>
          </div>
          <div className="flex items-center gap-2 mt-1 flex-wrap">
            <span className="text-sm text-stone-500">{formatGlassType(recipe.glassType)}</span>
            {recipe.garnish && (
              <span className="text-sm text-stone-500">· {recipe.garnish}</span>
            )}
            {recipe.baseClassic && (
              <Badge variant="warning" className="text-xs">
                Based on {recipe.baseClassic.name}
              </Badge>
            )}
            {recipe.clonedFrom && (
              <Badge className="text-xs">
                Cloned from {recipe.clonedFrom.name}
              </Badge>
            )}
          </div>
        </div>
      </div>

      <RecipeEditor
        recipe={recipe}
        versions={recipe.versions}
        barIngredients={barIngredients}
      />
    </div>
  );
}
