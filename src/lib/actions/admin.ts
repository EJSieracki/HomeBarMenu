"use server";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";
import { revalidatePath } from "next/cache";
import type { GlassType } from "@prisma/client";

async function assertAdmin() {
  const session = await auth();
  if (!session?.user || session.user.role !== "ADMIN") {
    throw new Error("Unauthorized");
  }
  return session;
}

export async function createClassicAction(formData: FormData) {
  try {
    await assertAdmin();
  } catch {
    return { error: "Unauthorized" };
  }

  const schema = z.object({
    name: z.string().min(1, "Name is required"),
    description: z.string().optional(),
    glassType: z.string(),
    garnish: z.string().optional(),
  });

  const parsed = schema.safeParse({
    name: formData.get("name"),
    description: formData.get("description") || undefined,
    glassType: formData.get("glassType"),
    garnish: formData.get("garnish") || undefined,
  });

  if (!parsed.success) return { error: parsed.error.issues[0].message };

  const existing = await prisma.classicCocktail.findUnique({
    where: { name: parsed.data.name },
  });
  if (existing) return { error: "A classic cocktail with that name already exists." };

  const classic = await prisma.classicCocktail.create({
    data: {
      name: parsed.data.name,
      description: parsed.data.description,
      glassType: parsed.data.glassType as GlassType,
      garnish: parsed.data.garnish,
    },
  });

  revalidatePath("/admin/classics");
  return { success: true, classic };
}

export async function deleteClassicAction(id: string) {
  try {
    await assertAdmin();
  } catch {
    return { error: "Unauthorized" };
  }

  await prisma.classicCocktail.delete({ where: { id } });
  revalidatePath("/admin/classics");
  return { success: true };
}
