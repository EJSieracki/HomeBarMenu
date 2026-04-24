"use server";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import type { GlassType } from "@prisma/client";

// ─── Schema ──────────────────────────────────────────────────────────────────

const recipeSchema = z.object({
  name: z.string().min(1, "Recipe name is required"),
  description: z.string().optional(),
  glassType: z.string(),
  garnish: z.string().optional(),
  baseClassicId: z.string().optional(),
  clonedFromRecipeId: z.string().optional(),
});

const versionSchema = z.object({
  name: z.string().optional(),
  notes: z.string().optional(),
});

// ─── Helpers ─────────────────────────────────────────────────────────────────

async function getCreatorBar(userId: string) {
  return prisma.bar.findUnique({ where: { ownerId: userId } });
}

async function assertRecipeOwnership(recipeId: string, barId: string) {
  const recipe = await prisma.recipe.findUnique({ where: { id: recipeId } });
  if (!recipe || recipe.barId !== barId) throw new Error("Not found");
  return recipe;
}

// ─── Create Recipe ────────────────────────────────────────────────────────────

export async function createRecipeAction(formData: FormData) {
  const session = await auth();
  if (!session?.user?.id) return { error: "Unauthorized" };

  const bar = await getCreatorBar(session.user.id);
  if (!bar) return { error: "Bar not found" };

  const parsed = recipeSchema.safeParse({
    name: formData.get("name"),
    description: formData.get("description") || undefined,
    glassType: formData.get("glassType"),
    garnish: formData.get("garnish") || undefined,
    baseClassicId: formData.get("baseClassicId") || undefined,
    clonedFromRecipeId: formData.get("clonedFromRecipeId") || undefined,
  });

  if (!parsed.success) return { error: parsed.error.issues[0].message };

  const recipe = await prisma.recipe.create({
    data: {
      barId: bar.id,
      name: parsed.data.name,
      description: parsed.data.description,
      glassType: parsed.data.glassType as GlassType,
      garnish: parsed.data.garnish,
      baseClassicId: parsed.data.baseClassicId,
      clonedFromRecipeId: parsed.data.clonedFromRecipeId,
      createdById: session.user.id,
    },
  });

  // Create initial version
  await prisma.recipeVersion.create({
    data: {
      recipeId: recipe.id,
      versionNumber: 1,
      name: "Version 1",
      isActive: true,
      createdById: session.user.id,
    },
  });

  redirect(`/dashboard/recipes/${recipe.id}`);
}

export async function cloneRecipeAction(recipeId: string) {
  const session = await auth();
  if (!session?.user?.id) return { error: "Unauthorized" };

  const bar = await getCreatorBar(session.user.id);
  if (!bar) return { error: "Bar not found" };

  const source = await prisma.recipe.findUnique({
    where: { id: recipeId },
    include: {
      versions: {
        where: { isActive: true },
        include: { ingredients: true, steps: true },
      },
    },
  });

  if (!source) return { error: "Recipe not found" };

  const cloned = await prisma.recipe.create({
    data: {
      barId: bar.id,
      name: `${source.name} (copy)`,
      description: source.description,
      glassType: source.glassType,
      garnish: source.garnish,
      clonedFromRecipeId: source.id,
      createdById: session.user.id,
    },
  });

  const sourceVersion = source.versions[0];
  if (sourceVersion) {
    await prisma.recipeVersion.create({
      data: {
        recipeId: cloned.id,
        versionNumber: 1,
        name: "Version 1",
        isActive: true,
        createdById: session.user.id,
        ingredients: {
          create: sourceVersion.ingredients.map((i) => ({
            ingredientId: i.ingredientId,
            amount: i.amount,
            unit: i.unit,
            order: i.order,
            notes: i.notes,
          })),
        },
        steps: {
          create: sourceVersion.steps.map((s) => ({
            stepNumber: s.stepNumber,
            instruction: s.instruction,
          })),
        },
      },
    });
  }

  redirect(`/dashboard/recipes/${cloned.id}`);
}

export async function updateRecipeAction(recipeId: string, formData: FormData) {
  const session = await auth();
  if (!session?.user?.id) return { error: "Unauthorized" };

  const bar = await getCreatorBar(session.user.id);
  if (!bar) return { error: "Bar not found" };

  await assertRecipeOwnership(recipeId, bar.id);

  const parsed = recipeSchema.safeParse({
    name: formData.get("name"),
    description: formData.get("description") || undefined,
    glassType: formData.get("glassType"),
    garnish: formData.get("garnish") || undefined,
  });

  if (!parsed.success) return { error: parsed.error.issues[0].message };

  await prisma.recipe.update({
    where: { id: recipeId },
    data: {
      name: parsed.data.name,
      description: parsed.data.description,
      glassType: parsed.data.glassType as GlassType,
      garnish: parsed.data.garnish,
    },
  });

  revalidatePath(`/dashboard/recipes/${recipeId}`);
  return { success: true };
}

