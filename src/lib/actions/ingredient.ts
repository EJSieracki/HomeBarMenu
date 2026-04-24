"use server";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";
import { revalidatePath } from "next/cache";
import type { IngredientCategory } from "@prisma/client";

const ingredientSchema = z.object({
  name: z.string().min(1, "Name is required"),
  category: z.string(),
});

async function getCreatorBar(userId: string) {
  return prisma.bar.findUnique({ where: { ownerId: userId } });
}

export async function createIngredientAction(formData: FormData) {
  const session = await auth();
  if (!session?.user?.id) return { error: "Unauthorized" };

  const bar = await getCreatorBar(session.user.id);
  if (!bar) return { error: "Bar not found" };

  const parsed = ingredientSchema.safeParse({
    name: formData.get("name"),
    category: formData.get("category"),
  });

  if (!parsed.success) return { error: parsed.error.issues[0].message };

  const existing = await prisma.ingredient.findFirst({
    where: {
      name: { equals: parsed.data.name, mode: "insensitive" },
      barId: bar.id,
    },
  });

  if (existing) return { error: "An ingredient with that name already exists." };

  const ingredient = await prisma.ingredient.create({
    data: {
      name: parsed.data.name,
      category: parsed.data.category as IngredientCategory,
      barId: bar.id,
    },
  });

  revalidatePath("/dashboard/ingredients");
  return { success: true, ingredient };
}

export async function deleteIngredientAction(ingredientId: string) {
  const session = await auth();
  if (!session?.user?.id) return { error: "Unauthorized" };

  const bar = await getCreatorBar(session.user.id);
  if (!bar) return { error: "Bar not found" };

  const ingredient = await prisma.ingredient.findUnique({ where: { id: ingredientId } });
  if (!ingredient || ingredient.barId !== bar.id) return { error: "Not found" };

  await prisma.ingredient.delete({ where: { id: ingredientId } });
  revalidatePath("/dashboard/ingredients");
  return { success: true };
}
