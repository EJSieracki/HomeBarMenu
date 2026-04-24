"use server";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { slugify } from "@/lib/utils";
import { z } from "zod";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";

const barSchema = z.object({
  name: z.string().min(2, "Bar name must be at least 2 characters"),
  description: z.string().optional(),
});

export async function createBarAction(formData: FormData) {
  const session = await auth();
  if (!session?.user?.id || session.user.role !== "CREATOR") {
    return { error: "Unauthorized" };
  }

  const parsed = barSchema.safeParse({
    name: formData.get("name"),
    description: formData.get("description") || undefined,
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0].message };
  }

  const { name, description } = parsed.data;

  // Check if user already has a bar
  const existing = await prisma.bar.findUnique({
    where: { ownerId: session.user.id },
  });
  if (existing) {
    return { error: "You already have a bar." };
  }

  // Generate unique slug
  let slug = slugify(name);
  const slugExists = await prisma.bar.findUnique({ where: { slug } });
  if (slugExists) {
    slug = `${slug}-${Date.now().toString(36)}`;
  }

  await prisma.bar.create({
    data: {
      name,
      slug,
      description,
      ownerId: session.user.id,
    },
  });

  redirect("/dashboard");
}

export async function updateBarAction(formData: FormData) {
  const session = await auth();
  if (!session?.user?.id) return { error: "Unauthorized" };

  const bar = await prisma.bar.findUnique({
    where: { ownerId: session.user.id },
  });
  if (!bar) return { error: "Bar not found" };

  const parsed = barSchema.safeParse({
    name: formData.get("name"),
    description: formData.get("description") || undefined,
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0].message };
  }

  await prisma.bar.update({
    where: { id: bar.id },
    data: {
      name: parsed.data.name,
      description: parsed.data.description,
    },
  });

  revalidatePath("/dashboard/settings");
  return { success: true };
}

export async function inviteBartenderAction(formData: FormData) {
  const session = await auth();
  if (!session?.user?.id || session.user.role !== "CREATOR") {
    return { error: "Unauthorized" };
  }

  const bar = await prisma.bar.findUnique({
    where: { ownerId: session.user.id },
  });
  if (!bar) return { error: "Bar not found" };

  const email = formData.get("email") as string;
  if (!email) return { error: "Email is required" };

  const bartender = await prisma.user.findUnique({ where: { email } });
  if (!bartender) return { error: "No user found with that email." };
  if (bartender.role !== "BARTENDER") return { error: "That user is not a bartender." };

  const existing = await prisma.barStaff.findUnique({
    where: { barId_userId: { barId: bar.id, userId: bartender.id } },
  });
  if (existing) return { error: "That bartender is already on your team." };

  await prisma.barStaff.create({
    data: { barId: bar.id, userId: bartender.id },
  });

  revalidatePath("/dashboard/settings");
  return { success: true };
}
