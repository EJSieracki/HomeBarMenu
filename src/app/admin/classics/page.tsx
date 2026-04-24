import { prisma } from "@/lib/prisma";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatGlassType } from "@/lib/utils";
import { AdminClassicsManager } from "./classics-manager";

export default async function AdminClassicsPage() {
  const classics = await prisma.classicCocktail.findMany({
    orderBy: { name: "asc" },
  });

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <h1 className="text-2xl font-bold text-stone-900">Classic Cocktails</h1>
        <p className="text-sm text-stone-500 mt-0.5">
          Manage the global library of classic cocktails available to all creators.
        </p>
      </div>

      <AdminClassicsManager classics={classics} />
    </div>
  );
}
