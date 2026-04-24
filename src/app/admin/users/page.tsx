import { prisma } from "@/lib/prisma";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const ROLE_VARIANT: Record<string, "default" | "success" | "warning" | "info" | "danger"> = {
  ADMIN: "danger",
  CREATOR: "warning",
  BARTENDER: "info",
};

export default async function AdminUsersPage() {
  const users = await prisma.user.findMany({
    include: {
      bar: { select: { name: true, slug: true } },
      bartenderAt: { include: { bar: { select: { name: true } } } },
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-stone-900">All Users</h1>

      <div className="space-y-2">
        {users.map((user) => (
          <Card key={user.id}>
            <CardContent className="py-3 flex items-center justify-between gap-4 flex-wrap">
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-medium text-stone-900">{user.name ?? "—"}</span>
                  <Badge variant={ROLE_VARIANT[user.role]}>{user.role}</Badge>
                </div>
                <p className="text-sm text-stone-400">{user.email}</p>
                {user.bar && (
                  <p className="text-xs text-stone-400 mt-0.5">Bar owner: {user.bar.name}</p>
                )}
                {user.bartenderAt.length > 0 && (
                  <p className="text-xs text-stone-400 mt-0.5">
                    Bartender at: {user.bartenderAt.map((b) => b.bar.name).join(", ")}
                  </p>
                )}
              </div>
              <span className="text-xs text-stone-400">
                {new Date(user.createdAt).toLocaleDateString()}
              </span>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
