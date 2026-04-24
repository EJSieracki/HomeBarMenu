import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { formatGlassType } from "@/lib/utils";
import { ArrowLeft, GlassWater } from "lucide-react";

export default async function BartenderRecipePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await auth();
  if (!session?.user) redirect("/auth/signin");

  const staffRecord = await prisma.barStaff.findFirst({ where: { userId: session.user.id } });
  if (!staffRecord) redirect("/bartender");

  const recipe = await prisma.recipe.findUnique({
    where: { id, isPublished: true },
    include: {
      baseClassic: true,
      versions: {
        where: { isActive: true },
        include: {
          ingredients: {
            include: { ingredient: true },
            orderBy: { order: "asc" },
          },
          steps: { orderBy: { stepNumber: "asc" } },
        },
      },
    },
  });

  if (!recipe || recipe.barId !== staffRecord.barId) notFound();

  const activeVersion = recipe.versions[0];

  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <Link
          href="/bartender/recipes"
          className="inline-flex items-center gap-1 text-sm text-stone-500 hover:text-stone-700 mb-4"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to recipes
        </Link>

        <div className="flex items-center gap-2 flex-wrap">
          <h1 className="text-2xl font-bold text-stone-900">{recipe.name}</h1>
          <Badge variant="info">{formatGlassType(recipe.glassType)}</Badge>
        </div>

        {recipe.description && (
          <p className="text-stone-500 mt-2">{recipe.description}</p>
        )}

        <div className="flex items-center gap-3 mt-2 text-sm text-stone-400">
          {recipe.garnish && <span>Garnish: {recipe.garnish}</span>}
          {recipe.baseClassic && <span>Based on {recipe.baseClassic.name}</span>}
        </div>
      </div>

      {!activeVersion ? (
        <p className="text-stone-500">No active version for this recipe.</p>
      ) : (
        <>
          {/* Ingredients */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <GlassWater className="w-4 h-4 text-amber-500" />
                <h2 className="font-semibold text-stone-900">Ingredients</h2>
              </div>
            </CardHeader>
            <CardContent>
              {activeVersion.ingredients.length === 0 ? (
                <p className="text-sm text-stone-400">No ingredients listed.</p>
              ) : (
                <ul className="space-y-2">
                  {activeVersion.ingredients.map((ing) => (
                    <li key={ing.id} className="flex items-center justify-between py-1.5 border-b border-stone-100 last:border-0">
                      <div>
                        <span className="text-sm font-medium text-stone-800">{ing.ingredient.name}</span>
                        {ing.notes && (
                          <span className="text-xs text-stone-400 ml-2">({ing.notes})</span>
                        )}
                      </div>
                      <div className="text-sm text-stone-600 font-medium">
                        {ing.amount}{ing.unit ? ` ${ing.unit}` : ""}
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </CardContent>
          </Card>

          {/* Steps */}
          <Card>
            <CardHeader>
              <h2 className="font-semibold text-stone-900">Instructions</h2>
            </CardHeader>
            <CardContent>
              {activeVersion.steps.length === 0 ? (
                <p className="text-sm text-stone-400">No instructions listed.</p>
              ) : (
                <ol className="space-y-4">
                  {activeVersion.steps.map((step, idx) => (
                    <li key={step.id} className="flex gap-4">
                      <div className="w-7 h-7 rounded-full bg-amber-100 text-amber-700 text-sm font-bold flex items-center justify-center shrink-0 mt-0.5">
                        {idx + 1}
                      </div>
                      <p className="text-stone-700 leading-relaxed pt-0.5">{step.instruction}</p>
                    </li>
                  ))}
                </ol>
              )}
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
