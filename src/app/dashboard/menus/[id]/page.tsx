import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { redirect, notFound } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { MenuEditor } from "./menu-editor";

export default async function MenuDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await auth();
  if (!session?.user) redirect("/auth/signin");

  const bar = await prisma.bar.findUnique({ where: { ownerId: session.user.id } });
  if (!bar) redirect("/onboarding");

  const menu = await prisma.menu.findUnique({
    where: { id },
    include: {
      items: {
        include: { recipe: true },
        orderBy: { order: "asc" },
      },
    },
  });

  if (!menu || menu.barId !== bar.id) notFound();

  const publishedRecipes = await prisma.recipe.findMany({
    where: { barId: bar.id, isPublished: true },
    orderBy: { name: "asc" },
  });

  return (
    <div className="space-y-6 max-w-3xl">
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-stone-900">{menu.name}</h1>
            <Badge variant={menu.isPublic ? "success" : "default"}>
              {menu.isPublic ? "Public" : "Private"}
            </Badge>
          </div>
          {menu.description && (
            <p className="text-sm text-stone-500 mt-1">{menu.description}</p>
          )}
        </div>
      </div>

      <MenuEditor menu={menu} menuItems={menu.items} publishedRecipes={publishedRecipes} barSlug={bar.slug} />
    </div>
  );
}
