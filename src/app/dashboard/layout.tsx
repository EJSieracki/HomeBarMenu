import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { Shell } from "@/components/layout/shell";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  if (!session?.user) redirect("/auth/signin");
  if (session.user.role !== "CREATOR" && session.user.role !== "ADMIN") {
    redirect("/bartender");
  }

  // Ensure creator has a bar (redirect to onboarding if not)
  if (session.user.role === "CREATOR") {
    const bar = await prisma.bar.findUnique({
      where: { ownerId: session.user.id },
    });
    if (!bar) redirect("/onboarding");
  }

  return <Shell role={session.user.role === "ADMIN" ? "ADMIN" : "CREATOR"}>{children}</Shell>;
}
