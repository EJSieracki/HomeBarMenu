import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { IngredientsManager } from "./ingredients-manager";

export default async function IngredientsPage() {
  const session = await auth();
  if (!session?.user) redirect("/auth/signin");

  const bar = await prisma.bar.findUnique({ where: { ownerId: session.user.id } });
  if (!bar) redirect("/onboarding");

  const [barIngredients, globalIngredients] = await Promise.all([
    prisma.ingredient.findMany({
      where: { barId: bar.id },
      orderBy: [{ category: "asc" }, { name: "asc" }],
    }),
    prisma.ingredient.findMany({
      where: { isGlobal: true },
      orderBy: [{ category: "asc" }, { name: "asc" }],
    }),
  ]);

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <h1 className="text-2xl font-bold text-stone-900">Ingredients</h1>
        <p className="text-sm text-stone-500 mt-0.5">
          Manage your bar&apos;s ingredient library. Global ingredients are available to all bars.
        </p>
      </div>
      <IngredientsManager barIngredients={barIngredients} globalIngredients={globalIngredients} />
    </div>
  );
}
