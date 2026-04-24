"use server";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";

const menuSchema = z.object({
  name: z.string().min(1, "Menu name is required"),
  description: z.string().optional(),
  isPublic: z.boolean().default(false),
});

async function getCreatorBar(userId: string) {
  return prisma.bar.findUnique({ where: { ownerId: userId } });
}

export async function createMenuAction(formData: FormData) {
  const session = await auth();
  if (!session?.user?.id) return { error: "Unauthorized" };

  const bar = await getCreatorBar(session.user.id);
  if (!bar) return { error: "Bar not found" };

  const parsed = menuSchema.safeParse({
    name: formData.get("name"),
    description: formData.get("description") || undefined,
    isPublic: formData.get("isPublic") === "on",
  });

  if (!parsed.success) return { error: parsed.error.issues[0].message };

  const menu = await prisma.menu.create({
    data: {
      barId: bar.id,
      name: parsed.data.name,
      description: parsed.data.description,
      isPublic: parsed.data.isPublic,
    },
  });

  redirect(`/dashboard/menus/${menu.id}`);
}

export async function updateMenuAction(menuId: string, formData: FormData) {
  const session = await auth();
  if (!session?.user?.id) return { error: "Unauthorized" };

  const bar = await getCreatorBar(session.user.id);
  if (!bar) return { error: "Bar not found" };

  const menu = await prisma.menu.findUnique({ where: { id: menuId } });
  if (!menu || menu.barId !== bar.id) return { error: "Not found" };

  const parsed = menuSchema.safeParse({
    name: formData.get("name"),
    description: formData.get("description") || undefined,
    isPublic: formData.get("isPublic") === "on",
  });

  if (!parsed.success) return { error: parsed.error.issues[0].message };

  await prisma.menu.update({
    where: { id: menuId },
    data: parsed.data,
  });

  revalidatePath(`/dashboard/menus/${menuId}`);
  return { success: true };
}

export async function deleteMenuAction(menuId: string) {
  const session = await auth();
  if (!session?.user?.id) return { error: "Unauthorized" };

  const bar = await getCreatorBar(session.user.id);
  if (!bar) return { error: "Bar not found" };

  const menu = await prisma.menu.findUnique({ where: { id: menuId } });
  if (!menu || menu.barId !== bar.id) return { error: "Not found" };

  await prisma.menu.delete({ where: { id: menuId } });
  revalidatePath("/dashboard/menus");
  redirect("/dashboard/menus");
}

export async function addRecipeToMenuAction(menuId: string, recipeId: string) {
  const session = await auth();
  if (!session?.user?.id) return { error: "Unauthorized" };

  const bar = await getCreatorBar(session.user.id);
  if (!bar) return { error: "Bar not found" };

  const menu = await prisma.menu.findUnique({ where: { id: menuId } });
  if (!menu || menu.barId !== bar.id) return { error: "Not found" };

  const count = await prisma.menuItem.count({ where: { menuId } });

  await prisma.menuItem.create({
    data: { menuId, recipeId, order: count + 1 },
  });

  revalidatePath(`/dashboard/menus/${menuId}`);
  return { success: true };
}

export async function removeRecipeFromMenuAction(menuId: string, recipeId: string) {
  const session = await auth();
  if (!session?.user?.id) return { error: "Unauthorized" };

  const bar = await getCreatorBar(session.user.id);
  if (!bar) return { error: "Bar not found" };

  await prisma.menuItem.deleteMany({ where: { menuId, recipeId } });
  revalidatePath(`/dashboard/menus/${menuId}`);
  return { success: true };
}
