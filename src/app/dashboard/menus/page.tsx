import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Plus, ListOrdered } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";

export default async function MenusPage() {
  const session = await auth();
  if (!session?.user) redirect("/auth/signin");

  const bar = await prisma.bar.findUnique({ where: { ownerId: session.user.id } });
  if (!bar) redirect("/onboarding");

  const menus = await prisma.menu.findMany({
    where: { barId: bar.id },
    include: { _count: { select: { items: true } } },
    orderBy: { updatedAt: "desc" },
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-stone-900">Menus</h1>
          <p className="text-sm text-stone-500 mt-0.5">{menus.length} menu{menus.length !== 1 ? "s" : ""}</p>
        </div>
        <Link href="/dashboard/menus/new">
          <Button size="sm">
            <Plus className="w-4 h-4" />
            New menu
          </Button>
        </Link>
      </div>

      {menus.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <ListOrdered className="w-12 h-12 text-stone-300 mb-4" />
          <h3 className="text-lg font-medium text-stone-700 mb-1">No menus yet</h3>
          <p className="text-sm text-stone-500 mb-6">
            Create your first menu and add cocktail recipes to it.
          </p>
          <Link href="/dashboard/menus/new">
            <Button>
              <Plus className="w-4 h-4" />
              Create your first menu
            </Button>
          </Link>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {menus.map((menu) => (
            <Link key={menu.id} href={`/dashboard/menus/${menu.id}`}>
              <Card className="hover:shadow-md transition-shadow cursor-pointer h-full">
                <CardContent className="py-5 flex flex-col gap-3">
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="font-semibold text-stone-900">{menu.name}</h3>
                    <Badge variant={menu.isPublic ? "success" : "default"}>
                      {menu.isPublic ? "Public" : "Private"}
                    </Badge>
                  </div>
                  {menu.description && (
                    <p className="text-sm text-stone-500 line-clamp-2">{menu.description}</p>
                  )}
                  <p className="text-sm text-stone-400 mt-auto">
                    {menu._count.items} recipe{menu._count.items !== 1 ? "s" : ""}
                  </p>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
