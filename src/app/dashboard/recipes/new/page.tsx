import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { NewRecipeForm } from "./new-recipe-form";

export default async function NewRecipePage() {
  const session = await auth();
  if (!session?.user) redirect("/auth/signin");

  const bar = await prisma.bar.findUnique({ where: { ownerId: session.user.id } });
  if (!bar) redirect("/onboarding");

  const classics = await prisma.classicCocktail.findMany({
    orderBy: { name: "asc" },
  });

  const barRecipes = await prisma.recipe.findMany({
    where: { barId: bar.id },
    select: { id: true, name: true },
    orderBy: { name: "asc" },
  });

  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-stone-900">New recipe</h1>
        <p className="text-sm text-stone-500 mt-0.5">
          Start from scratch, a classic cocktail, or clone an existing recipe.
        </p>
      </div>
      <NewRecipeForm classics={classics} barRecipes={barRecipes} />
    </div>
  );
}
