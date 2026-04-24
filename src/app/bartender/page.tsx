import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import Link from "next/link";
import { BookOpen } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default async function BartenderHomePage() {
  const session = await auth();
  if (!session?.user) redirect("/auth/signin");

  const staffRecord = await prisma.barStaff.findFirst({
    where: { userId: session.user.id },
    include: {
      bar: {
        include: { _count: { select: { recipes: { where: { isPublished: true } } } } },
      },
    },
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-stone-900">
          {staffRecord ? `Welcome to ${staffRecord.bar.name}` : "Welcome"}
        </h1>
        <p className="text-sm text-stone-500 mt-0.5">
          {staffRecord
            ? "Browse and learn the cocktail recipes for your bar."
            : "You haven't been added to a bar yet. Ask your bar creator to invite you."}
        </p>
      </div>

      {staffRecord && (
        <Card>
          <CardContent className="py-5 flex items-center gap-4">
            <div className="w-10 h-10 rounded-lg bg-amber-100 flex items-center justify-center">
              <BookOpen className="w-5 h-5 text-amber-600" />
            </div>
            <div className="flex-1">
              <div className="text-2xl font-bold text-stone-900">
                {staffRecord.bar._count.recipes}
              </div>
              <div className="text-sm text-stone-500">Published recipes</div>
            </div>
            <Link href="/bartender/recipes">
              <Button variant="secondary" size="sm">View all</Button>
            </Link>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