export async function publishRecipeAction(recipeId: string, published: boolean) {
  const session = await auth();
  if (!session?.user?.id) return { error: "Unauthorized" };

  const bar = await getCreatorBar(session.user.id);
  if (!bar) return { error: "Bar not found" };

  await assertRecipeOwnership(recipeId, bar.id);

  await prisma.recipe.update({
    where: { id: recipeId },
    data: { isPublished: published },
  });

  revalidatePath(`/dashboard/recipes/${recipeId}`);
  revalidatePath("/dashboard/recipes");
  return { success: true };
}

export async function deleteRecipeAction(recipeId: string) {
  const session = await auth();
  if (!session?.user?.id) return { error: "Unauthorized" };

  const bar = await getCreatorBar(session.user.id);
  if (!bar) return { error: "Bar not found" };

  await assertRecipeOwnership(recipeId, bar.id);
  await prisma.recipe.delete({ where: { id: recipeId } });

  revalidatePath("/dashboard/recipes");
  redirect("/dashboard/recipes");
}

// ─── Versions ─────────────────────────────────────────────────────────────────

export async function createVersionAction(recipeId: string, formData: FormData) {
  const session = await auth();
  if (!session?.user?.id) return { error: "Unauthorized" };

  const bar = await getCreatorBar(session.user.id);
  if (!bar) return { error: "Bar not found" };

  await assertRecipeOwnership(recipeId, bar.id);

  const parsed = versionSchema.safeParse({
    name: formData.get("name") || undefined,
    notes: formData.get("notes") || undefined,
  });

  if (!parsed.success) return { error: parsed.error.issues[0].message };

  const lastVersion = await prisma.recipeVersion.findFirst({
    where: { recipeId },
    orderBy: { versionNumber: "desc" },
    include: { ingredients: true, steps: true },
  });

  const versionNumber = (lastVersion?.versionNumber ?? 0) + 1;

  await prisma.recipeVersion.create({
    data: {
      recipeId,
      versionNumber,
      name: parsed.data.name ?? `Version ${versionNumber}`,
      notes: parsed.data.notes,
      isActive: false,
      createdById: session.user.id,
      // Copy ingredients and steps from last version
      ingredients: lastVersion
        ? {
            create: lastVersion.ingredients.map((i) => ({
              ingredientId: i.ingredientId,
              amount: i.amount,
              unit: i.unit,
              order: i.order,
              notes: i.notes,
            })),
          }
        : undefined,
      steps: lastVersion
        ? {
            create: lastVersion.steps.map((s) => ({
              stepNumber: s.stepNumber,
              instruction: s.instruction,
            })),
          }
        : undefined,
    },
  });

  revalidatePath(`/dashboard/recipes/${recipeId}`);
  return { success: true };
}

export async function setActiveVersionAction(versionId: string, recipeId: string) {
  const session = await auth();
  if (!session?.user?.id) return { error: "Unauthorized" };

  const bar = await getCreatorBar(session.user.id);
  if (!bar) return { error: "Bar not found" };

  await assertRecipeOwnership(recipeId, bar.id);

  await prisma.$transaction([
    prisma.recipeVersion.updateMany({
      where: { recipeId },
      data: { isActive: false },
    }),
    prisma.recipeVersion.update({
      where: { id: versionId },
      data: { isActive: true },
    }),
  ]);

  revalidatePath(`/dashboard/recipes/${recipeId}`);
  return { success: true };
}

export async function saveVersionIngredientsAction(
  versionId: string,
  recipeId: string,
  ingredients: Array<{
    ingredientId: string;
    amount: string;
    unit?: string;
    order: number;
    notes?: string;
  }>
) {
  const session = await auth();
  if (!session?.user?.id) return { error: "Unauthorized" };

  const bar = await getCreatorBar(session.user.id);
  if (!bar) return { error: "Bar not found" };

  await assertRecipeOwnership(recipeId, bar.id);

  await prisma.$transaction([
    prisma.recipeVersionIngredient.deleteMany({ where: { recipeVersionId: versionId } }),
    ...ingredients.map((ing) =>
      prisma.recipeVersionIngredient.create({
        data: {
          recipeVersionId: versionId,
          ingredientId: ing.ingredientId,
          amount: ing.amount,
          unit: ing.unit,
          order: ing.order,
          notes: ing.notes,
        },
      })
    ),
  ]);

  revalidatePath(`/dashboard/recipes/${recipeId}`);
  return { success: true };
}

export async function saveVersionStepsAction(
  versionId: string,
  recipeId: string,
  steps: Array<{ stepNumber: number; instruction: string }>
) {
  const session = await auth();
  if (!session?.user?.id) return { error: "Unauthorized" };

  const bar = await getCreatorBar(session.user.id);
  if (!bar) return { error: "Bar not found" };

  await assertRecipeOwnership(recipeId, bar.id);

  await prisma.$transaction([
    prisma.recipeVersionStep.deleteMany({ where: { recipeVersionId: versionId } }),
    ...steps.map((s) =>
      prisma.recipeVersionStep.create({
        data: {
          recipeVersionId: versionId,
          stepNumber: s.stepNumber,
          instruction: s.instruction,
        },
      })
    ),
  ]);

  revalidatePath(`/dashboard/recipes/${recipeId}`);
  return { success: true };
}
