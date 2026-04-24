import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { BarSettingsForm } from "./bar-settings-form";

export default async function SettingsPage() {
  const session = await auth();
  if (!session?.user) redirect("/auth/signin");

  const bar = await prisma.bar.findUnique({
    where: { ownerId: session.user.id },
    include: {
      staff: { include: { user: { select: { id: true, name: true, email: true } } } },
    },
  });

  if (!bar) redirect("/onboarding");

  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-stone-900">Bar Settings</h1>
        <p className="text-sm text-stone-500 mt-0.5">Manage your bar profile and team.</p>
      </div>
      <BarSettingsForm bar={bar} staff={bar.staff} />
    </div>
  );
}
